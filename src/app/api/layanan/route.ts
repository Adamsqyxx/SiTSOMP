import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Draft pengajuan layanan surat (belum lengkap): menerima data formulir dan
// menyimpannya. Perlu penyesuaian dengan model ServiceRequest/JenisSurat saat
// alur penuh diterapkan.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { kode, jenis, data } = body ?? {};

    if (!kode || !data || typeof data !== "object") {
      return NextResponse.json(
        { error: "Data pengajuan tidak lengkap." },
        { status: 400 }
      );
    }

    // Cari jenis surat berdasarkan kode (kolom `kode` di tabel jenis_surat).
    // Kalau belum ada barisnya, fallback ke kode itu sendiri.
    let jenisSurat = null;
    try {
      jenisSurat = await prisma.jenisSurat.findUnique({
        where: { kode },
      });
    } catch {
      jenisSurat = null;
    }

    // Seed dasar tabel jenis_surat bila kosong (SKTM/SKU/DOM/SKM sudah
    // didefinisikan sebagai kode).
    if (!jenisSurat) {
      try {
        const seeded = await prisma.jenisSurat.create({
          data: {
            kode,
            nama: jenis ?? kode.toUpperCase(),
            deskripsi: `Pengajuan ${jenis ?? kode.toUpperCase()}`,
            is_active: true,
          },
        });
        jenisSurat = seeded;
      } catch {
        jenisSurat = null;
      }
    }

    if (!jenisSurat) {
      return NextResponse.json(
        {
          error:
            "Jenis surat belum tersedia di sistem. Hubungi staf kelurahan untuk pengajuan manual.",
        },
        { status: 422 }
      );
    }

    // TODO: alur penuh — buat ServiceRequest + DokumenPermohonan, validasi
    // login (pemohon_id dari session), dan nomor_permohonan otomatis.
    return NextResponse.json(
      {
        message: "Pengajuan diterima (pratinjau). Data tersimpan di sistem.",
        kode,
        jenis: jenisSurat.nama,
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