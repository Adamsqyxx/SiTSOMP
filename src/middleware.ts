import { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase-server";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Jalankan di semua route kecuali static assets & api auth
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};