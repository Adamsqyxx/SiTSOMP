import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import type { Prisma } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JENIS_VALID = ["berita", "pengumuman", "kegiatan", "anggaran"];

// PUT /api/admin/informasi/[id] — ubah berita/pengumuman.
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.informasiPublik.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Berita/pengumuman tidak ditemukan." },
        { status: 404 }
      );
    }

    const body = (await req.json()) as {
      jenis?: string;
      judul?: string;
      konten?: string;
      thumbnail_url?: string | null;
      is_published?: boolean;
      kegiatan_mulai?: string | null;
      kegiatan_selesai?: string | null;
      lokasi_kegiatan?: string | null;
    };

    if (body.jenis && !JENIS_VALID.includes(body.jenis)) {
      return NextResponse.json({ error: "Jenis tidak valid." }, { status: 400 });
    }
    if (body.judul !== undefined && !body.judul.trim()) {
      return NextResponse.json({ error: "Judul wajib diisi." }, { status: 400 });
    }
    if (body.konten !== undefined && !body.konten.trim()) {
      return NextResponse.json({ error: "Konten wajib diisi." }, { status: 400 });
    }

    const isPublished = body.is_published ?? existing.is_published;
    // Tanggal terbit hanya diset saat pertama kali publish.
    const publishedAt =
      isPublished && !existing.published_at ? new Date() : existing.published_at;

    const data: Prisma.InformasiPublikUpdateInput = {};
    if (body.jenis)
      data.jenis = body.jenis as "berita" | "pengumuman" | "kegiatan" | "anggaran";
    if (body.judul !== undefined) data.judul = body.judul.trim();
    if (body.konten !== undefined) data.konten = body.konten.trim();
    if (body.thumbnail_url !== undefined)
      data.thumbnail_url = body.thumbnail_url?.trim() || null;
    data.is_published = isPublished;
    data.published_at = publishedAt;
    if (body.kegiatan_mulai !== undefined)
      data.kegiatan_mulai = body.kegiatan_mulai ? new Date(body.kegiatan_mulai) : null;
    if (body.kegiatan_selesai !== undefined)
      data.kegiatan_selesai = body.kegiatan_selesai
        ? new Date(body.kegiatan_selesai)
        : null;
    if (body.lokasi_kegiatan !== undefined)
      data.lokasi_kegiatan = body.lokasi_kegiatan?.trim() || null;

    const row = await prisma.informasiPublik.update({ where: { id }, data });
    return NextResponse.json({ data: row });
  } catch (err) {
    console.error("PUT /api/admin/informasi/[id]:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan perubahan." },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/informasi/[id] — hapus berita/pengumuman.
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.informasiPublik.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Berita/pengumuman tidak ditemukan." },
        { status: 404 }
      );
    }

    await prisma.informasiPublik.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("DELETE /api/admin/informasi/[id]:", err);
    return NextResponse.json(
      { error: "Gagal menghapus." },
      { status: 500 }
    );
  }
}
