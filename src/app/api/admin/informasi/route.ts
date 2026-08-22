import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import type { Prisma } from "@/generated/prisma/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const JENIS_VALID = ["berita", "pengumuman", "kegiatan", "anggaran"];

// GET /api/admin/informasi — daftar semua berita/pengumuman (termasuk draft).
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  const rows = await prisma.informasiPublik.findMany({
    orderBy: [{ published_at: "desc" }, { created_at: "desc" }],
  });
  return NextResponse.json({ data: rows });
}

// POST /api/admin/informasi — buat berita/pengumuman baru.
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
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

    const judul = body.judul?.trim() ?? "";
    const konten = body.konten?.trim() ?? "";
    if (!judul || !konten) {
      return NextResponse.json(
        { error: "Judul dan konten wajib diisi." },
        { status: 400 }
      );
    }
    if (!body.jenis || !JENIS_VALID.includes(body.jenis)) {
      return NextResponse.json({ error: "Jenis tidak valid." }, { status: 400 });
    }

    const isPublished = body.is_published ?? true;
    const data: Prisma.InformasiPublikCreateInput = {
      penulis_id: session.user.id,
      jenis: body.jenis as "berita" | "pengumuman" | "kegiatan" | "anggaran",
      judul,
      konten,
      thumbnail_url: body.thumbnail_url?.trim() || null,
      is_published: isPublished,
      published_at: isPublished ? new Date() : null,
      kegiatan_mulai: body.kegiatan_mulai ? new Date(body.kegiatan_mulai) : null,
      kegiatan_selesai: body.kegiatan_selesai
        ? new Date(body.kegiatan_selesai)
        : null,
      lokasi_kegiatan: body.lokasi_kegiatan?.trim() || null,
    };

    const row = await prisma.informasiPublik.create({ data });
    return NextResponse.json({ data: row }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/informasi:", err);
    return NextResponse.json(
      { error: "Gagal membuat berita/pengumuman." },
      { status: 500 }
    );
  }
}
