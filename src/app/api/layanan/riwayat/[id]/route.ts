import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/layanan/riwayat/[id] — detail satu permohonan milik user login.
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
  }

  const { id } = await params;

  try {
    const r = await prisma.serviceRequest.findFirst({
      where: { id, pemohon_id: session.user.id },
    });
    if (!r) {
      return NextResponse.json(
        { error: "Permohonan tidak ditemukan." },
        { status: 404 }
      );
    }

    const jenis = await prisma.jenisSurat.findUnique({
      where: { id: r.jenis_surat_id },
      select: { nama: true, kode: true, estimasi_hari_proses: true },
    });

    const STATUS_LABEL: Record<string, string> = {
      menunggu_verifikasi: "Menunggu Verifikasi",
      dalam_proses: "Dalam Proses",
      perlu_revisi: "Perlu Revisi",
      disetujui: "Disetujui",
      ditolak: "Ditolak",
      selesai: "Selesai",
    };

    return NextResponse.json({
      data: {
        id: r.id,
        nomor_permohonan: r.nomor_permohonan,
        jenis_surat: jenis?.nama ?? "-",
        kode_surat: jenis?.kode ?? "-",
        estimasi_hari_proses: jenis?.estimasi_hari_proses ?? null,
        status: r.status,
        status_label: STATUS_LABEL[r.status] ?? r.status,
        catatan_petugas: r.catatan_petugas,
        diajukan_at: r.diajukan_at,
        diproses_at: r.diproses_at,
        selesai_at: r.selesai_at,
      },
    });
  } catch (err) {
    console.error("GET /api/layanan/riwayat/[id]:", err);
    return NextResponse.json(
      { error: "Gagal memuat detail permohonan." },
      { status: 500 }
    );
  }
}
