import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Batas wilayah Kel. Tiro Sompe dari tabel `lokasi` (PostGIS).
// Mengembalikan GeoJSON FeatureCollection polygon batas kelurahan (dan opsional
// batas RT/RW bila sudah diisi). Dipakai LeafletMap untuk highlight area.
export async function GET() {
  try {
    // Sementara hanya batas kelurahan yang ditampilkan; batas RT/RW
    // (estimasi) disembunyikan dulu sampai ada data resmi.
    const rows = await prisma.$queryRaw<
      { id: string; nama: string; jenis: string; geojson: string | null }[]
    >`
      SELECT id, nama, jenis::text AS jenis, ST_AsGeoJSON(geom) AS geojson
      FROM lokasi
      WHERE geom IS NOT NULL AND jenis = 'batas_kelurahan'::"JenisLokasi"
    `;

    const features = rows
      .filter((r) => r.geojson)
      .map((r) => ({
        type: "Feature",
        properties: { id: r.id, nama: r.nama, jenis: r.jenis },
        geometry: JSON.parse(r.geojson!),
      }));

    return NextResponse.json({
      data: {
        type: "FeatureCollection",
        features,
      },
    });
  } catch (err) {
    console.error("GET /api/peta/batas:", err);
    return NextResponse.json({ error: "Gagal memuat batas wilayah." }, { status: 500 });
  }
}