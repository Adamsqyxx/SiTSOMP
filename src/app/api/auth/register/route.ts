import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase-admin";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password, nik, nama_lengkap, nomor_hp } = body ?? {};

    // Validasi dasar
    if (!email || !password || !nama_lengkap) {
      return NextResponse.json({ error: "Email, kata sandi, dan nama wajib diisi." }, { status: 400 });
    }
    if (typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Kata sandi minimal 8 karakter." }, { status: 400 });
    }
    if (nik && !/^\d{16}$/.test(nik)) {
      return NextResponse.json({ error: "NIK harus 16 digit angka." }, { status: 400 });
    }

    // 1) Daftarkan user di Supabase Auth (service role agar auto-confirm).
    const admin = createAdminClient();
    if (!admin) {
      return NextResponse.json(
        { error: "Registrasi belum tersedia: service role key belum dikonfigurasi." },
        { status: 500 }
      );
    }

    const { data: authUser, error: signUpError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nama_lengkap, nik: nik ?? null, nomor_hp: nomor_hp ?? null },
    });

    if (signUpError) {
      // Error umum: email sudah terdaftar
      if (signUpError.message?.toLowerCase().includes("already registered")) {
        return NextResponse.json({ error: "Email ini sudah terdaftar." }, { status: 409 });
      }
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }
    const supabaseUserId = authUser.user?.id;
    if (!supabaseUserId) {
      return NextResponse.json({ error: "Gagal membuat akun Supabase." }, { status: 500 });
    }

    // 2) Buat baris User di tabel `users` (Prisma) terhubung via email (unik).
    try {
      const user = await prisma.user.create({
        data: {
          email,
          nik: nik ?? null,
          nama_lengkap,
          nomor_hp: nomor_hp ?? null,
          role: "warga",
          is_active: true,
        },
      });
      return NextResponse.json(
        { message: "Akun berhasil dibuat. Silakan masuk.", user: { id: user.id, email: user.email } },
        { status: 201 }
      );
    } catch (dbErr) {
      // User Supabase sudah dibuat; kalau insert Prisma gagal (mis. email duplikat
      // di tabel users), balas error data — tidak menghapus user Supabase.
      console.error("Gagal insert user ke Prisma:", dbErr);
      return NextResponse.json(
        { error: "Akun dibuat tapi gagal menyimpan data profil. Hubungi admin." },
        { status: 500 }
      );
    }
  } catch (err) {
    console.error("POST /api/auth/register:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}