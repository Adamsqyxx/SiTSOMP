import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan kata sandi wajib diisi." }, { status: 400 });
    }

    // Supabase Auth menyimpan akun dengan email sintetis "<NIK>@sitsomp.id"
    // (register page tidak punya field email). User biasa mengetik NIK-nya saja
    // di form login — normalisasi di sini supaya pencarian auth cocok.
    let identifier = String(email).trim().toLowerCase();
    if (/^\d{16}$/.test(identifier)) {
      identifier = `${identifier}@sitsomp.id`;
    }

    const supabase = await createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: identifier,
      password,
    });

    if (error) {
      const msg = error.message?.toLowerCase() ?? "";
      if (
        msg.includes("invalid login credentials") ||
        msg.includes("invalid email or password")
      ) {
        return NextResponse.json(
          { error: "Email atau kata sandi salah." },
          { status: 401 }
        );
      }
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Login berhasil; cookie session di-set oleh supabase-server.
    return NextResponse.json({
      message: "Login berhasil",
      user: {
        id: data.user?.id,
        email: data.user?.email,
        nama_lengkap:
          (data.user?.user_metadata?.nama_lengkap as string) ??
          (data.user?.email as string),
      },
    });
  } catch (err) {
    console.error("POST /api/auth/login:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}