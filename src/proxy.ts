import { NextRequest, NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Proteksi route via NextAuth (v5). auth() di proxy membaca JWT session
// cookie — TANPA import Prisma (aman untuk Edge Runtime).
const { auth } = NextAuth(authConfig);

const PROTECTED_PREFIXES = ["/dashboard", "/peta", "/layanan"];
const ADMIN_ROLES = ["super_admin", "lurah", "sekretaris", "petugas"];

export async function proxy(request: NextRequest) {
  const session = await auth();
  const { pathname } = request.nextUrl;

  const needsAuth = PROTECTED_PREFIXES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // Belum login → redirect ke /login?next=<path>
  if (needsAuth && !session?.user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Staf tidak mengajukan surat — halaman pengajuan dialihkan ke dashboard
  // terpadu. Mencakup /layanan/surat dan form per-jenis (/layanan/surat/<slug>).
  if (
    session?.user &&
    pathname === "/layanan/surat" &&
    ADMIN_ROLES.includes((session.user as { role?: string }).role ?? "")
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Warga yang buka path admin lama (/admin) ikut diarahkan ke dashboard;
  // untuk staf, /dashboard sendiri sudah merender panel admin.
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Sudah login → jangan biarkan buka /login atau /register
  if (session?.user && (pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Matcher: jalankan di semua route kecuali static assets & api auth nextauth.
// (Next 16: konvensi "middleware" sudah di-rename jadi "proxy".)
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/auth/.*|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
