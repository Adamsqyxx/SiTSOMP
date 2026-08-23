import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Statistik kependudukan publik untuk beranda. Hanya angka agregat (tanpa
// data pribadi). Total menghitung penduduk berstatus aktif; breakdown
// laki_laki/perempuan juga hanya dari yang aktif.
export async function GET() {
  try {
    const [total, lakiLaki, perempuan, kk] = await Promise.all([
      prisma.penduduk.count({ where: { status_penduduk: "aktif" } }),
      prisma.penduduk.count({ where: { status_penduduk: "aktif", jenis_kelamin: "laki_laki" } }),
      prisma.penduduk.count({ where: { status_penduduk: "aktif", jenis_kelamin: "perempuan" } }),
      prisma.kartuKeluargaRelation.count(),
    ]);

    return NextResponse.json(
      { total, laki_laki: lakiLaki, perempuan, kartu_keluarga: kk },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err) {
    console.error("GET /api/penduduk/statistik:", err);
    return NextResponse.json(
      { error: "Gagal memuat statistik penduduk." },
      { status: 500 }
    );
  }
}
