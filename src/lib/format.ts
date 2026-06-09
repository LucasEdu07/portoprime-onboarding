// Formatação e máscaras pt-BR.

const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const brlCents = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** R$ 300.000 (sem centavos) — para valores de carta. */
export function formatBRL(valor: number): string {
  return brl.format(valor);
}

/** R$ 1.234,56 (com centavos) — para parcelas. */
export function formatBRLCents(valor: number): string {
  return brlCents.format(valor);
}

export function formatPct(fracao: number): string {
  return `${(fracao * 100).toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`;
}

/** Mantém só dígitos. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/** Máscara de CPF: 000.000.000-00 */
export function maskCPF(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Máscara de telefone: (12) 99999-9999 */
export function maskTelefone(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length <= 2) return d.replace(/(\d{0,2})/, "($1");
  if (d.length <= 6) return d.replace(/(\d{2})(\d{0,4})/, "($1) $2");
  if (d.length <= 10) return d.replace(/(\d{2})(\d{4})(\d{0,4})/, "($1) $2-$3");
  return d.replace(/(\d{2})(\d{5})(\d{0,4})/, "($1) $2-$3");
}

/** Converte texto monetário digitado (ex.: "300.000" ou "R$ 90.000") em número. */
export function parseValorInput(value: string): number {
  const d = onlyDigits(value);
  return d ? parseInt(d, 10) : 0;
}

/** Validação de CPF (dígitos verificadores). Aceita vazio (campo opcional). */
export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const calc = (slice: number) => {
    let sum = 0;
    for (let i = 0; i < slice; i++) sum += parseInt(cpf[i], 10) * (slice + 1 - i);
    const rest = (sum * 10) % 11;
    return rest === 10 ? 0 : rest;
  };
  return calc(9) === parseInt(cpf[9], 10) && calc(10) === parseInt(cpf[10], 10);
}
