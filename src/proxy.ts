import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

/**
 * Admin rotalarını korur.
 *
 * Next.js 16'da `middleware` dosyası `proxy` olarak yeniden adlandırıldı
 * ve yalnızca Node.js çalışma zamanında koşar — bu sayede oturum imzası
 * `node:crypto` ile burada doğrulanabiliyor.
 *
 * Giriş ekranının kendisi (`/admin`) korumasızdır; aksi halde giriş
 * yapılamazdı.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin") return NextResponse.next();

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (verifySessionToken(token, process.env.AUTH_SECRET ?? "")) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/admin";
  loginUrl.search = "";
  // Girişten sonra istenen sayfaya dönebilmek için hedefi taşı.
  loginUrl.searchParams.set("devam", pathname);

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/admin/:path*"],
};
