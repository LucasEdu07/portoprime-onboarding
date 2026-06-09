// Upload de documentos com fallback.
// - Com BLOB_READ_WRITE_TOKEN: envia para o Vercel Blob e retorna a URL.
// - Sem token: "modo metadados" — não armazena o binário, só devolve url = null.
//
// NOTA: no MVP o arquivo passa pela função serverless (put server-side). A versão
// com URL assinada client-side (arquivo não toca a função) fica para a fase 2.

export function isBlobEnabled(): boolean {
  return Boolean(process.env.BLOB_READ_WRITE_TOKEN);
}

export async function saveUpload(
  pathname: string,
  data: ArrayBuffer,
  contentType: string,
): Promise<{ url: string | null }> {
  if (!isBlobEnabled()) return { url: null };
  const { put } = await import("@vercel/blob");
  const blob = await put(pathname, Buffer.from(data), {
    access: "public",
    contentType,
    addRandomSuffix: true,
  });
  return { url: blob.url };
}
