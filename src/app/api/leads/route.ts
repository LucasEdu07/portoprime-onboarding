import { NextResponse } from "next/server";
import { simulacaoSchema } from "@/lib/validators";
import { createLead, listLeads } from "@/lib/leads-repo";

// API REST interna. Handlers finos: validam na borda (zod) e delegam ao serviço.

/** POST /api/leads — cria um Lead DRAFT a partir da simulação (Etapa 1). */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido." }, { status: 400 });
  }

  const parsed = simulacaoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dados de simulação inválidos.", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const lead = await createLead(parsed.data);
  return NextResponse.json({ id: lead.id, status: lead.status }, { status: 201 });
}

/** GET /api/leads — listagem para a demo (aberta no MVP). */
export async function GET() {
  const leads = await listLeads();
  return NextResponse.json({ leads });
}
