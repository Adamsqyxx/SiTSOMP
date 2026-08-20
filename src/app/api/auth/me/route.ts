import { NextResponse } from "next/server";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/auth/me — ambil user dari session NextAuth (null kalau belum login).
export async function GET() {
  const session = await auth();
  const user = session?.user ?? null;

  return NextResponse.json({
    user: user
      ? {
          id: user.id,
          email: user.email ?? null,
          nama_lengkap: user.nama_lengkap ?? user.name ?? null,
          role: user.role ?? "warga",
          nik: user.nik ?? null,
        }
      : null,
  });
}