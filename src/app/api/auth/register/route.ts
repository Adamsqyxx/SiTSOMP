import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Registrasi warga: buat user di tabel `users` (Prisma) dengan password_hash
// bcrypt. Login memakai Credentials Provider NextAuth (lihat src/auth.ts).
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const { email, password, nik, nama_lengkap, nomor_hp } = body ?? {};

    // Validasi dasar
    if (!email || !password || !nama_lengkap) {
      return NextResponse.json({ error: "Email, kata sandi, dan nama wajib diisi." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Kata sandi minimal 8 karakter." }, { status: 400 });
    }
    if (!nik || !/^\d{16}$/.test(nik)) {
      return NextResponse.json({ error: "NIK wajib diisi dan harus 16 digit angka." }, { status: 400 });
    }
    if (nomor_hp && !/^[0-9+\-\s()]{8,16}$/.test(String(nomor_hp))) {
      return NextResponse.json({ error: "Nomor telepon tidak valid." }, { status: 400 });
    }

    // Cek duplikat NIK/email lebih dulu.
    const existing = await prisma.user.findFirst({
      where: { OR: [{ nik }, { email }] },
      select: { nik: true, email: true },
    });
    if (existing) {
      const isNikDup = existing.nik === nik;
      return NextResponse.json(
        { error: isNikDup ? "NIK ini sudah terdaftar." : "Email ini sudah terdaftar." },
        { status: 409 }
      );
    }

    // Hash password (bcryptjs, 10 rounds).
    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await prisma.user.create({
      data: {
        email: String(email).trim().toLowerCase(),
        nik: nik ?? null,
        nama_lengkap: String(nama_lengkap).trim(),
        nomor_hp: nomor_hp ?? null,
        password_hash: passwordHash,
        role: "warga",
        is_active: true,
      },
    });

    return NextResponse.json(
      { message: "Akun berhasil dibuat. Silakan masuk.", user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (err) {
    console.error("POST /api/auth/register:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}