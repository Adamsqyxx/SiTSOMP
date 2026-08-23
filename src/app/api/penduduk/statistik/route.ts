import { NextResponse } from "next/server";
import {
  TIRO_SOMPE_STATISTIK,
  KECAMATAN_BACUKIKI_BARAT,
  SUMBER_DATA,
} from "@/lib/bps-penduduk";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/penduduk/statistik — statistik kependudukan Tiro Sompe dari BPS.
export async function GET() {
  return NextResponse.json({
    data: TIRO_SOMPE_STATISTIK,
    kecamatan: KECAMATAN_BACUKIKI_BARAT,
    sumber: SUMBER_DATA,
  });
}
