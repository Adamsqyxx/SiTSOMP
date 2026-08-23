// Validasi form pengajuan surat terhadap data resmi (akun + tabel penduduk).
// Dipakai bersama oleh form (client, untuk popup) dan API /api/layanan
// (server, guard kedua) supaya aturan tidak duplikat.
import { prisma } from "@/lib/prisma";

export interface HasilValidasi {
  ok: boolean;
  errors: string[]; // pesan siap tampilkan ke user
}

function normNama(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
}

/**
 * Cek identitas pemohon pada form:
 * - nama_lengkap harus SAMA dengan nama akun (users.nama_lengkap)
 *   atau dengan nama di tabel penduduk (via NIK akun / NIK yang diketik).
 * - nik (bila ada di form) wajib 16 digit dan cocok dengan NIK akun
 *   atau terdaftar di tabel penduduk dengan nama yang sama.
 */
export async function validasiIdentitasPemohon(input: {
  userDb: { id: string; nik: string | null; nama_lengkap: string };
  formData: { nama_lengkap?: unknown; nik?: unknown };
}): Promise<HasilValidasi> {
  const errors: string[] = [];
  const namaForm =
    typeof input.formData.nama_lengkap === "string"
      ? normNama(input.formData.nama_lengkap)
      : "";
  const nikForm =
    typeof input.formData.nik === "string" ? input.formData.nik.trim() : "";

  // 1. Nama tidak boleh kosong/terlalu pendek.
  if (!namaForm || namaForm.length < 3) {
    errors.push("Nama lengkap wajib diisi sesuai KTP.");
    return { ok: false, errors };
  }

  const kandidatNama = new Set<string>([normNama(input.userDb.nama_lengkap)]);

  // 2. Kalau akun punya NIK, tarik nama resmi dari tabel penduduk.
  let pendudukAkun = null;
  if (input.userDb.nik) {
    try {
      pendudukAkun = await prisma.penduduk.findUnique({
        where: { nik: input.userDb.nik },
        select: { nik: true, nama_lengkap: true },
      });
      if (pendudukAkun) kandidatNama.add(normNama(pendudukAkun.nama_lengkap));
    } catch {
      // DB error — fallback ke nama akun saja.
    }
  }

  // 3. NIK di form (bila diisi) divalidasi bentuk + kecocokan.
  if (nikForm) {
    if (!/^\d{16}$/.test(nikForm)) {
      errors.push("NIK harus tepat 16 digit angka.");
    } else if (input.userDb.nik && nikForm !== input.userDb.nik) {
      errors.push(
        `NIK yang Anda isi tidak cocok dengan NIK akun Anda (${input.userDb.nik.slice(0, 4)}****).`
      );
    }
    // NIK almarhum dsb. (field lain) dibiarkan — hanya NIK pemohon dicek ketat.
  }

  // 4. Nama harus persis salah satu nama resmi (akun / penduduk).
  if (kandidatNama.size > 0 && !kandidatNama.has(namaForm)) {
    const contoh = input.userDb.nama_lengkap;
    errors.push(
      `Nama tidak sesuai data resmi. Gunakan nama lengkap sesuai KTP: "${contoh}".`
    );
  }

  return { ok: errors.length === 0, errors };
}
