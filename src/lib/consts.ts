// Parâmetros de domínio do MVP. Tudo estático e versionável aqui (sem banco).

export const TERMO_VERSAO = "2026-06-v1";

/** Slugs das etapas, na ordem do funil. A URL /onboarding/[step] usa esses valores. */
export const STEPS = [
  { slug: "simulacao", titulo: "Simulação", curto: "Simular" },
  { slug: "resultado", titulo: "Seu plano", curto: "Plano" },
  { slug: "cadastro", titulo: "Seus dados", curto: "Dados" },
  { slug: "qualificacao", titulo: "Documentos", curto: "Docs" },
  { slug: "confirmacao", titulo: "Confirmação", curto: "Confirmar" },
] as const;

export type StepSlug = (typeof STEPS)[number]["slug"];

export const STEP_SLUGS = STEPS.map((s) => s.slug) as StepSlug[];

export function stepIndex(slug: string): number {
  return STEP_SLUGS.indexOf(slug as StepSlug);
}

/** Modalidades de consórcio e seus parâmetros de estimativa. */
export type ModalidadeId = "IMOVEL" | "AUTO" | "TERRENO" | "PESADOS";

export interface ModalidadeParams {
  id: ModalidadeId;
  label: string;
  /** nome do ícone do lucide-react usado na UI */
  icone: "Home" | "Car" | "Trees" | "Truck";
  valorMin: number;
  valorMax: number;
  valorPadrao: number;
  prazos: number[]; // meses disponíveis
  taxaAdmPct: number; // taxa de administração total (fração)
  fundoReservaPct: number; // fundo de reserva total (fração)
  seguroPctMensal: number; // seguro prestamista mensal sobre a carta (fração)
  redutorPct: number; // redução da parcela até a contemplação (fração)
}

export const MODALIDADES: Record<ModalidadeId, ModalidadeParams> = {
  IMOVEL: {
    id: "IMOVEL",
    label: "Imóvel",
    icone: "Home",
    valorMin: 80000,
    valorMax: 1500000,
    valorPadrao: 300000,
    prazos: [120, 150, 180, 200, 220],
    taxaAdmPct: 0.18,
    fundoReservaPct: 0.005,
    seguroPctMensal: 0.00038,
    redutorPct: 0.5,
  },
  AUTO: {
    id: "AUTO",
    label: "Automóvel",
    icone: "Car",
    valorMin: 30000,
    valorMax: 250000,
    valorPadrao: 90000,
    prazos: [60, 72, 80, 90, 100],
    taxaAdmPct: 0.19,
    fundoReservaPct: 0.005,
    seguroPctMensal: 0.00045,
    redutorPct: 0.3,
  },
  TERRENO: {
    id: "TERRENO",
    label: "Terreno",
    icone: "Trees",
    valorMin: 50000,
    valorMax: 600000,
    valorPadrao: 150000,
    prazos: [100, 120, 150, 180],
    taxaAdmPct: 0.2,
    fundoReservaPct: 0.005,
    seguroPctMensal: 0.0004,
    redutorPct: 0.4,
  },
  PESADOS: {
    id: "PESADOS",
    label: "Pesados",
    icone: "Truck",
    valorMin: 100000,
    valorMax: 900000,
    valorPadrao: 300000,
    prazos: [80, 100, 120, 150],
    taxaAdmPct: 0.17,
    fundoReservaPct: 0.005,
    seguroPctMensal: 0.0005,
    redutorPct: 0.25,
  },
};

export const MODALIDADE_IDS = Object.keys(MODALIDADES) as ModalidadeId[];

/** Opções de seleção usadas na qualificação (Etapa 4). */
export const FAIXAS_RENDA = [
  "Até R$ 3.000",
  "R$ 3.001 a R$ 6.000",
  "R$ 6.001 a R$ 12.000",
  "Acima de R$ 12.000",
] as const;

export const OCUPACOES = [
  "CLT",
  "Autônomo",
  "Empresário",
  "Servidor público",
  "Aposentado",
  "Outro",
] as const;

export const PRAZOS_COMPRA = [
  "O quanto antes",
  "Em até 3 meses",
  "Em até 12 meses",
  "Sem pressa, planejando",
] as const;

export const TIPOS_DOCUMENTO = [
  { id: "IDENTIDADE", label: "Documento de identidade (RG/CNH)" },
  { id: "COMPROVANTE_RENDA", label: "Comprovante de renda" },
  { id: "COMPROVANTE_RESIDENCIA", label: "Comprovante de residência" },
] as const;
