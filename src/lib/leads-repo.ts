import { prisma } from "@/lib/db";
import { calcularSimulacao, type SimulacaoInput } from "@/lib/simulacao";
import { TERMO_VERSAO } from "@/lib/consts";

// Serviço isolado de leads: TODA leitura/escrita do funil passa por aqui.
// Os route handlers só validam na borda e chamam estas funções — então acoplar
// ao CRM na fase 2 é estender este módulo (ex.: enfileirar CrmSyncRecord), não reescrever.

export interface ConsentContext {
  ip?: string | null;
  userAgent?: string | null;
}

/** Etapa 1 — cria o Lead DRAFT já com a simulação (antes de qualquer PII). */
export async function createLead(input: SimulacaoInput) {
  const r = calcularSimulacao(input);
  const lead = await prisma.lead.create({
    data: {
      status: "DRAFT",
      currentStep: "simulacao",
      simulacao: {
        create: {
          modalidade: r.modalidade,
          valorCarta: r.valorCarta,
          prazoMeses: r.prazoMeses,
          redutor: r.redutor,
          parcelaCheia: r.parcelaCheia,
          parcelaReduzida: r.parcelaReduzida,
          taxaAdmPct: r.taxaAdmPct,
          fundoReservaPct: r.fundoReservaPct,
        },
      },
      eventos: {
        create: { tipo: "SIMULACAO_CRIADA", meta: JSON.stringify(input) },
      },
    },
    include: { simulacao: true },
  });
  return lead;
}

/**
 * Etapa 1 (reuso) — atualiza a simulação de um DRAFT existente em vez de criar outro lead.
 * Evita a enxurrada de rascunhos duplicados no funil quando o usuário ajusta o slider e
 * volta/avança na Etapa 1. Recalcula a estimativa a partir do input (fonte da verdade).
 */
export async function updateSimulacao(id: string, input: SimulacaoInput) {
  const r = calcularSimulacao(input);
  await prisma.simulacao.update({
    where: { leadId: id },
    data: {
      modalidade: r.modalidade,
      valorCarta: r.valorCarta,
      prazoMeses: r.prazoMeses,
      redutor: r.redutor,
      parcelaCheia: r.parcelaCheia,
      parcelaReduzida: r.parcelaReduzida,
      taxaAdmPct: r.taxaAdmPct,
      fundoReservaPct: r.fundoReservaPct,
    },
  });
  return touchStep(id, "simulacao", "SIMULACAO_ATUALIZADA", input);
}

export async function getLead(id: string) {
  return prisma.lead.findUnique({
    where: { id },
    include: {
      simulacao: true,
      cadastro: true,
      qualificacao: true,
      documentos: true,
      consentimentos: true,
      eventos: { orderBy: { createdAt: "asc" } },
    },
  });
}

export async function listLeads() {
  return prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { simulacao: true, cadastro: true },
    take: 200,
  });
}

/** Etapa 2 — registra o plano escolhido. */
export async function setPlano(id: string, planoEscolhido: string) {
  await prisma.simulacao.update({
    where: { leadId: id },
    data: { planoEscolhido },
  });
  return touchStep(id, "resultado", "PLANO_ESCOLHIDO", { planoEscolhido });
}

/** Etapa 3 — dados de contato + consentimentos LGPD (append-only). */
export async function setCadastro(
  id: string,
  data: {
    nome: string;
    email: string;
    telefone: string;
    cpf?: string;
    cidade?: string;
    consentUsoContato: boolean;
    consentMarketing: boolean;
  },
  ctx: ConsentContext,
) {
  await prisma.cadastro.upsert({
    where: { leadId: id },
    create: {
      leadId: id,
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      cpf: data.cpf,
      cidade: data.cidade,
    },
    update: {
      nome: data.nome,
      email: data.email,
      telefone: data.telefone,
      cpf: data.cpf,
      cidade: data.cidade,
    },
  });

  await prisma.consentimentoLGPD.createMany({
    data: [
      consentRow(id, "USO_CONTATO", data.consentUsoContato, ctx),
      consentRow(id, "MARKETING", data.consentMarketing, ctx),
    ],
  });

  return touchStep(id, "cadastro", "CADASTRO_SALVO", null);
}

/** Etapa 4 — qualificação comercial. */
export async function setQualificacao(
  id: string,
  data: { faixaRenda: string; ocupacao: string; intencao: string; prazoCompra: string },
) {
  await prisma.qualificacao.upsert({
    where: { leadId: id },
    create: { leadId: id, ...data },
    update: data,
  });
  return touchStep(id, "qualificacao", "QUALIFICACAO_SALVA", null);
}

export async function addDocumento(
  id: string,
  doc: {
    tipo: string;
    nomeArquivo: string;
    url?: string | null;
    hash?: string | null;
    tamanho: number;
    mime: string;
  },
) {
  return prisma.documento.create({ data: { leadId: id, ...doc } });
}

/** Etapa 5 — finaliza o interesse: SUBMITTED + protocolo + consentimento de documentos. */
export async function submitLead(
  id: string,
  consents: { consentFinal: boolean; consentDocumentos: boolean },
  ctx: ConsentContext,
) {
  const protocolo = gerarProtocolo();
  await prisma.consentimentoLGPD.create({
    data: consentRow(id, "DOCUMENTOS", consents.consentDocumentos, ctx),
  });
  const lead = await prisma.lead.update({
    where: { id },
    data: {
      status: "SUBMITTED",
      currentStep: "confirmacao",
      protocolo,
      eventos: { create: { tipo: "SUBMETIDO", meta: JSON.stringify({ protocolo }) } },
    },
  });
  return lead;
}

// ---------------------------------------------------------------------------

function consentRow(
  leadId: string,
  tipo: string,
  aceito: boolean,
  ctx: ConsentContext,
) {
  return {
    leadId,
    tipo,
    aceito,
    versaoTermo: TERMO_VERSAO,
    ip: ctx.ip ?? null,
    userAgent: ctx.userAgent ?? null,
  };
}

async function touchStep(
  id: string,
  step: string,
  evento: string,
  meta: unknown,
) {
  return prisma.lead.update({
    where: { id },
    data: {
      currentStep: step,
      eventos: { create: { tipo: evento, meta: meta ? JSON.stringify(meta) : null } },
    },
  });
}

function gerarProtocolo(): string {
  const now = new Date();
  const ymd = now.toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PP-${ymd}-${rand}`;
}
