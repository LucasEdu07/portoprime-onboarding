import { NextResponse } from "next/server";
import { confirmacaoSchema } from "@/lib/validators";
import { getLead, submitLead } from "@/lib/leads-repo";

// POST /api/leads/[id]/submit — finaliza o interesse (DRAFT -> SUBMITTED + protocolo).

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = confirmacaoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Confirmação inválida.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const lead = await getLead(id);
  if (!lead) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  if (lead.status === "SUBMITTED") {
    return NextResponse.json({ protocolo: lead.protocolo, status: lead.status });
  }
  if (!lead.cadastro) {
    return NextResponse.json(
      { error: "Cadastro incompleto. Volte e preencha seus dados." },
      { status: 400 },
    );
  }

  const fwd = req.headers.get("x-forwarded-for");
  const updated = await submitLead(id, parsed.data, {
    ip: fwd ? fwd.split(",")[0].trim() : null,
    userAgent: req.headers.get("user-agent"),
  });

  return NextResponse.json({ protocolo: updated.protocolo, status: updated.status }, { status: 200 });
}
