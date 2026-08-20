import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Daftar penduduk (fungsional, sederhana). Catatan: model `Penduduk` dan
// `KartuKeluarga` di schema TIDAK punya relasi Prisma (hanya foreign key).
// Alamat diambil dari tabel `kartu_keluarga` lewat kk_id (query terpisah)
// agar tidak bergantung pada generated client yang lama.
export async function GET() {
  try {
    const penduduk = await prisma.penduduk.findMany({
      select: {
        id: true,
        kk_id: true,
        nik: true,
        nama_lengkap: true,
      },
      orderBy: { nama_lengkap: "asc" },
      take: 100,
    });

    const kkIds = [...new Set(penduduk.map((p) => p.kk_id).filter(Boolean))];
    let alamatByKk: Record<string, string> = {};
    if (kkIds.length > 0) {
      try {
        const kks = await prisma.kartuKeluargaRelation.findMany({
          where: { id: { in: kkIds as string[] } },
          select: { id: true, alamat_lengkap: true },
        });
        alamatByKk = Object.fromEntries(
          kks.map((k) => [k.id, k.alamat_lengkap])
        );
      } catch {
        alamatByKk = {};
      }
    }

    const data = penduduk.map((p) => ({
      nik: p.nik,
      nama_lengkap: p.nama_lengkap,
      alamat: alamatByKk[p.kk_id] ?? "",
    }));

    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/penduduk:", err);
    return NextResponse.json(
      { error: "Gagal memuat data penduduk" },
      { status: 500 }
    );
  }
}