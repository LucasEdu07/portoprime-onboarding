import { z } from "zod";
import {
  FAIXAS_RENDA,
  OCUPACOES,
  PRAZOS_COMPRA,
  MODALIDADES,
} from "@/lib/consts";
import { isValidCPF, onlyDigits } from "@/lib/format";

// Schemas compartilhados client (react-hook-form) e server (route handlers).
// Validação na borda da API = contrato REST autossuficiente desde o dia 1.

export const modalidadeEnum = z.enum(["IMOVEL", "AUTO", "TERRENO", "PESADOS"]);

export const simulacaoSchema = z
  .object({
    modalidade: modalidadeEnum,
    valorCarta: z.number().int().positive(),
    prazoMeses: z.number().int().positive(),
    redutor: z.boolean(),
  })
  .superRefine((val, ctx) => {
    const params = MODALIDADES[val.modalidade];
    if (val.valorCarta < params.valorMin || val.valorCarta > params.valorMax) {
      ctx.addIssue({
        code: "custom",
        path: ["valorCarta"],
        message: `Valor fora da faixa para ${params.label}.`,
      });
    }
    if (!params.prazos.includes(val.prazoMeses)) {
      ctx.addIssue({
        code: "custom",
        path: ["prazoMeses"],
        message: "Prazo indisponível para esta modalidade.",
      });
    }
  });

export const resultadoSchema = z.object({
  planoEscolhido: z.string().min(1, "Escolha um plano."),
});

export const cadastroSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo."),
  email: z.email("E-mail inválido."),
  telefone: z
    .string()
    .refine((v) => onlyDigits(v).length >= 10, "Telefone inválido."),
  cpf: z
    .string()
    .optional()
    .refine((v) => !v || isValidCPF(v), "CPF inválido."),
  cidade: z.string().trim().optional(),
  // Consentimentos LGPD — uso/contato obrigatório; marketing opcional.
  consentUsoContato: z
    .boolean()
    .refine((v) => v === true, "É necessário aceitar o uso dos dados para contato."),
  consentMarketing: z.boolean().default(false),
});

export const qualificacaoSchema = z.object({
  faixaRenda: z.enum(FAIXAS_RENDA),
  ocupacao: z.enum(OCUPACOES),
  intencao: z.string().trim().min(3, "Conte rapidamente sua intenção."),
  prazoCompra: z.enum(PRAZOS_COMPRA),
});

export const confirmacaoSchema = z.object({
  // aceite final dos termos para envio do interesse
  consentFinal: z.boolean().refine((v) => v === true, "Confirme para enviar."),
  consentDocumentos: z
    .boolean()
    .refine((v) => v === true, "É necessário autorizar o uso dos documentos enviados."),
});

export type SimulacaoFormData = z.infer<typeof simulacaoSchema>;
export type CadastroFormData = z.infer<typeof cadastroSchema>;
export type QualificacaoFormData = z.infer<typeof qualificacaoSchema>;
export type ConfirmacaoFormData = z.infer<typeof confirmacaoSchema>;

/** Mapa de schema por etapa para o PATCH validar na borda. */
export const stepSchemas = {
  resultado: resultadoSchema,
  cadastro: cadastroSchema,
  qualificacao: qualificacaoSchema,
} as const;
