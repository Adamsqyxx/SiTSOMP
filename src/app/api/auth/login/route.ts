import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    // Terima `identifier` (kontrak baru) dan `email` (kontrak lama/klien lain).
    const identifier = body?.identifier ?? body?.email;
    const password = body?.password;

    if (!identifier || !password) {
      return NextResponse.json(
        { error: "Email dan kata sandi wajib diisi." },
        { status: 400 }
      );
    }

    // signIn dari route handler: credential login, tanpa redirect.
    // Return {} kalau sukses; lempar AuthError (CredentialsSignin) kalau gagal.
    await signIn("credentials", {
      identifier: String(identifier),
      password: String(password),
      redirectTo: undefined,
      redirect: false,
    });

    return NextResponse.json({ message: "Login berhasil" });
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json(
        { error: "Email atau kata sandi salah." },
        { status: 401 }
      );
    }
    console.error("POST /api/auth/login:", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}