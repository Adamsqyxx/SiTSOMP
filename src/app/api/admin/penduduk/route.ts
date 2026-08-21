import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Helper: pastikan kartu keluarga ada, buat baru bila belum (alamat opsional).
async function ensureKk(nomorKk: string, alamat?: string | null) {
  const existing = await prisma.kartuKeluargaRelation.findUnique({
    where: { nomor_kk: nomorKk },
  });
  if (existing) {
    if (alamat && alamat !== existing.alamat_lengkap) {
      await prisma.kartuKeluargaRelation.update({
        where: { id: existing.id },
        data: { alamat_lengkap: alamat },
      });
    }
    return existing.id;
  }
  const kk = await prisma.kartuKeluargaRelation.create({
    data: {
      nomor_kk: nomorKk,
      rt_id: "RT-BELUM-DISET",
      alamat_lengkap: alamat ?? "-",
    },
  });
  return kk.id;
}

// GET /api/admin/penduduk — daftar penduduk untuk tabel admin.
export async function GET(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const q = new URL(req.url).searchParams.get("q")?.trim() ?? "";
    const penduduk = await prisma.penduduk.findMany({
      where: q
        ? {
            OR: [
              { nik: { contains: q, mode: "insensitive" } },
              { nama_lengkap: { contains: q, mode: "insensitive" } },
            ],
          }
        : undefined,
      orderBy: { nama_lengkap: "asc" },
      take: 500,
    });

    const kkIds = [...new Set(penduduk.map((p) => p.kk_id).filter(Boolean))];
    let alamatByKk: Record<string, string> = {};
    if (kkIds.length > 0) {
      try {
        const kks = await prisma.kartuKeluargaRelation.findMany({
          where: { id: { in: kkIds as string[] } },
          select: { id: true, alamat_lengkap: true, nomor_kk: true },
        });
        alamatByKk = Object.fromEntries(kks.map((k) => [k.id, k.alamat_lengkap]));
      } catch {
        alamatByKk = {};
      }
    }

    const data = penduduk.map((p) => ({
      ...p,
      tanggal_lahir: p.tanggal_lahir ? p.tanggal_lahir.toISOString().slice(0, 10) : null,
      alamat: alamatByKk[p.kk_id] ?? "",
    }));

    return NextResponse.json({ data, total: data.length });
  } catch (err) {
    console.error("GET /api/admin/penduduk:", err);
    return NextResponse.json({ error: "Gagal memuat data penduduk." }, { status: 500 });
  }
}

// POST /api/admin/penduduk — tambah satu penduduk.
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const nik = String(body?.nik ?? "").trim();
    const nama = String(body?.nama_lengkap ?? "").trim();
    const noKk = String(body?.nomor_kk ?? "").trim();

    if (!/^\d{16}$/.test(nik)) {
      return NextResponse.json(
        { error: "NIK wajib 16 digit angka." },
        { status: 400 }
      );
    }
    if (!nama || !noKk) {
      return NextResponse.json(
        { error: "Nama lengkap dan Nomor KK wajib diisi." },
        { status: 400 }
      );
    }

    const duplikat = await prisma.penduduk.findUnique({ where: { nik } });
    if (duplikat) {
      return NextResponse.json(
        { error: `NIK ${nik} sudah terdaftar (${duplikat.nama_lengkap}).` },
        { status: 409 }
      );
    }

    const kkId = await ensureKk(noKk, String(body?.alamat ?? "") || null);
    const created = await prisma.penduduk.create({
      data: {
        nik,
        nama_lengkap: nama,
        kk_id: kkId,
        tempat_lahir: strOrNull(body?.tempat_lahir),
        tanggal_lahir: parseTanggal(body?.tanggal_lahir),
        jenis_kelamin: normalizeJk(body?.jenis_kelamin),
        agama: strOrNull(body?.agama),
        pekerjaan: strOrNull(body?.pekerjaan),
        pendidikan_terakhir: strOrNull(body?.pendidikan_terakhir),
        status_perkawinan: strOrNull(body?.status_perkawinan),
        status_dalam_kk: strOrNull(body?.status_dalam_kk),
      },
    });

    return NextResponse.json({ message: "Penduduk ditambahkan.", data: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/penduduk:", err);
    return NextResponse.json({ error: "Gagal menambah penduduk." }, { status: 500 });
  }
}

// PATCH /api/admin/penduduk — ubah satu penduduk. Body: { id, ...field }
export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const body = await req.json();
    const id = typeof body?.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
    }

    const existing = await prisma.penduduk.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Penduduk tidak ditemukan." }, { status: 404 });
    }

    const nikBaru =
      body?.nik !== undefined && body.nik !== "" ? String(body.nik).trim() : undefined;
    if (nikBaru !== undefined && !/^\d{16}$/.test(nikBaru)) {
      return NextResponse.json({ error: "NIK wajib 16 digit angka." }, { status: 400 });
    }
    if (nikBaru && nikBaru !== existing.nik) {
      const duplikat = await prisma.penduduk.findUnique({ where: { nik: nikBaru } });
      if (duplikat) {
        return NextResponse.json(
          { error: `NIK ${nikBaru} sudah dipakai orang lain.` },
          { status: 409 }
        );
      }
    }

    let kkId = existing.kk_id;
    if (body?.nomor_kk !== undefined && String(body.nomor_kk).trim()) {
      kkId = await ensureKk(String(body.nomor_kk).trim(), String(body?.alamat ?? "") || null);
    }

    const updated = await prisma.penduduk.update({
      where: { id },
      data: {
        nik: nikBaru ?? undefined,
        nama_lengkap:
          body?.nama_lengkap !== undefined
            ? String(body.nama_lengkap).trim()
            : undefined,
        kk_id: kkId,
        tempat_lahir: body?.tempat_lahir !== undefined ? strOrNull(body.tempat_lahir) : undefined,
        tanggal_lahir:
          body?.tanggal_lahir !== undefined ? parseTanggal(body.tanggal_lahir) : undefined,
        jenis_kelamin:
          body?.jenis_kelamin !== undefined ? normalizeJk(body.jenis_kelamin) : undefined,
        agama: body?.agama !== undefined ? strOrNull(body.agama) : undefined,
        pekerjaan: body?.pekerjaan !== undefined ? strOrNull(body.pekerjaan) : undefined,
        pendidikan_terakhir:
          body?.pendidikan_terakhir !== undefined
            ? strOrNull(body.pendidikan_terakhir)
            : undefined,
        status_perkawinan:
          body?.status_perkawinan !== undefined
            ? strOrNull(body.status_perkawinan)
            : undefined,
        status_dalam_kk:
          body?.status_dalam_kk !== undefined ? strOrNull(body.status_dalam_kk) : undefined,
        status_penduduk:
          body?.status_penduduk !== undefined
            ? (normalizeStatusPenduduk(body.status_penduduk) as never)
            : undefined,
      },
    });

    return NextResponse.json({ message: "Data penduduk diperbarui.", data: updated });
  } catch (err) {
    console.error("PATCH /api/admin/penduduk:", err);
    return NextResponse.json({ error: "Gagal memperbarui data penduduk." }, { status: 500 });
  }
}

// DELETE /api/admin/penduduk?id=... — hapus satu penduduk.
export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) {
      return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
    }

    const existing = await prisma.penduduk.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Penduduk tidak ditemukan." }, { status: 404 });
    }

    // user_id tidak punya relasi Prisma; cukup lepas kaitannya lalu hapus baris.
    await prisma.$executeRawUnsafe(
      `UPDATE penduduk SET user_id = NULL WHERE id = $1`,
      id
    );
    await prisma.penduduk.delete({ where: { id } });

    return NextResponse.json({ message: `Penduduk ${existing.nama_lengkap} dihapus.` });
  } catch (err) {
    console.error("DELETE /api/admin/penduduk:", err);
    return NextResponse.json({ error: "Gagal menghapus penduduk." }, { status: 500 });
  }
}

function strOrNull(v: unknown): string | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim();
  return s ? s : null;
}

function parseTanggal(v: unknown): Date | null {
  const s = strOrNull(v);
  if (!s) return null;
  // Format umum: YYYY-MM-DD atau DD/MM/YYYY
  let d: Date;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
    d = new Date(`${s}T00:00:00`);
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("/");
    d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  } else {
    d = new Date(s);
  }
  return isNaN(d.getTime()) ? null : d;
}

function normalizeJk(v: unknown): "laki_laki" | "perempuan" | null {
  const s = strOrNull(v)?.toLowerCase();
  if (!s) return null;
  if (/^(l|lk|laki|laki-laki|laki_laki|m|male)/.test(s)) return "laki_laki";
  if (/^(p|pr|perempuan|f|female)/.test(s)) return "perempuan";
  return null;
}

function normalizeStatusPenduduk(v: unknown): string {
  const s = strOrNull(v)?.toLowerCase();
  if (!s) return "aktif";
  if (/^(pindah|pindah_keluar|pindah keluar)/.test(s)) return "pindah_keluar";
  if (/^(meninggal|wafat)/.test(s)) return "meninggal";
  return "aktif";
}
