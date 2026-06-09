"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboarding } from "@/lib/store";

/** PATCH de uma etapa no backend (verdade dos dados). Lança em erro. */
export async function patchStep(leadId: string, step: string, data: unknown) {
  const res = await fetch(`/api/leads/${leadId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ step, data }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? "Falha ao salvar.");
  }
  return res.json();
}

/** Finaliza o lead (Etapa 5). Retorna o protocolo. */
export async function submitLead(leadId: string, data: unknown): Promise<string> {
  const res = await fetch(`/api/leads/${leadId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body?.error ?? "Falha ao enviar.");
  }
  const { protocolo } = await res.json();
  return protocolo as string;
}

/**
 * Garante que há um rascunho em andamento. Sem leadId/simulação, volta para a Etapa 1.
 * Retorna o leadId quando disponível (ou null enquanto redireciona).
 */
export function useRequireLead(): string | null {
  const router = useRouter();
  const { leadId, simulacao } = useOnboarding();
  useEffect(() => {
    if (!leadId || !simulacao) router.replace("/onboarding/simulacao");
  }, [leadId, simulacao, router]);
  return leadId;
}
