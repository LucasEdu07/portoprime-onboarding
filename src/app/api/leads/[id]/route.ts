import { NextResponse } from "next/server";
import { stepSchemas } from "@/lib/validators";
import {
  getLead,
  setPlano,
  setCadastro,
  setQualificacao,
  type ConsentContext,
} from "@/lib/leads-repo";

// GET /api/leads/[id]  — retoma rascunho.
// PATCH /api/leads/[id] — salva uma etapa: body { step, data }.

function reqContext(req: Request): ConsentContext {
  const fwd = req.headers.get("x-forwarded-for");
  return {
    ip: fwd ? fwd.split(",")[0].trim() : null,
    userAgent: req.headers.get("user-agent"),
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const lead = await getLead(id);
  if (!lead) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  return NextResponse.json({ lead });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: { step?: string; data?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const step = body.step;
  if (!step || !(step in stepSchemas)) {
    return NextResponse.json({ error: "Etapa inválida." }, { status: 400 });
  }

  const existing = await getLead(id);
  if (!existing) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  if (existing.status === "SUBMITTED") {
    return NextResponse.json({ error: "Lead já finalizado." }, { status: 409 });
  }

  const schema = stepSchemas[step as keyof typeof stepSchemas];
  const parsed = schema.safeParse(body.data);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados inválidos.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  if (step === "resultado") {
    const d = parsed.data as { planoEscolhido: string };
    await setPlano(id, d.planoEscolhido);
  } else if (step === "cadastro") {
    const d = parsed.data as Parameters<typeof setCadastro>[1];
    await setCadastro(id, d, reqContext(req));
  } else if (step === "qualificacao") {
    const d = parsed.data as Parameters<typeof setQualificacao>[1];
    await setQualificacao(id, d);
  }

  return NextResponse.json({ ok: true });
}
