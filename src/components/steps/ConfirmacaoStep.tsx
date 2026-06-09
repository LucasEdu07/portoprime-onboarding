"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Send, CheckCircle2 } from "lucide-react";
import { MODALIDADES } from "@/lib/consts";
import { gerarPlanos } from "@/lib/simulacao";
import { formatBRL, formatBRLCents } from "@/lib/format";
import { confirmacaoSchema, type ConfirmacaoFormData } from "@/lib/validators";
import { useOnboarding } from "@/lib/store";
import { submitLead, useRequireLead } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function ConfirmacaoStep() {
  const leadId = useRequireLead();
  const router = useRouter();
  const store = useOnboarding();
  const sim = store.simulacao;
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ConfirmacaoFormData>({
    resolver: zodResolver(confirmacaoSchema),
    defaultValues: { consentFinal: false, consentDocumentos: false },
  });

  if (!sim || !leadId) return null;

  const planos = gerarPlanos(sim);
  const plano = planos.find((p) => p.id === store.planoEscolhido) ?? planos[0];
  const modalidade = MODALIDADES[sim.modalidade];
  const valorParcela = plano.parcelaReduzida ?? plano.parcelaCheia;

  async function onSubmit(data: ConfirmacaoFormData) {
    if (!leadId) return;
    setSubmitting(true);
    setErro(null);
    try {
      const protocolo = await submitLead(leadId, data);
      store.setSubmitted(protocolo);
      router.push("/obrigado");
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível enviar.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold text-porto-deep">
          Confirme seu interesse
        </h1>
        <p className="mt-1 text-ink/70">Revise o resumo e envie. É rápido.</p>
      </div>

      <Card className="space-y-3">
        <Linha rotulo="Modalidade" valor={modalidade.label} />
        <Linha rotulo="Carta de crédito" valor={formatBRL(sim.valorCarta)} />
        <Linha rotulo="Plano" valor={`${plano.nome} · ${plano.prazoMeses} meses`} />
        <Linha
          rotulo={plano.redutor ? "Parcela reduzida" : "Parcela estimada"}
          valor={formatBRLCents(valorParcela)}
          destaque
        />
        <hr className="border-soft" />
        <Linha rotulo="Nome" valor={store.cadastro?.nome ?? "—"} />
        <Linha rotulo="E-mail" valor={store.cadastro?.email ?? "—"} />
        <Linha rotulo="Telefone" valor={store.cadastro?.telefone ?? "—"} />
        {store.documentos.length > 0 && (
          <Linha rotulo="Documentos enviados" valor={`${store.documentos.length}`} />
        )}
      </Card>

      <fieldset className="space-y-3 rounded-2xl border border-soft bg-white p-4">
        <legend className="px-1 text-sm font-semibold text-ink">Termos</legend>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            {...register("consentFinal")}
            className="mt-0.5 h-5 w-5 accent-porto"
          />
          <span>
            Confirmo que as informações são verdadeiras e autorizo a Porto Prime a entrar
            em contato sobre esta proposta. <span className="text-alert">*</span>
          </span>
        </label>
        {errors.consentFinal && (
          <p role="alert" className="text-xs font-medium text-alert">
            {errors.consentFinal.message}
          </p>
        )}

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            {...register("consentDocumentos")}
            className="mt-0.5 h-5 w-5 accent-porto"
          />
          <span>
            Autorizo o uso dos documentos enviados exclusivamente para análise desta
            proposta. <span className="text-alert">*</span>
          </span>
        </label>
        {errors.consentDocumentos && (
          <p role="alert" className="text-xs font-medium text-alert">
            {errors.consentDocumentos.message}
          </p>
        )}
      </fieldset>

      <p className="flex items-start gap-1.5 text-xs text-ink/55">
        <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
        Valores estimados — não constituem o cálculo oficial do Porto Bank. Consórcio não é
        financiamento e não há juros.
      </p>

      {erro && (
        <p role="alert" className="text-sm font-medium text-alert">
          {erro}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button variant="outline" asChild type="button">
          <a href="/onboarding/qualificacao">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar
          </a>
        </Button>
        <Button type="submit" disabled={submitting} className="flex-1" size="lg">
          {submitting ? "Enviando..." : "Enviar interesse"}
          {!submitting && <Send className="h-5 w-5" aria-hidden />}
        </Button>
      </div>
    </form>
  );
}

function Linha({
  rotulo,
  valor,
  destaque,
}: {
  rotulo: string;
  valor: string;
  destaque?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-ink/60">{rotulo}</span>
      <span
        className={
          destaque ? "text-lg font-bold text-porto" : "text-sm font-medium text-ink"
        }
      >
        {valor}
      </span>
    </div>
  );
}
