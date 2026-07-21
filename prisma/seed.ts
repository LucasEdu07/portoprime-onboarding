// Seed de DEMONSTRAÇÃO: popula ~8 leads fictícios variados (rascunhos em várias etapas
// + enviados com protocolo) para o painel /admin/leads não abrir vazio na apresentação.
//
// Idempotente: remove apenas os leads deste seed (marcados por um EventoFunil "SEED_DEMO")
// antes de recriar — leads criados de verdade pela UI sobrevivem a um re-seed.
//
// Rode via `npx prisma db seed` (carrega .env) — ou `npm run db:seed`. Os dados são
// claramente fictícios (e-mails @demo.local); NUNCA use PII real aqui.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { PrismaClient } from "@prisma/client";
import { MODALIDADES, type ModalidadeId, TERMO_VERSAO } from "../src/lib/consts";

// --- .env loader dependency-free: garante DATABASE_URL mesmo rodando via tsx direto ---
const here = dirname(fileURLToPath(import.meta.url));
if (!process.env.DATABASE_URL) {
  try {
    const envRaw = readFileSync(join(here, "..", ".env"), "utf8");
    for (const line of envRaw.split(/\r?\n/)) {
      const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i.exec(line);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    /* segue: se .env não existir, PrismaClient usa o que estiver no ambiente */
  }
}

const prisma = new PrismaClient();

// Réplica local da fórmula de calcularSimulacao (evita importar simulacao.ts, que usa o
// alias @ do Next — não resolvido pelo tsx). Só para gerar números plausíveis no seed.
function parcelas(modalidade: ModalidadeId, valorCarta: number, prazoMeses: number, redutor: boolean) {
  const p = MODALIDADES[modalidade];
  const base = valorCarta / prazoMeses;
  const admMensal = (valorCarta * p.taxaAdmPct) / prazoMeses;
  const fundoMensal = (valorCarta * p.fundoReservaPct) / prazoMeses;
  const seguroMensal = valorCarta * p.seguroPctMensal;
  const cheia = Math.round((base + admMensal + fundoMensal + seguroMensal) * 100) / 100;
  const reduzida = redutor ? Math.round(cheia * (1 - p.redutorPct) * 100) / 100 : null;
  return { cheia, reduzida, taxaAdmPct: p.taxaAdmPct, fundoReservaPct: p.fundoReservaPct };
}

interface SeedSpec {
  status: "DRAFT" | "SUBMITTED";
  step: string;
  modalidade: ModalidadeId;
  valorCarta: number;
  prazoMeses: number;
  redutor: boolean;
  plano?: string;
  cadastro?: { nome: string; email: string; telefone: string; cpf?: string; cidade?: string };
  qualificacao?: { faixaRenda: string; ocupacao: string; intencao: string; prazoCompra: string };
  docs?: string[];
  diasAtras: number;
}

const SPECS: SeedSpec[] = [
  {
    status: "SUBMITTED", step: "confirmacao", modalidade: "IMOVEL", valorCarta: 300000, prazoMeses: 180, redutor: true, plano: "equilibrado",
    cadastro: { nome: "Ana Beatriz Moraes", email: "ana.moraes@demo.local", telefone: "11987654321", cpf: "39053344705", cidade: "São Paulo" },
    qualificacao: { faixaRenda: "R$ 6.001 a R$ 12.000", ocupacao: "CLT", intencao: "Moradia própria", prazoCompra: "Em até 12 meses" },
    docs: ["IDENTIDADE", "COMPROVANTE_RENDA", "COMPROVANTE_RESIDENCIA"], diasAtras: 1,
  },
  {
    status: "SUBMITTED", step: "confirmacao", modalidade: "AUTO", valorCarta: 90000, prazoMeses: 72, redutor: false, plano: "quita-antes",
    cadastro: { nome: "Carlos Eduardo Lima", email: "carlos.lima@demo.local", telefone: "21991234567", cpf: "15350946056", cidade: "Rio de Janeiro" },
    qualificacao: { faixaRenda: "R$ 3.001 a R$ 6.000", ocupacao: "Autônomo", intencao: "Troca de carro", prazoCompra: "O quanto antes" },
    docs: ["IDENTIDADE", "COMPROVANTE_RENDA"], diasAtras: 2,
  },
  {
    status: "SUBMITTED", step: "confirmacao", modalidade: "IMOVEL", valorCarta: 800000, prazoMeses: 200, redutor: true, plano: "parcela-menor",
    cadastro: { nome: "Juliana Prado Ferreira", email: "juliana.prado@demo.local", telefone: "31992345678", cpf: "11144477735", cidade: "Belo Horizonte" },
    qualificacao: { faixaRenda: "Acima de R$ 12.000", ocupacao: "Empresário", intencao: "Investimento em imóvel", prazoCompra: "Sem pressa, planejando" },
    docs: ["IDENTIDADE", "COMPROVANTE_RENDA", "COMPROVANTE_RESIDENCIA"], diasAtras: 5,
  },
  {
    status: "DRAFT", step: "qualificacao", modalidade: "AUTO", valorCarta: 120000, prazoMeses: 80, redutor: false, plano: "equilibrado",
    cadastro: { nome: "Marcos Vinícius Souza", email: "marcos.souza@demo.local", telefone: "41993456789", cpf: "23554457027", cidade: "Curitiba" },
    qualificacao: { faixaRenda: "R$ 6.001 a R$ 12.000", ocupacao: "Servidor público", intencao: "Primeiro carro", prazoCompra: "Em até 3 meses" },
    docs: ["IDENTIDADE"], diasAtras: 0,
  },
  {
    status: "DRAFT", step: "cadastro", modalidade: "IMOVEL", valorCarta: 500000, prazoMeses: 150, redutor: true, plano: "equilibrado",
    cadastro: { nome: "Patrícia Gomes Alves", email: "patricia.gomes@demo.local", telefone: "51994567890", cidade: "Porto Alegre" },
    diasAtras: 0,
  },
  {
    status: "DRAFT", step: "resultado", modalidade: "TERRENO", valorCarta: 150000, prazoMeses: 120, redutor: false, plano: "quita-antes", diasAtras: 3,
  },
  {
    status: "DRAFT", step: "simulacao", modalidade: "PESADOS", valorCarta: 400000, prazoMeses: 100, redutor: false, diasAtras: 4,
  },
  {
    status: "DRAFT", step: "simulacao", modalidade: "AUTO", valorCarta: 60000, prazoMeses: 60, redutor: false, diasAtras: 6,
  },
];

async function main() {
  // Idempotência: apaga só os leads deste seed (marcados por evento SEED_DEMO).
  const antigos = await prisma.lead.findMany({
    where: { eventos: { some: { tipo: "SEED_DEMO" } } },
    select: { id: true },
  });
  if (antigos.length) {
    await prisma.lead.deleteMany({ where: { id: { in: antigos.map((l) => l.id) } } });
    console.log(`Seed: removidos ${antigos.length} leads de seed anteriores.`);
  }

  const agora = Date.now();
  let n = 0;
  for (const s of SPECS) {
    const pr = parcelas(s.modalidade, s.valorCarta, s.prazoMeses, s.redutor);
    const createdAt = new Date(agora - s.diasAtras * 24 * 60 * 60 * 1000);
    const protocolo =
      s.status === "SUBMITTED"
        ? `PP-${createdAt.toISOString().slice(0, 10).replace(/-/g, "")}-${String(1000 + n)}`
        : null;

    await prisma.lead.create({
      data: {
        status: s.status,
        currentStep: s.step,
        protocolo,
        createdAt,
        simulacao: {
          create: {
            modalidade: s.modalidade,
            valorCarta: s.valorCarta,
            prazoMeses: s.prazoMeses,
            redutor: s.redutor,
            parcelaCheia: pr.cheia,
            parcelaReduzida: pr.reduzida,
            taxaAdmPct: pr.taxaAdmPct,
            fundoReservaPct: pr.fundoReservaPct,
            planoEscolhido: s.plano ?? null,
          },
        },
        ...(s.cadastro ? { cadastro: { create: s.cadastro } } : {}),
        ...(s.qualificacao ? { qualificacao: { create: s.qualificacao } } : {}),
        ...(s.docs && s.docs.length
          ? {
              documentos: {
                create: s.docs.map((tipo) => ({
                  tipo,
                  nomeArquivo: `${tipo.toLowerCase()}.pdf`,
                  url: null,
                  hash: null,
                  tamanho: 128000,
                  mime: "application/pdf",
                })),
              },
            }
          : {}),
        ...(s.cadastro
          ? {
              consentimentos: {
                create: [
                  { tipo: "USO_CONTATO", aceito: true, versaoTermo: TERMO_VERSAO },
                  { tipo: "MARKETING", aceito: true, versaoTermo: TERMO_VERSAO },
                  ...(s.status === "SUBMITTED"
                    ? [{ tipo: "DOCUMENTOS", aceito: true, versaoTermo: TERMO_VERSAO }]
                    : []),
                ],
              },
            }
          : {}),
        eventos: {
          create: [
            { tipo: "SEED_DEMO", meta: null, createdAt },
            { tipo: "SIMULACAO_CRIADA", meta: null, createdAt },
            ...(s.status === "SUBMITTED"
              ? [{ tipo: "SUBMETIDO", meta: JSON.stringify({ protocolo }), createdAt }]
              : []),
          ],
        },
      },
    });
    n++;
  }
  console.log(`Seed: ${n} leads de demonstração criados (${SPECS.filter((s) => s.status === "SUBMITTED").length} enviados, ${SPECS.filter((s) => s.status === "DRAFT").length} rascunhos).`);
}

main()
  .catch((e) => {
    console.error("Seed falhou:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
