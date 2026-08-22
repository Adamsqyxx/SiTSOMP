import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/layanan — kirim pengajuan surat (warga login).
// Body: { kode, jenis?, data }. Permohonan tersimpan di tabel service_requests
// dengan status awal menunggu_verifikasi, lalu diproses admin di /admin.
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const kode = typeof body?.kode === "string" ? body.kode.trim().toLowerCase() : "";
    const jenis = typeof body?.jenis === "string" ? body.jenis.trim() : "";
    const data = body?.data;
    const lampiran = body?.lampiran;

    if (!kode || !data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Data pengajuan tidak lengkap." },
        { status: 400 }
      );
    }

    // Lampiran: array { label, url } dari upload client ke Supabase Storage.
    const lampiranValid =
      Array.isArray(lampiran) &&
      lampiran.every(
        (l: unknown) =>
          l &&
          typeof l === "object" &&
          typeof (l as { label?: unknown }).label === "string" &&
          typeof (l as { url?: unknown }).url === "string"
      );
    if (lampiran && !lampiranValid) {
      return NextResponse.json(
        { error: "Format lampiran tidak valid." },
        { status: 400 }
      );
    }

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Silakan masuk terlebih dahulu untuk mengajukan surat." },
        { status: 401 }
      );
    }

    // Cari/buat jenis surat berdasarkan kode.
    let jenisSurat = await prisma.jenisSurat.findUnique({ where: { kode } });
    if (!jenisSurat) {
      jenisSurat = await prisma.jenisSurat.create({
        data: {
          kode,
          nama: jenis || kode.toUpperCase(),
          deskripsi: `Pengajuan ${jenis || kode.toUpperCase()}`,
          is_active: true,
          estimasi_hari_proses: 3,
        },
      });
    }

    // Nama pemohon dari form; kalau kosong pakai nama akun.
    const formData = data as Record<string, unknown>;
    const namaPemohon =
      typeof formData.nama_lengkap === "string" && formData.nama_lengkap.trim()
        ? formData.nama_lengkap.trim()
        : (session.user.nama_lengkap ?? session.user.name ?? "(tanpa nama)");

    const nomorPermohonan = await buatNomorUnik();

    const created = await prisma.serviceRequest.create({
      data: {
        nomor_permohonan: nomorPermohonan,
        pemohon_id: session.user.id,
        jenis_surat_id: jenisSurat.id,
        form_data: JSON.stringify({
          ...formData,
          _nama_pemohon: namaPemohon,
          lampiran: lampiranValid ? (lampiran as unknown[]) : undefined,
        }),
        status: "menunggu_verifikasi",
      },
    });

    return NextResponse.json(
      {
        message: "Pengajuan diterima. Pantau status di Dashboard.",
        nomor_permohonan: created.nomor_permohonan,
        id: created.id,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/layanan:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server." },
      { status: 500 }
    );
  }
}

async function buatNomorUnik(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const now = new Date();
    const tanggal = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0"),
    ].join("");
    const acak = Math.floor(1000 + Math.random() * 9000);
    const kandidat = `REG-${tanggal}-${acak}`;
    const ada = await prisma.serviceRequest.findUnique({
      where: { nomor_permohonan: kandidat },
    });
    if (!ada) return kandidat;
  }
  throw new Error("Gagal membuat nomor permohonan unik");
}
