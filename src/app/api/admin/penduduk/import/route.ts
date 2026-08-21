import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/admin-auth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Format file yang diizinkan untuk import data penduduk.
const FORMAT_OK = ["xlsx", "xlsm", "csv", "ods", "xlsb"] as const;
type FormatOk = (typeof FORMAT_OK)[number];

function ekstensiFile(nama: string): string {
  const bagian = nama.toLowerCase().split(".");
  return bagian.length > 1 ? bagian[bagian.length - 1] : "";
}

// POST /api/admin/penduduk/import — upload file spreadsheet berisi data penduduk.
// multipart/form-data, field "file". Baris pertama = header kolom.
export async function POST(req: Request) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { error: "File tidak ditemukan. Lampirkan file pada field 'file'." },
        { status: 400 }
      );
    }

    // ── Validasi format file (whitelist) ──────────────────────────────
    const ext = ekstensiFile(file.name);
    if (!(FORMAT_OK as readonly string[]).includes(ext)) {
      return NextResponse.json(
        {
          error:
            "Format file tidak sesuai. Gunakan .xlsx, .xlsm, .csv, .ods, atau .xlsb.",
          format_diterima: `.${ext}`,
        },
        { status: 415 }
      );
    }
    const format = ext as FormatOk;

    const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Ukuran file melebihi 10 MB." },
        { status: 413 }
      );
    }

    // ── Parse isi file dengan SheetJS ─────────────────────────────────
    const buffer = Buffer.from(await file.arrayBuffer());
    let rows: Record<string, unknown>[] = [];
    try {
      const wb = XLSX.read(buffer, { type: "buffer", raw: false });
      const sheetName = wb.SheetNames[0];
      if (!sheetName) {
        return NextResponse.json(
          { error: "File tidak berisi sheet apa pun." },
          { status: 422 }
        );
      }
      const ws = wb.Sheets[sheetName];
      rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(ws, {
        defval: "",
        raw: false,
      });
    } catch {
      return NextResponse.json(
        { error: "Gagal membaca isi file. File mungkin rusak atau bukan spreadsheet yang sah." },
        { status: 422 }
      );
    }

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: "File kosong — tidak ada baris data untuk diimport." },
        { status: 422 }
      );
    }

    // ── Normalisasi header & mapping nilai ────────────────────────────
    // Kolom mengikuti file admin; nama kolom dicocokkan longgar (case- &
    // spasi-insensitive) ke field database bila dikenali.
    const norm = (s: unknown) => String(s ?? "").trim();
    const normKey = (s: unknown) =>
      String(s ?? "")
        .trim()
        .toLowerCase()
        .replace(/[\s._-]+/g, "_");

    const kolomAsli = Object.keys(rows[0] ?? {});
    const kolomNorm = kolomAsli.map(normKey);

    const ALIAS_NIK = ["nik", "no_nik", "nomor_nik"];
    const ALIAS_NAMA = ["nama", "nama_lengkap", "namalengkap"];
    const ALIAS_KK = [
      "no_kk", "nokk", "nomor_kk", "no_kartu_keluarga", "nomor_kartu_keluarga",
      "kk", "kartu_keluarga",
    ];
    const idx = (...aliases: string[]) => kolomNorm.findIndex((k) => aliases.includes(k));

    const iNik = idx(...ALIAS_NIK);
    const iNama = idx(...ALIAS_NAMA);

    // NIK + nama wajib ada agar baris bisa diproses.
    if (iNik < 0 || iNama < 0) {
      return NextResponse.json(
        {
          error:
            "Kolom wajib tidak ditemukan. Pastikan file punya kolom 'nik' dan 'nama' (atau 'nama_lengkap').",
          kolom_terbaca: kolomAsli,
        },
        { status: 422 }
      );
    }

    // Indeks kolom lain (opsional) disimpan dinamis sesuai isi file.
    const kolomLain = kolomAsli
      .map((c, i) => ({ c, i }))
      .filter(({ i }) => i !== iNik && i !== iNama);

    let baru = 0;
    let update = 0;
    let gagal = 0;
    const errors: string[] = [];
    const dataRows: Record<string, string>[] = [];

    for (let r = 0; r < rows.length; r++) {
      const row = rows[r];
      const nik = norm(row[kolomAsli[iNik]]).replace(/\D/g, "");
      const nama = norm(row[kolomAsli[iNama]]);

      if (!nik && !nama) continue; // baris benar-benar kosong → lewati diam-diam
      const barisKe = r + 2; // +2: index 0 + baris header

      try {
        if (!/^\d{16}$/.test(nik)) throw new Error("NIK tidak valid (harus 16 digit angka)");
        if (!nama) throw new Error("Nama kosong");

        // KK opsional: kalau kolom ada dan terisi, pastikan kartu keluarga ada.
        let kkId: string | null = null;
        const iKk = idx(...ALIAS_KK);
        if (iKk >= 0) {
          const noKk = norm(row[kolomAsli[iKk]]).replace(/\D/g, "");
          if (noKk) {
            const existing = await prisma.kartuKeluargaRelation.findUnique({
              where: { nomor_kk: noKk },
            });
            kkId =
              existing?.id ??
              (
                await prisma.kartuKeluargaRelation.create({
                  data: {
                    nomor_kk: noKk,
                    rt_id: "RT-BELUM-DISET",
                    alamat_lengkap: "-",
                  },
                })
              ).id;
          }
        }
        if (!kkId) {
          // Tanpa kolom KK → tempelkan ke KK arsip khusus hasil import.
          const ARCHIVE_KK = "IMPORT-TANPA-KK";
          const existing = await prisma.kartuKeluargaRelation.findUnique({
            where: { nomor_kk: ARCHIVE_KK },
          });
          kkId =
            existing?.id ??
            (
              await prisma.kartuKeluargaRelation.create({
                data: { nomor_kk: ARCHIVE_KK, rt_id: "RT-BELUM-DISET", alamat_lengkap: "-" },
              })
            ).id;
        }

        // Nilai semua kolom lain (dinamis).
        const lainnya: Record<string, string> = {};
        for (const { c } of kolomLain) {
          const v = norm(row[c]);
          if (v) lainnya[normKey(c)] = v;
        }

        const payloadPenduduk = {
          nama_lengkap: nama,
          kk_id: kkId,
          tempat_lahir: lainnya["tempat_lahir"] ?? lainnya["tempat"] ?? null,
          tanggal_lahir: parseTanggal(lainnya["tanggal_lahir"]),
          jenis_kelamin: normalizeJk(lainnya["jenis_kelamin"]),
          agama: lainnya["agama"] ?? null,
          pekerjaan: lainnya["pekerjaan"] ?? null,
          pendidikan_terakhir: lainnya["pendidikan_terakhir"] ?? lainnya["pendidikan"] ?? null,
          status_perkawinan: lainnya["status_perkawinan"] ?? null,
          status_dalam_kk: lainnya["status_dalam_kk"] ?? lainnya["status_hubungan"] ?? null,
        };

        const existingPenduduk = await prisma.penduduk.findUnique({ where: { nik } });
        if (existingPenduduk) {
          await prisma.penduduk.update({
            where: { nik },
            data: { ...payloadPenduduk, updated_at: new Date() },
          });
          update++;
        } else {
          await prisma.penduduk.create({ data: { nik, ...payloadPenduduk } });
          baru++;
        }

        dataRows.push({
          nik,
          nama_lengkap: nama,
          ...lainnya,
          _status: existingPenduduk ? "update" : "baru",
        });
      } catch (e) {
        gagal++;
        errors.push(`Baris ${barisKe}: ${e instanceof Error ? e.message : "gagal diproses"}`);
      }

      // Batasi ukuran import agar request tidak timeout.
      if (r >= 2000) {
        errors.push("Import dihentikan di 2.000 baris pertama.");
        break;
      }
    }

    // ── Arsipkan ringkasan import ─────────────────────────────────────
    await prisma.importPenduduk.create({
      data: {
        nama_file: file.name,
        format_file: format,
        ukuran_bytes: file.size,
        total_baris: rows.length,
        baris_baru: baru,
        baris_update: update,
        baris_gagal: gagal,
        kolom: JSON.stringify(kolomAsli),
        data_rows: JSON.stringify(dataRows.slice(0, 500)),
        errors: errors.length ? JSON.stringify(errors) : null,
        diupload_oleh: session.user.nama_lengkap ?? session.user.email ?? session.user.id,
      },
    });

    return NextResponse.json({
      message: `Import selesai: ${baru} baru, ${update} diperbarui, ${gagal} gagal.`,
      nama_file: file.name,
      format: format,
      total_baris: rows.length,
      baris_baru: baru,
      baris_update: update,
      baris_gagal: gagal,
      kolom: kolomAsli,
      errors: errors.slice(0, 50),
    });
  } catch (err) {
    console.error("POST /api/admin/penduduk/import:", err);
    return NextResponse.json(
      { error: "Terjadi kesalahan server saat memproses file." },
      { status: 500 }
    );
  }
}

// GET /api/admin/penduduk/import — riwayat import.
export async function GET() {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
  }

  try {
    const riwayat = await prisma.importPenduduk.findMany({
      orderBy: { created_at: "desc" },
      take: 20,
    });
    return NextResponse.json({
      data: riwayat.map((r) => ({
        ...r,
        kolom: r.kolom ? JSON.parse(r.kolom) : [],
        errors: r.errors ? JSON.parse(r.errors) : [],
      })),
    });
  } catch {
    return NextResponse.json({ data: [] });
  }
}

function parseTanggal(v?: string | null): Date | null {
  const s = (v ?? "").trim();
  if (!s) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(`${s}T00:00:00`);
  if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
    const [dd, mm, yyyy] = s.split("/");
    return new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  }
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function normalizeJk(v?: string | null): "laki_laki" | "perempuan" | null {
  const s = (v ?? "").trim().toLowerCase();
  if (!s) return null;
  if (/^(l|lk|laki|laki-laki|laki_laki|m|male)/.test(s)) return "laki_laki";
  if (/^(p|pr|perempuan|f|female)/.test(s)) return "perempuan";
  return null;
}
