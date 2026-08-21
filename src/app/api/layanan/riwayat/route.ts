import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/layanan/riwayat — pengajuan milik user yang sedang login.
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Belum masuk." }, { status: 401 });
    }

    const rows = await prisma.serviceRequest.findMany({
      where: { pemohon_id: session.user.id },
      orderBy: [{ diajukan_at: "desc" }, { created_at: "desc" }],
      take: 50,
    });

    const jenisIds = [...new Set(rows.map((r) => r.jenis_surat_id))];
    const jenisList =
      jenisIds.length > 0
        ? await prisma.jenisSurat.findMany({
            where: { id: { in: jenisIds } },
            select: { id: true, nama: true, kode: true },
          })
        : [];
    const jenisMap = Object.fromEntries(jenisList.map((j) => [j.id, j]));

    const STATUS_LABEL: Record<string, string> = {
      menunggu_verifikasi: "Menunggu Verifikasi",
      dalam_proses: "Dalam Proses",
      perlu_revisi: "Perlu Revisi",
      disetujui: "Disetujui",
      ditolak: "Ditolak",
      selesai: "Selesai",
    };

    const data = rows.map((r) => ({
      id: r.id,
      nomor_permohonan: r.nomor_permohonan,
      jenis_surat: jenisMap[r.jenis_surat_id]?.nama ?? "-",
      status: r.status,
      status_label: STATUS_LABEL[r.status] ?? r.status,
      catatan_petugas: r.catatan_petugas,
      diajukan_at: r.diajukan_at,
      diproses_at: r.diproses_at,
      selesai_at: r.selesai_at,
    }));

    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/layanan/riwayat:", err);
    return NextResponse.json(
      { error: "Gagal memuat riwayat pengajuan." },
      { status: 500 }
    );
  }
}
