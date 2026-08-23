import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminSession, isAdminRole } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/admin/akun — daftar akun user (admin saja).
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const users = await prisma.user.findMany({
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      nik: true,
      nama_lengkap: true,
      email: true,
      nomor_hp: true,
      role: true,
      is_active: true,
      created_at: true,
    },
  });

  return NextResponse.json({ data: users });
}

// PATCH /api/admin/akun — edit nama, email, dan/atau password akun (admin saja).
// Hanya super_admin boleh mengubah akun sesama staf; petugas dilarang.
export async function PATCH(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, nama_lengkap, email, password, nomor_hp } = await req.json();

    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "ID akun wajib diisi." }, { status: 400 });
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (!target) {
      return NextResponse.json({ error: "Akun tidak ditemukan." }, { status: 404 });
    }

    // Staf non-super_admin tidak boleh mengubah akun staf lain.
    if (
      session.user.role !== "super_admin" &&
      isAdminRole(target.role)
    ) {
      return NextResponse.json(
        { error: "Hanya Super Admin yang dapat mengubah akun staf." },
        { status: 403 }
      );
    }

    const data: Record<string, unknown> = {};

    if (typeof nama_lengkap === "string") {
      const nama = nama_lengkap.trim();
      if (!nama) {
        return NextResponse.json({ error: "Nama tidak boleh kosong." }, { status: 400 });
      }
      data.nama_lengkap = nama;
    }

    if (email !== undefined) {
      // String kosong → hapus email (nullable).
      if (email === null || email === "") {
        data.email = null;
      } else if (typeof email === "string") {
        const em = email.trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
          return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
        }
        // Email sintetis akun lama (<NIK>@sitsomp.id) tidak boleh ditimpa sembarangan.
        if (
          target.email &&
          target.email.endsWith("@sitsomp.id") &&
          em !== target.email
        ) {
          return NextResponse.json(
            {
              error:
                "Akun ini memakai email sistem (<NIK>@sitsomp.id). Isi email pribadi untuk menggantinya.",
            },
            { status: 400 }
          );
        }
        const duplikat = await prisma.user.findUnique({ where: { email: em } });
        if (duplikat && duplikat.id !== id) {
          return NextResponse.json(
            { error: "Email sudah dipakai akun lain." },
            { status: 400 }
          );
        }
        data.email = em;
      }
    }

    if (nomor_hp !== undefined) {
      if (nomor_hp === null || nomor_hp === "") {
        data.nomor_hp = null;
      } else if (typeof nomor_hp === "string") {
        const hp = nomor_hp.replace(/[^0-9+]/g, "");
        const duplikat = await prisma.user.findUnique({ where: { nomor_hp: hp } });
        if (duplikat && duplikat.id !== id) {
          return NextResponse.json(
            { error: "Nomor HP sudah dipakai akun lain." },
            { status: 400 }
          );
        }
        data.nomor_hp = hp;
      }
    }

    if (password !== undefined && password !== null && password !== "") {
      if (typeof password !== "string" || password.length < 8) {
        return NextResponse.json(
          { error: "Password minimal 8 karakter." },
          { status: 400 }
        );
      }
      data.password_hash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json(
        { error: "Tidak ada perubahan yang dikirim." },
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        nik: true,
        nama_lengkap: true,
        email: true,
        nomor_hp: true,
        role: true,
        is_active: true,
      },
    });

    return NextResponse.json({
      message: "Akun berhasil diperbarui.",
      user: updated,
    });
  } catch (error) {
    console.error("Admin Akun PATCH Error:", error);
    return NextResponse.json(
      { error: "Gagal memperbarui akun." },
      { status: 500 }
    );
  }
}
