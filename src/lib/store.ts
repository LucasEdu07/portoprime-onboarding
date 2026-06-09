"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { SimulacaoInput } from "@/lib/simulacao";

// localStorage é só CACHE de UX (retomar rascunho). A verdade dos dados é o banco.

interface DocumentoCache {
  tipo: string;
  nomeArquivo: string;
}

interface OnboardingState {
  leadId: string | null;
  simulacao: SimulacaoInput | null;
  planoEscolhido: string | null;
  cadastro: {
    nome?: string;
    email?: string;
    telefone?: string;
    cpf?: string;
    cidade?: string;
  } | null;
  qualificacao: {
    faixaRenda?: string;
    ocupacao?: string;
    intencao?: string;
    prazoCompra?: string;
  } | null;
  documentos: DocumentoCache[];
  submittedProtocolo: string | null;

  setLeadId: (id: string) => void;
  setSimulacao: (s: SimulacaoInput) => void;
  setPlano: (id: string) => void;
  setCadastro: (c: OnboardingState["cadastro"]) => void;
  setQualificacao: (q: OnboardingState["qualificacao"]) => void;
  addDocumento: (d: DocumentoCache) => void;
  setSubmitted: (protocolo: string) => void;
  reset: () => void;
}

const initial = {
  leadId: null,
  simulacao: null,
  planoEscolhido: null,
  cadastro: null,
  qualificacao: null,
  documentos: [] as DocumentoCache[],
  submittedProtocolo: null,
};

export const useOnboarding = create<OnboardingState>()(
  persist(
    (set) => ({
      ...initial,
      setLeadId: (id) => set({ leadId: id }),
      setSimulacao: (simulacao) => set({ simulacao }),
      setPlano: (planoEscolhido) => set({ planoEscolhido }),
      setCadastro: (cadastro) => set({ cadastro }),
      setQualificacao: (qualificacao) => set({ qualificacao }),
      addDocumento: (d) =>
        set((s) => ({
          documentos: [...s.documentos.filter((x) => x.tipo !== d.tipo), d],
        })),
      setSubmitted: (protocolo) => set({ submittedProtocolo: protocolo }),
      reset: () => set({ ...initial }),
    }),
    { name: "pp-onboarding" },
  ),
);
