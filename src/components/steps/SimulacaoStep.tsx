"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Home, Car, Trees, Truck, ArrowRight, Info } from "lucide-react";
import { MODALIDADES, MODALIDADE_IDS, type ModalidadeId } from "@/lib/consts";
import { simulacaoSchema, type SimulacaoFormData } from "@/lib/validators";
import { calcularSimulacao } from "@/lib/simulacao";
import { formatBRL, formatBRLCents, formatPct } from "@/lib/format";
import { useOnboarding } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const ICONES = { Home, Car, Trees, Truck };

export function SimulacaoStep() {
  const router = useRouter();
  const store = useOnboarding();
  const [submitting, setSubmitting] = useState(false);
  const [erroEnvio, setErroEnvio] = useState<string | null>(null);

  const inicial = store.simulacao;
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SimulacaoFormData>({
    resolver: zodResolver(simulacaoSchema),
    defaultValues: {
      modalidade: inicial?.modalidade ?? "IMOVEL",
      valorCarta: inicial?.valorCarta ?? MODALIDADES.IMOVEL.valorPadrao,
      prazoMeses: inicial?.prazoMeses ?? MODALIDADES.IMOVEL.prazos[0],
      redutor: inicial?.redutor ?? true,
    },
  });

  const modalidade = watch("modalidade") as ModalidadeId;
  const valorCarta = Number(watch("valorCarta")) || 0;
  const prazoMeses = Number(watch("prazoMeses")) || 0;
  const redutor = watch("redutor");
  const params = MODALIDADES[modalidade];

  // Recalcula faixas ao trocar de modalidade.
  function escolherModalidade(id: ModalidadeId) {
    const p = MODALIDADES[id];
    setValue("modalidade", id, { shouldValidate: true });
    setValue("valorCarta", p.valorPadrao, { shouldValidate: true });
    if (!p.prazos.includes(prazoMeses)) {
      setValue("prazoMeses", p.prazos[0], { shouldValidate: true });
    }
  }

  const dentroFaixa =
    valorCarta >= params.valorMin && valorCarta <= params.valorMax;
  const previa =
    dentroFaixa && prazoMeses > 0
      ? calcularSimulacao({ modalidade, valorCarta, prazoMeses, redutor })
      : null;

  async function onSubmit(data: SimulacaoFormData) {
    setSubmitting(true);
    setErroEnvio(null);
    const payload = {
      modalidade: data.modalidade,
      valorCarta: Number(data.valorCarta),
      prazoMeses: Number(data.prazoMeses),
      redutor: Boolean(data.redutor),
    };
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("falha");
      const { id } = await res.json();
      store.setLeadId(id);
      store.setSimulacao(payload);
      router.push("/onboarding/resultado");
    } catch {
      setErroEnvio("Não foi possível salvar sua simulação. Tente novamente.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-porto-deep">
          Simule sua carta de crédito
        </h1>
        <p className="mt-1 text-ink/70">
          Escolha a modalidade, o valor e o prazo. Mostramos uma{" "}
          <strong>estimativa</strong> da parcela na hora.
        </p>
      </div>

      <Field label="O que você quer conquistar?">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {MODALIDADE_IDS.map((id) => {
            const Icon = ICONES[MODALIDADES[id].icone];
            const ativo = modalidade === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => escolherModalidade(id)}
                aria-pressed={ativo}
                className={cn(
                  "flex flex-col items-center gap-2 rounded-2xl border p-4 text-center transition-colors",
                  ativo
                    ? "border-porto bg-porto/5 ring-2 ring-porto"
                    : "border-soft bg-white hover:border-porto-digital",
                )}
              >
                <Icon
                  className={cn("h-6 w-6", ativo ? "text-porto" : "text-ink/60")}
                  aria-hidden
                />
                <span className="text-sm font-medium">{MODALIDADES[id].label}</span>
              </button>
            );
          })}
        </div>
      </Field>

      <Field
        label="Valor da carta de crédito"
        error={errors.valorCarta?.message}
        hint={`De ${formatBRL(params.valorMin)} a ${formatBRL(params.valorMax)}`}
      >
        <div className="text-2xl font-bold text-porto">{formatBRL(valorCarta)}</div>
        <input
          type="range"
          min={params.valorMin}
          max={params.valorMax}
          step={5000}
          value={valorCarta}
          onChange={(e) =>
            setValue("valorCarta", Number(e.target.value), { shouldValidate: true })
          }
          className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-pill bg-canvas accent-porto"
          aria-label="Valor da carta"
        />
      </Field>

      <Field label="Em quantos meses?" htmlFor="prazoMeses" error={errors.prazoMeses?.message}>
        <Select id="prazoMeses" {...register("prazoMeses", { valueAsNumber: true })}>
          {params.prazos.map((p) => (
            <option key={p} value={p}>
              {p} meses
            </option>
          ))}
        </Select>
      </Field>

      <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-soft bg-white p-4">
        <input
          type="checkbox"
          {...register("redutor")}
          className="mt-0.5 h-5 w-5 accent-porto"
        />
        <span className="text-sm">
          <span className="font-semibold text-ink">Quero parcela reduzida</span>
          <span className="block text-ink/60">
            Pague menos por mês até ser contemplado ({formatPct(params.redutorPct)} de
            redução).
          </span>
        </span>
      </label>

      {previa && (
        <Card className="border-porto/30 bg-porto/5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium text-ink/70">
              {redutor ? "Parcela reduzida a partir de" : "Parcela estimada"}
            </span>
            <span className="text-2xl font-bold text-porto">
              {formatBRLCents(previa.parcelaReduzida ?? previa.parcelaCheia)}
            </span>
          </div>
          {previa.parcelaReduzida !== null && (
            <p className="mt-1 text-xs text-ink/60">
              Parcela cheia após a contemplação: {formatBRLCents(previa.parcelaCheia)}
            </p>
          )}
          <div className="mt-3 flex items-start gap-1.5 text-xs text-ink/55">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            <span>
              Estimativa transparente: (carta ÷ prazo) + taxa adm{" "}
              {formatPct(previa.taxaAdmPct)} + fundo de reserva{" "}
              {formatPct(previa.fundoReservaPct)} + seguro. Não é o cálculo oficial do
              Porto Bank.
            </span>
          </div>
        </Card>
      )}

      {erroEnvio && (
        <p role="alert" className="text-sm font-medium text-alert">
          {erroEnvio}
        </p>
      )}

      <Button type="submit" size="lg" className="w-full" disabled={submitting || !previa}>
        {submitting ? "Salvando..." : "Ver meu plano"}
        {!submitting && <ArrowRight className="h-5 w-5" aria-hidden />}
      </Button>
    </form>
  );
}
