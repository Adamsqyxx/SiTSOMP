import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper: ambil user id dari session NextAuth; null kalau belum login.
export async function getSessionUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

// Versi JSON (untuk dipakai di client kalau perlu)
export async function GET() {
  const session = await auth();
  return NextResponse.json({ user: session?.user ?? null });
}