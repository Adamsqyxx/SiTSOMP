import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/wilayah — daftar RW + RT Kel. Tiro Sompe untuk dropdown
// pemilihan lokasi pengaduan.
export async function GET() {
  try {
    const rws = await prisma.wilayahRW.findMany({
      orderBy: { nomor_rw: "asc" },
      select: {
        id: true,
        nomor_rw: true,
        rt_list: {
          orderBy: { nomor_rt: "asc" },
          select: { id: true, nomor_rt: true },
        },
      },
    });

    return NextResponse.json({ data: rws });
  } catch (err) {
    console.error("GET /api/wilayah:", err);
    return NextResponse.json(
      { error: "Gagal memuat daftar wilayah RT/RW." },
      { status: 500 }
    );
  }
}
