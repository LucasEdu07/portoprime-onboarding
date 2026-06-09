import { MODALIDADES, type ModalidadeId } from "@/lib/consts";

export interface SimulacaoInput {
  modalidade: ModalidadeId;
  valorCarta: number;
  prazoMeses: number;
  redutor: boolean;
}

export interface SimulacaoResultado {
  valorCarta: number;
  prazoMeses: number;
  modalidade: ModalidadeId;
  redutor: boolean;
  // composição da parcela (estimativa, valores mensais)
  base: number;
  admMensal: number;
  fundoMensal: number;
  seguroMensal: number;
  parcelaCheia: number;
  parcelaReduzida: number | null;
  taxaAdmPct: number;
  fundoReservaPct: number;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Estimativa transparente da parcela de consórcio.
 * NÃO é o motor oficial do Porto Bank — apenas uma fórmula parametrizável por modalidade:
 *   parcela ≈ (carta ÷ prazo) + taxa adm rateada + fundo de reserva rateado + seguro prestamista.
 * Quando o redutor está ativo, mostramos também a parcela reduzida até a contemplação.
 */
export function calcularSimulacao(input: SimulacaoInput): SimulacaoResultado {
  const params = MODALIDADES[input.modalidade];
  const { valorCarta, prazoMeses } = input;

  const base = valorCarta / prazoMeses;
  const admMensal = (valorCarta * params.taxaAdmPct) / prazoMeses;
  const fundoMensal = (valorCarta * params.fundoReservaPct) / prazoMeses;
  const seguroMensal = valorCarta * params.seguroPctMensal;

  const parcelaCheia = base + admMensal + fundoMensal + seguroMensal;
  const parcelaReduzida = input.redutor
    ? parcelaCheia * (1 - params.redutorPct)
    : null;

  return {
    valorCarta,
    prazoMeses,
    modalidade: input.modalidade,
    redutor: input.redutor,
    base: round2(base),
    admMensal: round2(admMensal),
    fundoMensal: round2(fundoMensal),
    seguroMensal: round2(seguroMensal),
    parcelaCheia: round2(parcelaCheia),
    parcelaReduzida: parcelaReduzida === null ? null : round2(parcelaReduzida),
    taxaAdmPct: params.taxaAdmPct,
    fundoReservaPct: params.fundoReservaPct,
  };
}

export interface PlanoEstimado {
  id: string;
  nome: string;
  descricao: string;
  destaque: boolean;
  prazoMeses: number;
  parcelaCheia: number;
  parcelaReduzida: number | null;
  redutor: boolean;
}

/**
 * Gera 2–3 planos comparativos a partir da simulação escolhida (Etapa 2):
 * o plano escolhido, uma opção de parcela menor (prazo mais longo) e uma de quitar antes.
 */
export function gerarPlanos(input: SimulacaoInput): PlanoEstimado[] {
  const params = MODALIDADES[input.modalidade];
  const prazos = params.prazos;
  const idxAtual = prazos.indexOf(input.prazoMeses);
  const prazoLongo = prazos[Math.min(prazos.length - 1, Math.max(idxAtual, 0) + 1)];
  const prazoCurto = prazos[Math.max(0, (idxAtual === -1 ? prazos.length - 1 : idxAtual) - 1)];

  const planos: PlanoEstimado[] = [];

  const equilibrado = calcularSimulacao(input);
  planos.push({
    id: "equilibrado",
    nome: "Equilibrado",
    descricao: "O plano que você simulou — bom equilíbrio entre prazo e parcela.",
    destaque: true,
    prazoMeses: input.prazoMeses,
    parcelaCheia: equilibrado.parcelaCheia,
    parcelaReduzida: equilibrado.parcelaReduzida,
    redutor: input.redutor,
  });

  if (prazoLongo !== input.prazoMeses) {
    const menor = calcularSimulacao({ ...input, prazoMeses: prazoLongo, redutor: true });
    planos.push({
      id: "parcela-menor",
      nome: "Parcela menor",
      descricao: "Prazo mais longo e redutor ativo para a menor parcela inicial.",
      destaque: false,
      prazoMeses: prazoLongo,
      parcelaCheia: menor.parcelaCheia,
      parcelaReduzida: menor.parcelaReduzida,
      redutor: true,
    });
  }

  if (prazoCurto !== input.prazoMeses) {
    const rapido = calcularSimulacao({ ...input, prazoMeses: prazoCurto, redutor: false });
    planos.push({
      id: "quita-antes",
      nome: "Quita antes",
      descricao: "Prazo mais curto: quita mais rápido pagando um pouco mais por mês.",
      destaque: false,
      prazoMeses: prazoCurto,
      parcelaCheia: rapido.parcelaCheia,
      parcelaReduzida: null,
      redutor: false,
    });
  }

  return planos;
}
