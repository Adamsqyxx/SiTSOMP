import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/auth/me — ambil user dari session NextAuth (null kalau belum login).
export async function GET() {
  const session = await auth();
  const user = session?.user ?? null;

  if (!user) return NextResponse.json({ user: null });

  // Ambil data terbaru dari DB (nomor_hp, dsb).
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      nama_lengkap: true,
      role: true,
      nik: true,
      nomor_hp: true,
    },
  });

  return NextResponse.json({ user: dbUser });
}

// PATCH /api/auth/me — perbarui profil user (nama_lengkap, nomor_hp).
export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { nama_lengkap, nomor_hp } = await req.json();

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        nama_lengkap: nama_lengkap || undefined,
        nomor_hp: nomor_hp || undefined,
      },
    });

    return NextResponse.json({
      user: {
        id: updated.id,
        nama_lengkap: updated.nama_lengkap,
        nomor_hp: updated.nomor_hp,
      },
    });
  } catch (error: any) {
    console.error("Profile Update Error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui profil" },
      { status: 500 }
    );
  }
}
