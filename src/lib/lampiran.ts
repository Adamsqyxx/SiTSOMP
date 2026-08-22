import { createClient } from "@/lib/supabase-client";

// Nama bucket Supabase Storage untuk lampiran pengajuan surat.
// Bucket harus PUBLIC + RLS izinkan anon INSERT (lihat supabase/lampiran-storage.sql).
export const LAMPIRAN_BUCKET = "lampiran-surat";

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB per file
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

export interface LampiranUpload {
  label: string;
  url: string;
}

function sanitizeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-60);
}

/**
 * Upload satu file ke Supabase Storage (bucket public).
 * Path: <userId>/<slug>/<timestamp>-<random>-<namaFile>
 * Mengembalikan URL publik. Throw kalau gagal/validasi.
 */
export async function uploadLampiran(
  file: File,
  userId: string,
  slug: string
): Promise<string> {
  if (!ALLOWED.includes(file.type)) {
    throw new Error(
      `Tipe file tidak didukung: ${file.name}. Gunakan JPG, PNG, WEBP, atau PDF.`
    );
  }
  if (file.size > MAX_BYTES) {
    throw new Error(`Ukuran file "${file.name}" melebihi 5 MB.`);
  }

  const supabase = createClient();
  const ext = sanitizeName(file.name);
  const path = `${userId}/${slug}/${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${ext}`;

  const { error } = await supabase.storage
    .from(LAMPIRAN_BUCKET)
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (error) {
    throw new Error(`Gagal mengunggah "${file.name}": ${error.message}`);
  }

  const { data } = supabase.storage.from(LAMPIRAN_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
