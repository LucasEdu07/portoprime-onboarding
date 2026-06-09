"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft, Upload, Check, Loader2 } from "lucide-react";
import {
  FAIXAS_RENDA,
  OCUPACOES,
  PRAZOS_COMPRA,
  TIPOS_DOCUMENTO,
} from "@/lib/consts";
import { qualificacaoSchema, type QualificacaoFormData } from "@/lib/validators";
import { useOnboarding } from "@/lib/store";
import { patchStep, useRequireLead } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Select, Textarea } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function QualificacaoStep() {
  const leadId = useRequireLead();
  const router = useRouter();
  const store = useOnboarding();
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<QualificacaoFormData>({
    resolver: zodResolver(qualificacaoSchema),
    defaultValues: {
      faixaRenda: store.qualificacao?.faixaRenda as QualificacaoFormData["faixaRenda"],
      ocupacao: store.qualificacao?.ocupacao as QualificacaoFormData["ocupacao"],
      intencao: store.qualificacao?.intencao ?? "",
      prazoCompra: store.qualificacao?.prazoCompra as QualificacaoFormData["prazoCompra"],
    },
  });

  async function onSubmit(data: QualificacaoFormData) {
    if (!leadId) return;
    setSubmitting(true);
    setErro(null);
    try {
      await patchStep(leadId, "qualificacao", data);
      store.setQualificacao(data);
      router.push("/onboarding/confirmacao");
    } catch {
      setErro("Não foi possível salvar. Tente novamente.");
      setSubmitting(false);
    }
  }

  if (!leadId) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold text-porto-deep">
          Quase lá! Conte um pouco sobre você
        </h1>
        <p className="mt-1 text-ink/70">
          Ajuda o consultor a preparar a melhor proposta. Os documentos são opcionais
          agora — você pode enviá-los depois.
        </p>
      </div>

      <Field label="Faixa de renda" htmlFor="faixaRenda" error={errors.faixaRenda?.message}>
        <Select id="faixaRenda" defaultValue="" {...register("faixaRenda")}>
          <option value="" disabled>
            Selecione
          </option>
          {FAIXAS_RENDA.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Ocupação" htmlFor="ocupacao" error={errors.ocupacao?.message}>
        <Select id="ocupacao" defaultValue="" {...register("ocupacao")}>
          <option value="" disabled>
            Selecione
          </option>
          {OCUPACOES.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Quando pretende usar a carta?"
        htmlFor="prazoCompra"
        error={errors.prazoCompra?.message}
      >
        <Select id="prazoCompra" defaultValue="" {...register("prazoCompra")}>
          <option value="" disabled>
            Selecione
          </option>
          {PRAZOS_COMPRA.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="O que você quer realizar?"
        htmlFor="intencao"
        error={errors.intencao?.message}
        hint="Ex.: comprar meu primeiro apartamento, trocar de carro, expandir a frota..."
      >
        <Textarea id="intencao" {...register("intencao")} />
      </Field>

      <fieldset className="space-y-3 rounded-2xl border border-soft bg-white p-4">
        <legend className="px-1 text-sm font-semibold text-ink">
          Documentos (opcional)
        </legend>
        <p className="text-xs text-ink/55">
          Adiantar os documentos agiliza sua análise. Aceitamos PDF ou imagem, até 8 MB.
        </p>
        {TIPOS_DOCUMENTO.map((t) => (
          <DocUpload key={t.id} leadId={leadId} tipo={t.id} label={t.label} />
        ))}
      </fieldset>

      {erro && (
        <p role="alert" className="text-sm font-medium text-alert">
          {erro}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button variant="outline" asChild type="button">
          <a href="/onboarding/cadastro">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar
          </a>
        </Button>
        <Button type="submit" disabled={submitting} className="flex-1" size="lg">
          {submitting ? "Salvando..." : "Revisar e enviar"}
          {!submitting && <ArrowRight className="h-5 w-5" aria-hidden />}
        </Button>
      </div>
    </form>
  );
}

function DocUpload({
  leadId,
  tipo,
  label,
}: {
  leadId: string;
  tipo: string;
  label: string;
}) {
  const store = useOnboarding();
  const existente = store.documentos.find((d) => d.tipo === tipo);
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">(
    existente ? "done" : "idle",
  );
  const [nome, setNome] = useState<string | null>(existente?.nomeArquivo ?? null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setStatus("loading");
    const fd = new FormData();
    fd.append("leadId", leadId);
    fd.append("tipo", tipo);
    fd.append("file", file);
    try {
      const res = await fetch("/api/uploads", { method: "POST", body: fd });
      if (!res.ok) throw new Error();
      const { nomeArquivo } = await res.json();
      setNome(nomeArquivo);
      store.addDocumento({ tipo, nomeArquivo });
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-dashed px-4 py-3 text-sm transition-colors",
        status === "done" ? "border-success bg-success/5" : "border-soft hover:border-porto-digital",
      )}
    >
      <span className="flex items-center gap-2 text-ink/80">
        {status === "loading" ? (
          <Loader2 className="h-4 w-4 animate-spin text-porto" aria-hidden />
        ) : status === "done" ? (
          <Check className="h-4 w-4 text-success" aria-hidden />
        ) : (
          <Upload className="h-4 w-4 text-porto" aria-hidden />
        )}
        <span>
          {label}
          {nome && <span className="block text-xs text-ink/50">{nome}</span>}
          {status === "error" && (
            <span className="block text-xs text-alert">Falha no envio — tente de novo.</span>
          )}
        </span>
      </span>
      <span className="shrink-0 text-xs font-semibold text-porto">
        {status === "done" ? "Trocar" : "Enviar"}
      </span>
      <input
        type="file"
        accept="image/*,application/pdf"
        className="sr-only"
        onChange={onFile}
      />
    </label>
  );
}
