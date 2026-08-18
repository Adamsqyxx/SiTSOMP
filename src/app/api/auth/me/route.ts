import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({
    user: {
      id: user.id,
      email: user.email,
      nama_lengkap:
        (user.user_metadata?.nama_lengkap as string) ??
        (user.email as string),
      role: (user.user_metadata?.role as string) ?? "warga",
    },
  });
}