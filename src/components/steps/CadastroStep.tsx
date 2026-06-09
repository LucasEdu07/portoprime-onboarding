"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, ArrowLeft, Lock } from "lucide-react";
import { cadastroSchema, type CadastroFormData } from "@/lib/validators";
import { maskCPF, maskTelefone } from "@/lib/format";
import { useOnboarding } from "@/lib/store";
import { patchStep, useRequireLead } from "@/lib/client";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function CadastroStep() {
  const leadId = useRequireLead();
  const router = useRouter();
  const store = useOnboarding();
  const [submitting, setSubmitting] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<CadastroFormData>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      nome: store.cadastro?.nome ?? "",
      email: store.cadastro?.email ?? "",
      telefone: store.cadastro?.telefone ?? "",
      cpf: store.cadastro?.cpf ?? "",
      cidade: store.cadastro?.cidade ?? "",
      consentUsoContato: false,
      consentMarketing: false,
    },
  });

  async function onSubmit(data: CadastroFormData) {
    if (!leadId) return;
    setSubmitting(true);
    setErro(null);
    try {
      await patchStep(leadId, "cadastro", data);
      store.setCadastro({
        nome: data.nome,
        email: data.email,
        telefone: data.telefone,
        cpf: data.cpf,
        cidade: data.cidade,
      });
      router.push("/onboarding/qualificacao");
    } catch {
      setErro("Não foi possível salvar seus dados. Tente novamente.");
      setSubmitting(false);
    }
  }

  if (!leadId) return null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <h1 className="font-heading text-2xl font-bold text-porto-deep">Seus dados</h1>
        <p className="mt-1 text-ink/70">
          Para enviar seu plano e um consultor entrar em contato. Leva menos de 1 minuto.
        </p>
      </div>

      <Field label="Nome completo" htmlFor="nome" error={errors.nome?.message}>
        <Input id="nome" autoComplete="name" {...register("nome")} />
      </Field>

      <Field label="E-mail" htmlFor="email" error={errors.email?.message}>
        <Input id="email" type="email" autoComplete="email" {...register("email")} />
      </Field>

      <Field label="WhatsApp / Telefone" htmlFor="telefone" error={errors.telefone?.message}>
        <Controller
          control={control}
          name="telefone"
          render={({ field }) => (
            <Input
              id="telefone"
              inputMode="numeric"
              autoComplete="tel"
              placeholder="(12) 99999-9999"
              value={field.value ?? ""}
              onChange={(e) => field.onChange(maskTelefone(e.target.value))}
            />
          )}
        />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="CPF (opcional)" htmlFor="cpf" error={errors.cpf?.message}>
          <Controller
            control={control}
            name="cpf"
            render={({ field }) => (
              <Input
                id="cpf"
                inputMode="numeric"
                placeholder="000.000.000-00"
                value={field.value ?? ""}
                onChange={(e) => field.onChange(maskCPF(e.target.value))}
              />
            )}
          />
        </Field>
        <Field label="Cidade (opcional)" htmlFor="cidade">
          <Input id="cidade" autoComplete="address-level2" {...register("cidade")} />
        </Field>
      </div>

      <fieldset className="space-y-3 rounded-2xl border border-soft bg-white p-4">
        <legend className="px-1 text-sm font-semibold text-ink">Privacidade (LGPD)</legend>

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            {...register("consentUsoContato")}
            className="mt-0.5 h-5 w-5 accent-porto"
          />
          <span>
            Autorizo o uso dos meus dados para que a Porto Prime entre em contato sobre
            esta simulação. <span className="text-alert">*</span>
          </span>
        </label>
        {errors.consentUsoContato && (
          <p role="alert" className="text-xs font-medium text-alert">
            {errors.consentUsoContato.message}
          </p>
        )}

        <label className="flex items-start gap-3 text-sm">
          <input
            type="checkbox"
            {...register("consentMarketing")}
            className="mt-0.5 h-5 w-5 accent-porto"
          />
          <span className="text-ink/80">
            Quero receber novidades e ofertas (opcional).
          </span>
        </label>

        <p className="flex items-start gap-1.5 text-xs text-ink/55">
          <Lock className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          Seus dados trafegam por conexão segura e não são compartilhados sem o seu
          consentimento.
        </p>
      </fieldset>

      {erro && (
        <p role="alert" className="text-sm font-medium text-alert">
          {erro}
        </p>
      )}

      <div className="flex items-center gap-3">
        <Button variant="outline" asChild type="button">
          <Link href="/onboarding/resultado">
            <ArrowLeft className="h-4 w-4" aria-hidden /> Voltar
          </Link>
        </Button>
        <Button type="submit" disabled={submitting} className="flex-1" size="lg">
          {submitting ? "Salvando..." : "Continuar"}
          {!submitting && <ArrowRight className="h-5 w-5" aria-hidden />}
        </Button>
      </div>
    </form>
  );
}
