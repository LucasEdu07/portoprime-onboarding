# Onboarding — Porto Prime Consórcios (MVP)

MVP de **onboarding de leads de consórcio** para a **Porto Prime Consórcios** — representante autorizado **Porto Bank** (consórcio de imóveis, automóveis, terrenos e caminhões; São José dos Campos/SP).

> **Status:** plano travado · implementação iniciando. O planejamento detalhado e a execução milestone a milestone estão sendo conduzidos via sessão remota (`/ultraplan` · Claude Code na web).

---

## 🎯 Objetivo

Wizard web **mobile-first** de captação de leads: o lead **simula** uma carta de crédito → **escolhe o plano** → **se cadastra** → **envia documentos** → **confirma o interesse**. Os dados são **persistidos de verdade** num backend leve, já arquitetado para virar (fase 2) uma **API REST que alimenta o CRM**.

**Entregável do MVP:** app deployado na Vercel com **link compartilhável** para apresentar ao cliente.

## ✅ Decisões travadas

| Tema | Decisão |
|------|---------|
| Público | Jornada do **cliente/lead** do consórcio |
| Profundidade | **Funcional com backend leve** (persiste dados; base da futura API/CRM) |
| Stack | **Next.js (App Router) + React + TypeScript + Tailwind** |
| Visual | Identidade **Porto/Porto Bank** (azul institucional, clean, confiável) |
| Modalidades no demo | As **4**: Imóvel, Auto, Terreno, Pesados |
| WhatsApp do CTA | **Placeholder** por enquanto |

## 🧭 Jornada (5 etapas)

1. **Simulação** (anônima): modalidade · valor da carta · prazo · redutor de parcela.
2. **Resultado & Plano**: parcela estimada, taxas, comparativo de 2–3 planos.
3. **Cadastro do lead** (cria `Lead` `status=DRAFT`): dados + **consentimento LGPD**.
4. **Qualificação + Documentos**: renda/ocupação/intenção + upload (anti-abandono).
5. **Confirmação** (`status=SUBMITTED`): aceites · protocolo · `/obrigado`.

CTA flutuante **"Falar no WhatsApp"** sempre visível.

> ⚠️ A **simulação** no MVP é uma **estimativa transparente** (fórmula parametrizável por modalidade), **não** o motor real do Porto Bank — este fica para a fase 2.

## 🧱 Stack & arquitetura

- **Front:** Next.js App Router · React · TypeScript · Tailwind · shadcn/ui
- **Forms/estado:** react-hook-form + **zod** (mesma validação no client e no server) · zustand (estado do wizard + persist em localStorage como cache)
- **Backend leve:** Next.js Route Handlers (`src/app/api/**`) desenhados como **API REST autossuficiente** desde o dia 1
- **Dados:** Prisma + **Postgres (Neon)** · decimais com `Decimal` · IDs não sequenciais
- **Uploads:** Vercel Blob (URL assinada — arquivo não passa pela função serverless)
- **Deploy:** Vercel

**Verdade dos dados = Postgres.** Cada etapa concluída faz `PATCH` no banco → quem abandona já vira **lead recuperável**.

### Rotas principais

```
/onboarding/[step]              # 1 rota por etapa (URL linkável, retoma rascunho)
POST  /api/leads                # cria lead DRAFT
PATCH /api/leads/[id]           # salva cada etapa (autosave debounce)
POST  /api/leads/[id]/submit    # finaliza → SUBMITTED
POST  /api/uploads              # token de upload assinado
```

## 🗃️ Modelo de dados (Prisma)

**MVP:** `Lead` · `Simulacao` · `Cadastro` (1:1) · `Documento` (só URL+hash, nunca binário) · `ConsentimentoLGPD` (append-only) · `EventoFunil` (timeline).
**Scaffold fase 2 (tabela criada, inativa):** `CrmSyncRecord` (outbox/ledger para integração idempotente com o CRM).

## 🎨 Identidade visual (Porto)

| Cor | HEX |
|-----|-----|
| Azul Porto (primária) | `#00428C` |
| Azul Digital (hover/links) | `#0080C6` |
| Azul Profundo (footer/active) | `#002B5C` |
| Verde Sucesso | `#009634` |
| Dourado Prime (acento) | `#E9B245` |
| Vermelho Porto (destaque) | `#D60019` |
| Texto / Fundo / Bordas | `#1A1F2B` / `#F4F6F9` / `#D7DCE3` |

Fontes (Google): **Montserrat** (títulos) + **Inter** (corpo). Componentes: botões *pill*, inputs ≥48px com label visível, cards de plano com faixa azul, stepper acessível (`aria-current`), contraste AA. Disclaimer **"Representante autorizado Porto Bank"** no rodapé.

## 🔒 LGPD

Consentimento granular e separado (uso/contato obrigatório vs marketing opcional, nunca pré-marcado) · consentimento específico para documentos · registro de data/IP/user-agent/versão do termo · HTTPS · sem log de CPF/PII · URLs de documento assinadas com expiração.

## 🗺️ Roadmap

- **M0 — Fundação:** Next + Tailwind + tokens Porto + Prisma/Neon + deploy esqueleto na Vercel.
- **M1 — Casca do wizard:** stepper, layout, store/persist, navegação + Etapa 1 (Simulação).
- **M2 — Conversão:** Etapa 2 (planos) + Etapa 3 (cadastro + LGPD) + lead DRAFT no backend.
- **M3 — Fechamento:** Etapa 4 (qualificação + upload) + Etapa 5 (confirmação + protocolo) + `/obrigado`.
- **M4 — Acabamento:** responsivo, máscaras pt-BR, microcopy, selos de confiança, CTA WhatsApp, mini-listagem de leads para demo.

### Fora do MVP (fase 2)
Motor de simulação real Porto Bank · push automático para CRM (RD Station/HubSpot/Pipedrive/Kommo) + worker de outbox + webhooks assinados · KYC/biometria · painel admin + auth robusta · app do vendedor · API pública versionada.
