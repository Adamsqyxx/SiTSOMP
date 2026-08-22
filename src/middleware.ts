import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Proteksi route via NextAuth (v5). auth() di middleware membaca JWT session
// cookie — TANPA import Prisma (aman untuk Edge Runtime).
const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = ["/dashboard", "/peta", "/layanan"];
// Halaman khusus admin/staf kelurahan.
const ADMIN_PREFIX = "/admin";
const ADMIN_ROLES = ["super_admin", "lurah", "sekretaris", "petugas"];

export async function middleware(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );
  const needsAdmin =
    pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);

  // Belum login → redirect ke /login?next=<path>
  if ((needsAuth || needsAdmin) && !session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // /admin hanya untuk role staf; warga biasa → dashboard warga.
  if (needsAdmin && session?.user) {
    const role = (session.user as { role?: string }).role ?? "warga";
    if (!ADMIN_ROLES.includes(role)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  // Admin yang buka /dashboard dialihkan ke dashboard admin.
  // Pengecualian: tombol "Tampilan Warga" di panel admin membuka
  // /dashboard?tampilan=warga — admin sengaja ingin melihat dashboard warga.
  if (pathname === "/dashboard" && session?.user) {
    const role = (session.user as { role?: string }).role ?? "warga";
    const tampilanWarga =
      request.nextUrl.searchParams.get("tampilan") === "warga";
    if (ADMIN_ROLES.includes(role) && !tampilanWarga) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
  }

  // Sudah login → jangan biarkan buka /login atau /register
  if (session?.user && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Catatan (Next 16): konvensi "middleware" deprecated, migrasi ke "proxy"
// via: npx @next/codemod@canary middleware-to-proxy .
// Matcher: jalankan di semua route kecuali static assets & api auth nextauth.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
