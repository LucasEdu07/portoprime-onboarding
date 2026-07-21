import { NextResponse, type NextRequest } from "next/server";

// Portão de acesso do MVP (Basic Auth) para as superfícies que expõem PII de leads:
//  - /admin/*        → páginas administrativas (listagem de leads)
//  - GET /api/leads  → listagem JSON de TODOS os leads (enumeração)
// NÃO cobre POST /api/leads (criação anônima pelo funil) nem /api/leads/[id]
// (retomada do próprio rascunho pelo visitante) — esses precisam ficar públicos.
//
// Fase 2: trocar Basic Auth por login real (Keycloak/fenox-sso) + RBAC, e reduzir
// GET /api/leads/[id] a um DTO sem consentimentos/IP/documentos crus.

const USER = process.env.ADMIN_USER;
const PASS = process.env.ADMIN_PASS;

/** Comparação de tempo ~constante (evita timing oracle no par usuário/senha). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function unauthorized(): NextResponse {
  return new NextResponse("Autenticação necessária.", {
    status: 401,
    // Valor de header HTTP é ByteString (latin1): sem em-dash/acentos (só ASCII).
    headers: { "WWW-Authenticate": 'Basic realm="Porto Prime Admin", charset="UTF-8"' },
  });
}

export function middleware(req: NextRequest): NextResponse {
  const { pathname } = req.nextUrl;
  const protegido =
    pathname.startsWith("/admin") || (pathname === "/api/leads" && req.method === "GET");
  if (!protegido) return NextResponse.next();

  // Fail closed: sem credenciais configuradas, ninguém entra (evita "achar que está
  // protegido" quando o env não foi setado). 503 deixa claro o que fazer.
  if (!USER || !PASS) {
    return new NextResponse(
      "Área protegida sem credenciais. Defina ADMIN_USER e ADMIN_PASS no ambiente.",
      { status: 503 },
    );
  }

  const header = req.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    try {
      const [u, p] = atob(header.slice(6)).split(":");
      if (safeEqual(u ?? "", USER) && safeEqual(p ?? "", PASS)) return NextResponse.next();
    } catch {
      /* header malformado → cai no 401 abaixo */
    }
  }
  return unauthorized();
}

export const config = {
  matcher: ["/admin/:path*", "/api/leads"],
};
