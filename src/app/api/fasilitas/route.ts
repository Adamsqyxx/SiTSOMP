import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Peta & Informasi Wilayah (Pilar #3): daftar lokasi/fasilitas di Kel.
// Tiro Sompe, dibaca realtime dari tabel `lokasi` (Supabase/PostgreSQL).
// Dikonsumsi client component /peta (fetch) serta Realtime subscription.

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const lokasi = await prisma.lokasi.findMany({
      orderBy: { nama: "asc" },
    });

    // Hanya kirim kolom yang dipakai peta; exlude geom (Unsupported/primitif).
    const features = lokasi
      .filter((l) => l.latitude !== null && l.longitude !== null)
      .map((l) => ({
        id: l.id,
        category: l.jenis,
        name: l.nama,
        address: l.alamat ?? "",
        detail: l.deskripsi ?? "",
        latitude: Number(l.latitude),
        longitude: Number(l.longitude),
      }));

    return NextResponse.json({ data: features });
  } catch (err) {
    console.error("GET /api/fasilitas gagal:", err);
    return NextResponse.json(
      { error: "Gagal memuat data fasilitas" },
      { status: 500 }
    );
  }
}
