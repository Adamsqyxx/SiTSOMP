import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/layanan/cards — daftar kartu layanan aktif (publik),
// urut sesuai `urutan` lalu terbaru. Dipakai halaman /layanan/surat.
export async function GET() {
  try {
    const cards = await prisma.layananCard.findMany({
      where: { is_active: true },
      orderBy: [{ urutan: "asc" }, { created_at: "desc" }],
      select: {
        id: true,
        judul: true,
        deskripsi: true,
        icon: true,
        link_url: true,
        label_tombol: true,
      },
    });
    return NextResponse.json({ data: cards });
  } catch (err) {
    console.error("GET /api/layanan/cards:", err);
    return NextResponse.json(
      { data: [], error: "Gagal memuat kartu layanan." },
      { status: 500 }
    );
  }
}
