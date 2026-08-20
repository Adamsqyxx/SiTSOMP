import { NextResponse } from "next/server";
import { signOut } from "@/auth";

export const runtime = "nodejs";

export async function POST() {
  // signOut dari route handler: hapus cookie session (redirect: false = JSON).
  await signOut({ redirect: false });
  return NextResponse.json({ message: "Logout berhasil" });
}