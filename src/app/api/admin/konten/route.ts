import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";
import {
  SITE_CONTENT_DEFAULTS,
  type SiteContentKey,
  type KontakKonten,
  type KebijakanPrivasiKonten,
  type PetaSitusKonten,
} from "@/lib/site-content";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const VALID_KEYS = Object.keys(SITE_CONTENT_DEFAULTS) as SiteContentKey[];

// GET /api/admin/konten — muat semua konten statis untuk editor admin.
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const rows = await prisma.siteContent.findMany();
    const byKey = new Map(rows.map((r) => [r.key, r.data]));
    const data: Record<string, unknown> = {};
    for (const key of VALID_KEYS) {
      let value: unknown;
      try {
        value = byKey.has(key) ? JSON.parse(byKey.get(key)!) : SITE_CONTENT_DEFAULTS[key];
      } catch {
        value = SITE_CONTENT_DEFAULTS[key];
      }
      data[key] = value;
    }
    return NextResponse.json({ data });
  } catch (err) {
    console.error("GET /api/admin/konten:", err);
    return NextResponse.json(
      { error: "Gagal memuat konten." },
      { status: 500 }
    );
  }
}

// Validasi bentuk konten per key sebelum simpan.
function validateKontak(v: unknown): string | null {
  const k = v as Partial<KontakKonten> | null;
  if (!k || typeof k !== "object") return "Data kontak tidak valid.";
  for (const field of ["alamat", "telepon", "email", "jam_layanan"] as const) {
    const arr = k[field];
    if (!Array.isArray(arr) || arr.some((l) => typeof l !== "string" || !l.trim())) {
      return `Kolom "${field}" harus berupa daftar baris teks yang tidak kosong.`;
    }
  }
  return null;
}

function validateKebijakan(v: unknown): string | null {
  const p = v as Partial<KebijakanPrivasiKonten> | null;
  if (!p || typeof p !== "object" || !Array.isArray(p.bagian)) {
    return "Data kebijakan tidak valid.";
  }
  for (const b of p.bagian) {
    if (!b || typeof b.judul !== "string" || !b.judul.trim() ||
        typeof b.isi !== "string" || !b.isi.trim()) {
      return "Setiap bagian kebijakan butuh judul dan isi yang tidak kosong.";
    }
  }
  return null;
}

function validatePetaSitus(v: unknown): string | null {
  const s = v as Partial<PetaSitusKonten> | null;
  if (!s || typeof s !== "object" || !Array.isArray(s.grup)) {
    return "Data peta situs tidak valid.";
  }
  for (const g of s.grup) {
    if (!g || typeof g.title !== "string" || !g.title.trim() || !Array.isArray(g.items)) {
      return "Setiap grup butuh judul dan daftar tautan.";
    }
    for (const it of g.items) {
      if (!it || typeof it.label !== "string" || !it.label.trim() ||
          typeof it.href !== "string" || !it.href.trim()) {
        return "Setiap tautan butuh label dan URL tujuan.";
      }
    }
  }
  return null;
}

// PUT /api/admin/konten — simpan satu key. Body: { key, data }.
export async function PUT(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  let body: { key?: string; data?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body bukan JSON valid." }, { status: 400 });
  }

  const key = body.key as SiteContentKey | undefined;
  if (!key || !VALID_KEYS.includes(key)) {
    return NextResponse.json({ error: "Key konten tidak dikenal." }, { status: 400 });
  }

  const validators: Record<SiteContentKey, (v: unknown) => string | null> = {
    kontak: validateKontak,
    kebijakan_privasi: validateKebijakan,
    peta_situs: validatePetaSitus,
  };
  const error = validators[key](body.data);
  if (error) {
    return NextResponse.json({ error }, { status: 400 });
  }

  try {
    const data = JSON.stringify(body.data);
    await prisma.siteContent.upsert({
      where: { key },
      update: { data, updated_by: session.user.id ?? null },
      create: { key, data, updated_by: session.user.id ?? null },
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PUT /api/admin/konten:", err);
    return NextResponse.json(
      { error: "Gagal menyimpan konten." },
      { status: 500 }
    );
  }
}
