import { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase-server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

// Catatan (Next 16): konvensi "middleware" deprecated, migrasi ke "proxy"
// dilakukan via: npx @next/codemod@canary middleware-to-proxy .
// Matcher: jalankan di semua route kecuali static assets & api auth.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};