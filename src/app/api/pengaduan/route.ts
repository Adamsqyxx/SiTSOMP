import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Validasi input: judul & deskripsi dibersihkan dari spasi berlebih,
// koordinat opsional (dikirim dari form pilih titik di peta).
const CreateComplaintSchema = z.object({
  kategori: z.enum(["infrastruktur", "sosial", "keamanan", "administrasi", "lainnya"]),
  judul: z
    .string()
    .trim()
    .min(5, "Judul minimal 5 karakter")
    .max(120, "Judul maksimal 120 karakter"),
  deskripsi: z
    .string()
    .trim()
    .min(20, "Deskripsi minimal 20 karakter")
    .max(2000, "Deskripsi maksimal 2000 karakter"),
  latitude: z.coerce.number().min(-90).max(90).optional().nullable(),
  longitude: z.coerce.number().min(-180).max(180).optional().nullable(),
});

export async function GET() {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    // Hanya pengguna login yang boleh melihat daftar pengaduannya sendiri.
    if (!userId) {
      return NextResponse.json({ error: "Anda harus masuk terlebih dahulu." }, { status: 401 });
    }

    const complaints = await prisma.complaint.findMany({
      where: { pelapor_id: userId },
      orderBy: { created_at: "desc" },
      select: {
        id: true,
        nomor_tiket: true,
        kategori: true,
        judul: true,
        deskripsi: true,
        status: true,
        latitude: true,
        longitude: true,
        respons_petugas: true,
        created_at: true,
        updated_at: true,
      },
    });

    return NextResponse.json({ data: complaints });
  } catch (err) {
    console.error("GET /api/pengaduan:", err);
    return NextResponse.json({ error: "Gagal memuat daftar pengaduan." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const userId = session?.user?.id ?? null;

    if (!userId) {
      return NextResponse.json({ error: "Anda harus masuk terlebih dahulu." }, { status: 401 });
    }

    const body = await req.json().catch(() => null);
    const parsed = CreateComplaintSchema.safeParse(body ?? {});
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return NextResponse.json(
        { error: first?.message ?? "Data pengaduan tidak valid." },
        { status: 400 }
      );
    }

    const { kategori, judul, deskripsi, latitude, longitude } = parsed.data;

    // Koordinat wajib berada di dalam batas Kel. Tiro Sompe (PostGIS).
    if (latitude != null && longitude != null) {
      const dalam = await prisma.$queryRaw<{ dalam: boolean }[]>`
        SELECT ST_Contains(
          b.geom,
          ST_SetSRID(ST_MakePoint(${longitude}::double precision, ${latitude}::double precision), 4326)
        ) AS dalam
        FROM lokasi b
        WHERE b.geom IS NOT NULL AND b.jenis = 'batas_kelurahan'::"JenisLokasi"
        LIMIT 1
      `;
      if (dalam[0] && dalam[0].dalam === false) {
        return NextResponse.json(
          { error: "Lokasi kejadian di luar batas Kelurahan Tiro Sompe." },
          { status: 422 }
        );
      }
    }

    // Nomor tiket unik: PGN-yyyymmdd-XXXX (XXXX = 4 digit acak).
    const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const rand = Math.floor(1000 + Math.random() * 9000);
    const nomorTiket = `PGN-${dateStr}-${rand}`;

    const complaint = await prisma.complaint.create({
      data: {
        nomor_tiket: nomorTiket,
        pelapor_id: userId,
        kategori,
        judul: judul.trim(),
        deskripsi: deskripsi.trim(),
        status: "baru",
        latitude: latitude != null ? latitude : null,
        longitude: longitude != null ? longitude : null,
      },
    });

    return NextResponse.json(
      { message: "Pengaduan berhasil dikirim.", data: complaint },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/pengaduan:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}