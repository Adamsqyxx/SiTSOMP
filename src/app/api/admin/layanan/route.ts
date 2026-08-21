import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  menunggu_verifikasi: "Menunggu Verifikasi",
  dalam_proses: "Dalam Proses",
  perlu_revisi: "Perlu Revisi",
  disetujui: "Disetujui",
  ditolak: "Ditolak",
  selesai: "Selesai",
};

// GET /api/admin/layanan — daftar permohonan surat untuk antrean admin.
// Query: ?status=menunggu_verifikasi|dalam_proses|disetujui|ditolak|selesai
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const statusParam = new URL(req.url).searchParams.get("status");
    const where =
      statusParam && statusParam in STATUS_LABEL
        ? { status: statusParam as never }
        : undefined;

    const rows = await prisma.serviceRequest.findMany({
      where,
      orderBy: [{ diajukan_at: "desc" }, { created_at: "desc" }],
      take: 200,
    });

    const pemohonIds = [...new Set(rows.map((r) => r.pemohon_id))];
    const jenisIds = [...new Set(rows.map((r) => r.jenis_surat_id))];

    const [pemohons, jenisList] = await Promise.all([
      prisma.user.findMany({
        where: { id: { in: pemohonIds } },
        select: { id: true, nama_lengkap: true, email: true, nik: true },
      }),
      prisma.jenisSurat.findMany({
        where: { id: { in: jenisIds } },
        select: { id: true, nama: true, kode: true },
      }),
    ]);

    const pemohonMap = Object.fromEntries(pemohons.map((u) => [u.id, u]));
    const jenisMap = Object.fromEntries(jenisList.map((j) => [j.id, j]));

    const data = rows.map((r) => ({
      id: r.id,
      nomor_permohonan: r.nomor_permohonan,
      jenis_surat: jenisMap[r.jenis_surat_id]?.nama ?? "-",
      kode_surat: jenisMap[r.jenis_surat_id]?.kode ?? "-",
      nama_pemohon: pemohonMap[r.pemohon_id]?.nama_lengkap ?? "(warga terhapus)",
      nik_pemohon: pemohonMap[r.pemohon_id]?.nik ?? null,
      form_data: safeParse(r.form_data),
      catatan_petugas: r.catatan_petugas,
      status: r.status,
      status_label: STATUS_LABEL[r.status] ?? r.status,
      diajukan_at: r.diajukan_at,
      diproses_at: r.diproses_at,
      selesai_at: r.selesai_at,
    }));

    return NextResponse.json({
      data,
      counts: await countByStatus(),
    });
  } catch (err) {
    console.error("GET /api/admin/layanan:", err);
    return NextResponse.json(
      { error: "Gagal memuat permohonan surat." },
      { status: 500 }
    );
  }
}

async function countByStatus() {
  try {
    const grouped = await prisma.serviceRequest.groupBy({
      by: ["status"],
      _count: { _all: true },
    });
    const counts: Record<string, number> = {};
    let total = 0;
    for (const g of grouped) {
      counts[g.status] = g._count._all;
      total += g._count._all;
    }
    counts.total = total;
    return counts;
  } catch {
    return {} as Record<string, number>;
  }
}

function safeParse(raw: string | null): Record<string, unknown> | null {
  if (!raw) return null;
  try {
    const v = JSON.parse(raw);
    return typeof v === "object" && v !== null ? (v as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

// PATCH /api/admin/layanan — setujui/tolak/proses satu permohonan.
// Body JSON: { id, aksi: "setujui"|"tolak"|"proses"|"revisi"|"selesai", catatan? }
export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const body = await req.json();

    const id = typeof body?.id === "string" ? body.id : "";
    const aksi = typeof body?.aksi === "string" ? body.aksi : "";
    const catatan = typeof body?.catatan === "string" ? body.catatan.trim() : "";

    if (!id) {
      return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
    }

    const STATUS_BY_AKSI: Record<string, string> = {
      setujui: "disetujui",
      tolak: "ditolak",
      proses: "dalam_proses",
      revisi: "perlu_revisi",
      selesai: "selesai",
    };
    const statusBaru = STATUS_BY_AKSI[aksi];
    if (!statusBaru) {
      return NextResponse.json(
        { error: "aksi tidak dikenal (setujui|tolak|proses|revisi|selesai)." },
        { status: 400 }
      );
    }

    const existing = await prisma.serviceRequest.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Permohonan tidak ditemukan." },
        { status: 404 }
      );
    }

    const now = new Date();
    const data: {
      status: never;
      petugas_id: string;
      catatan_petugas?: string | null;
      diproses_at?: Date;
      selesai_at?: Date;
    } = {
      status: statusBaru as never,
      petugas_id: session.user.id,
    };
    if (catatan) data.catatan_petugas = catatan;

    if (aksi !== "revisi") data.diproses_at = existing.diproses_at ?? now;
    if (aksi === "selesai") data.selesai_at = now;

    const updated = await prisma.serviceRequest.update({
      where: { id },
      data: data as never,
    });

    return NextResponse.json({
      message: `Permohonan ${updated.nomor_permohonan} diperbarui.`,
      status: updated.status,
    });
  } catch (err) {
    console.error("PATCH /api/admin/layanan:", err);
    return NextResponse.json({ error: "Gagal memperbarui permohonan." }, { status: 500 });
  }
}
