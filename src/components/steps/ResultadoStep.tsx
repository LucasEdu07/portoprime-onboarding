"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Check } from "lucide-react";
import { MODALIDADES } from "@/lib/consts";
import { gerarPlanos } from "@/lib/simulacao";
import { formatBRL, formatBRLCents } from "@/lib/format";
import { useOnboarding } from "@/lib/store";
import { patchStep, useRequireLead } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ResultadoStep() {
  const leadId = useRequireLead();
  const router = useRouter();
  const store = useOnboarding();
  const sim = store.simulacao;
  const [escolhido, setEscolhido] = useState<string>(store.planoEscolhido ?? "equilibrado");
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  if (!sim || !leadId) return null;

  const planos = gerarPlanos(sim);
  const modalidade = MODALIDADES[sim.modalidade];

  async function continuar() {
    if (!leadId) return;
    setSubmitting(true);
    setErro(null);
    try {
      await patchStep(leadId, "resultado", { planoEscolhido: escolhido });
      store.setPlano(escolhido);
      router.push("/onboarding/cadastro");
    } catch {
      setErro("Não foi possível salvar sua escolha. Tente novamente.");
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-porto-deep">
          Seu plano de {modalidade.label.toLowerCase()}
        </h1>
        <p className="mt-1 text-ink/70">
          Carta de <strong>{formatBRL(sim.valorCarta)}</strong>. Escolha o ritmo que
          combina com você — todos são <strong>estimativas sem juros</strong>.
        </p>
      </div>

      <div className="space-y-3">
        {planos.map((plano) => {
          const ativo = escolhido === plano.id;
          const valorMostrar = plano.parcelaReduzida ?? plano.parcelaCheia;
          return (
            <button
              key={plano.id}
              type="button"
              onClick={() => setEscolhido(plano.id)}
              aria-pressed={ativo}
              className={cn(
                "w-full overflow-hidden rounded-2xl border bg-white text-left transition-all",
                ativo ? "border-porto ring-2 ring-porto" : "border-soft hover:border-porto-digital",
              )}
            >
              <div
                className={cn(
                  "flex items-center justify-between px-5 py-2 text-sm font-semibold text-white",
                  plano.destaque ? "bg-porto" : "bg-porto-deep",
                )}
              >
                <span>{plano.nome}</span>
                {plano.destaque && (
                  <span className="rounded-pill bg-prime px-2 py-0.5 text-xs text-porto-deep">
                    Recomendado
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-xs text-ink/55">
                      {plano.redutor ? "Parcela reduzida a partir de" : "Parcela a partir de"}
                    </div>
                    <div className="text-2xl font-bold text-porto">
                      {formatBRLCents(valorMostrar)}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "flex h-6 w-6 items-center justify-center rounded-full border",
                      ativo ? "border-porto bg-porto text-white" : "border-soft",
                    )}
                    aria-hidden
                  >
                    {ativo && <Check className="h-4 w-4" />}
                  </span>
                </div>
                <p className="mt-2 text-sm text-ink/65">{plano.descricao}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink/55">
                  <span>{plano.prazoMeses} meses</span>
                  {plano.parcelaReduzida !== null && (
                    <span>Parcela cheia: {formatBRLCents(plano.parcelaCheia)}</span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {erro && (
        <p role="alert" className="text-sm font-medium text-alert">
          {erro}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button variant="outline" asChild>
          <Link href="/onboarding/simulacao">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Ajustar
          </Link>
        </Button>
        <Button onClick={continuar} disabled={submitting} className="flex-1" size="lg">
          {submitting ? "Salvando..." : "Quero este plano"}
          {!submitting && <ArrowRight className="h-5 w-5" aria-hidden />}
        </Button>
      </div>
    </div>
  );
}
