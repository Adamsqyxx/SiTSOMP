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

    // Validasi dasar — semua field wajib (NIK, email, nama, No HP, kata sandi).
    if (!password || !nama_lengkap || !email || !nomor_hp) {
      return NextResponse.json({ error: "Nama lengkap, email, nomor telepon/WhatsApp, dan kata sandi wajib diisi." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Kata sandi minimal 8 karakter." }, { status: 400 });
    }
    if (!nik || !/^\d{16}$/.test(nik)) {
      return NextResponse.json({ error: "NIK wajib diisi dan harus 16 digit angka." }, { status: 400 });
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }
    if (nomor_hp && !/^[0-9+\-\s()]{8,16}$/.test(String(nomor_hp))) {
      return NextResponse.json({ error: "Nomor telepon tidak valid." }, { status: 400 });
    }

    // Cek duplikat NIK/email/No HP lebih dulu.
    const orFilters: { nik?: string; email?: string; nomor_hp?: string }[] = [{ nik }];
    if (email) orFilters.push({ email: String(email).trim().toLowerCase() });
    if (nomor_hp) orFilters.push({ nomor_hp: String(nomor_hp).trim() });

    const existing = await prisma.user.findFirst({
      where: { OR: orFilters },
      select: { nik: true, email: true, nomor_hp: true },
    });
    if (existing) {
      let error = "Email ini sudah terdaftar.";
      if (existing.nik === nik) error = "NIK ini sudah terdaftar.";
      else if (nomor_hp && existing.nomor_hp === String(nomor_hp).trim()) error = "Nomor telepon ini sudah terdaftar.";
      return NextResponse.json({ error }, { status: 409 });
    }

    // Hash password (bcryptjs, 10 rounds).
    const passwordHash = await bcrypt.hash(String(password), 10);

    const user = await prisma.user.create({
      data: {
        email: email ? String(email).trim().toLowerCase() : null,
        nik: nik ?? null,
        nama_lengkap: String(nama_lengkap).trim(),
        nomor_hp: nomor_hp ? String(nomor_hp).trim() : null,
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