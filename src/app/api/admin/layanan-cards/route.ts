import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Validasi URL: hanya http(s) absolut. Cegah javascript:/data: injection
// karena tombol kartu dirender langsung dengan href ini.
function validUrl(url: string): boolean {
  try {
    const u = new URL(url);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

interface CardBody {
  judul?: unknown;
  deskripsi?: unknown;
  icon?: unknown;
  link_url?: unknown;
  label_tombol?: unknown;
  urutan?: unknown;
  is_active?: unknown;
}

// Ambil field body yang valid; return error string bila tidak lolos.
function parseBody(
  body: CardBody,
  wajibSemua: boolean
): { data?: Record<string, string | number | boolean>; error?: string } {
  const judul = typeof body.judul === "string" ? body.judul.trim() : "";
  const deskripsi =
    typeof body.deskripsi === "string" ? body.deskripsi.trim() : "";
  const icon = typeof body.icon === "string" ? body.icon.trim() : "";
  const linkUrl = typeof body.link_url === "string" ? body.link_url.trim() : "";
  const labelTombol =
    typeof body.label_tombol === "string" ? body.label_tombol.trim() : "";

  if (wajibSemua && (!judul || !deskripsi || !linkUrl)) {
    return { error: "Judul, deskripsi, dan link wajib diisi." };
  }
  if (linkUrl && !validUrl(linkUrl)) {
    return {
      error:
        "Link harus URL http/https yang valid (contoh: https://contoh.id).",
    };
  }

  const data: Record<string, string | number | boolean> = {};
  if (judul) data.judul = judul.slice(0, 150);
  if (deskripsi) data.deskripsi = deskripsi.slice(0, 1000);
  if (icon) data.icon = icon.slice(0, 50);
  if (linkUrl) data.link_url = linkUrl.slice(0, 2000);
  if (labelTombol) data.label_tombol = labelTombol.slice(0, 50);
  if (body.urutan !== undefined) {
    const n = Number(body.urutan);
    if (Number.isFinite(n)) data.urutan = Math.trunc(n);
  }
  if (typeof body.is_active === "boolean") data.is_active = body.is_active;
  return { data };
}

// GET /api/admin/layanan-cards — semua kartu termasuk nonaktif.
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }
  try {
    const cards = await prisma.layananCard.findMany({
      orderBy: [{ urutan: "asc" }, { created_at: "desc" }],
    });
    return NextResponse.json({ data: cards });
  } catch (err) {
    console.error("GET /api/admin/layanan-cards:", err);
    return NextResponse.json(
      { error: "Gagal memuat kartu layanan." },
      { status: 500 }
    );
  }
}

// POST /api/admin/layanan-cards — tambah kartu.
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }
  try {
    const parsed = parseBody(await req.json(), true);
    if (parsed.error || !parsed.data) {
      return NextResponse.json(
        { error: parsed.error ?? "Data tidak valid." },
        { status: 400 }
      );
    }
    const created = await prisma.layananCard.create({
      data: parsed.data as never,
    });
    return NextResponse.json({ data: created }, { status: 201 });
  } catch (err) {
    console.error("POST /api/admin/layanan-cards:", err);
    return NextResponse.json({ error: "Gagal menambah kartu." }, { status: 500 });
  }
}

// PATCH /api/admin/layanan-cards — ubah kartu ({ id, ...field }).
export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }
  try {
    const body = (await req.json()) as CardBody & { id?: unknown };
    const id = typeof body.id === "string" ? body.id : "";
    if (!id) {
      return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
    }
    const parsed = parseBody(body, false);
    if (parsed.error) {
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    }
    if (!parsed.data || Object.keys(parsed.data).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada perubahan yang dikirim." },
        { status: 400 }
      );
    }
    const existing = await prisma.layananCard.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Kartu tidak ditemukan." },
        { status: 404 }
      );
    }
    const updated = await prisma.layananCard.update({
      where: { id },
      data: parsed.data as never,
    });
    return NextResponse.json({ data: updated });
  } catch (err) {
    console.error("PATCH /api/admin/layanan-cards:", err);
    return NextResponse.json({ error: "Gagal mengubah kartu." }, { status: 500 });
  }
}

// DELETE /api/admin/layanan-cards?id=... — hapus permanen.
export async function DELETE(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "id wajib diisi." }, { status: 400 });
  }
  try {
    const existing = await prisma.layananCard.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json(
        { error: "Kartu tidak ditemukan." },
        { status: 404 }
      );
    }
    await prisma.layananCard.delete({ where: { id } });
    return NextResponse.json({ message: "Kartu dihapus." });
  } catch (err) {
    console.error("DELETE /api/admin/layanan-cards:", err);
    return NextResponse.json({ error: "Gagal menghapus kartu." }, { status: 500 });
  }
}
