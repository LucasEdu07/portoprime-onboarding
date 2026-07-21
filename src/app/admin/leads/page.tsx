import Link from "next/link";
import { listLeads } from "@/lib/leads-repo";
import { MODALIDADES, type ModalidadeId } from "@/lib/consts";
import { formatBRL } from "@/lib/format";

// Mini-listagem de leads para a demo. Protegida por Basic Auth via middleware.ts;
// mesmo assim, a listagem mascara PII (telefone/CPF) — o dado cru só aparece sob demanda.
export const dynamic = "force-dynamic";

/** (**) *****-1234 — mostra só os 4 últimos dígitos do telefone. */
function maskTelefoneLista(tel: string | null | undefined): string {
  const d = (tel ?? "").replace(/\D/g, "");
  if (d.length < 4) return "—";
  return `(**) *****-${d.slice(-4)}`;
}

/** ***.***.***-** — CPF totalmente mascarado (existência, não o valor). */
function maskCPFLista(cpf: string | null | undefined): string | null {
  const d = (cpf ?? "").replace(/\D/g, "");
  return d.length === 11 ? "***.***.***-**" : null;
}

const dataFmt = new Intl.DateTimeFormat("pt-BR", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export default async function AdminLeadsPage() {
  const leads = await listLeads();
  const submitted = leads.filter((l) => l.status === "SUBMITTED").length;

  return (
    <main className="mx-auto w-full max-w-5xl flex-1 px-5 py-8">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold text-porto-deep">Leads</h1>
        <Link href="/" className="text-sm font-semibold text-porto-digital">
          ← Início
        </Link>
      </div>
      <p className="mt-1 text-sm text-ink/60">
        {leads.length} no total · {submitted} enviados · {leads.length - submitted}{" "}
        rascunhos (recuperáveis).
      </p>

      <div className="mt-5 overflow-x-auto rounded-2xl border border-soft bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-soft bg-canvas text-xs uppercase text-ink/55">
            <tr>
              <th className="px-4 py-3">Quando</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Contato</th>
              <th className="px-4 py-3">Modalidade</th>
              <th className="px-4 py-3">Carta</th>
              <th className="px-4 py-3">Protocolo</th>
            </tr>
          </thead>
          <tbody>
            {leads.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-ink/50">
                  Nenhum lead ainda. Faça uma simulação para ver aqui.
                </td>
              </tr>
            )}
            {leads.map((lead) => {
              const sim = lead.simulacao;
              const mod = sim ? MODALIDADES[sim.modalidade as ModalidadeId] : null;
              return (
                <tr key={lead.id} className="border-b border-soft last:border-0">
                  <td className="px-4 py-3 text-ink/70">
                    {dataFmt.format(lead.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        lead.status === "SUBMITTED"
                          ? "rounded-pill bg-success/10 px-2 py-0.5 text-xs font-semibold text-success"
                          : "rounded-pill bg-prime/15 px-2 py-0.5 text-xs font-semibold text-porto-deep"
                      }
                    >
                      {lead.status === "SUBMITTED" ? "Enviado" : "Rascunho"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {lead.cadastro ? (
                      <span>
                        <span className="block font-medium text-ink">
                          {lead.cadastro.nome}
                        </span>
                        <span className="block text-xs text-ink/55">
                          {maskTelefoneLista(lead.cadastro.telefone)}
                          {maskCPFLista(lead.cadastro.cpf) ? (
                            <span className="ml-2">· CPF {maskCPFLista(lead.cadastro.cpf)}</span>
                          ) : null}
                        </span>
                      </span>
                    ) : (
                      <span className="text-ink/40">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink/70">{mod?.label ?? "—"}</td>
                  <td className="px-4 py-3 text-ink/70">
                    {sim ? formatBRL(Number(sim.valorCarta.toString())) : "—"}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-ink/70">
                    {lead.protocolo ?? "—"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
