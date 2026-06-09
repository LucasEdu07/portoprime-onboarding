import { ShieldCheck, Banknote, Users } from "lucide-react";

const itens = [
  { icon: ShieldCheck, titulo: "Representante autorizado", texto: "Porto Bank" },
  { icon: Banknote, titulo: "Sem juros", texto: "Você paga o valor da carta" },
  { icon: Users, titulo: "Atendimento humano", texto: "Consultor dedicado" },
];

/** Selos de confiança — reforçam credibilidade da marca Porto. */
export function TrustBadges() {
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {itens.map(({ icon: Icon, titulo, texto }) => (
        <li
          key={titulo}
          className="flex items-center gap-3 rounded-2xl border border-soft bg-white p-4"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-porto/10 text-porto">
            <Icon className="h-5 w-5" aria-hidden />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">{titulo}</span>
            <span className="block text-xs text-ink/60">{texto}</span>
          </span>
        </li>
      ))}
    </ul>
  );
}
