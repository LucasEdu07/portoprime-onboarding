import { NextResponse } from "next/server";
import { createHash } from "crypto";
import { getLead, addDocumento } from "@/lib/leads-repo";
import { saveUpload, isBlobEnabled } from "@/lib/blob";
import { TIPOS_DOCUMENTO } from "@/lib/consts";

// POST /api/uploads — multipart: { leadId, tipo, file }.
// Grava o binário no Blob quando configurado; caso contrário, só os metadados/hash.

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const TIPOS = new Set<string>(TIPOS_DOCUMENTO.map((t) => t.id));

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return NextResponse.json({ error: "Form inválido." }, { status: 400 });

  const leadId = String(form.get("leadId") ?? "");
  const tipo = String(form.get("tipo") ?? "");
  const file = form.get("file");

  if (!leadId || !TIPOS.has(tipo) || !(file instanceof File)) {
    return NextResponse.json({ error: "Parâmetros inválidos." }, { status: 400 });
  }
  if (file.size === 0 || file.size > MAX_BYTES) {
    return NextResponse.json(
      { error: "Arquivo vazio ou maior que 8 MB." },
      { status: 413 },
    );
  }

  const lead = await getLead(leadId);
  if (!lead) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  if (lead.status === "SUBMITTED") {
    return NextResponse.json({ error: "Lead já finalizado." }, { status: 409 });
  }

  const buffer = await file.arrayBuffer();
  const hash = createHash("sha256").update(Buffer.from(buffer)).digest("hex");
  const { url } = await saveUpload(`leads/${leadId}/${tipo}-${file.name}`, buffer, file.type);

  const doc = await addDocumento(leadId, {
    tipo,
    nomeArquivo: file.name,
    url,
    hash,
    tamanho: file.size,
    mime: file.type || "application/octet-stream",
  });

  return NextResponse.json(
    { id: doc.id, tipo, nomeArquivo: doc.nomeArquivo, modo: isBlobEnabled() ? "blob" : "metadados" },
    { status: 201 },
  );
}
