import { type LucideIcon } from "lucide-react";

// Konfigurasi layanan surat — dipakai bersama oleh halaman daftar
// (layanan/surat/page.tsx) dan form pengajuan (layanan/surat/[slug]/page.tsx)
// agar persyaratan + field form tidak duplikat.
//
// SEJAK 2026-08-25: seluruh layanan bawaan (SKTM, SKU, Domisili, Kematian)
// dihapus. Halaman /layanan/surat hanya menampilkan Kartu Layanan yang
// dikelola admin dari dashboard (tabel layanan_cards). Struktur tipe +
// getServiceBySlug dipertahankan agar form [slug] tetap kompatibel bila
// layanan bawaan ditambahkan lagi di masa depan.

export interface SuratRequirement {
  // Semua persyaratan diinput sebagai lampiran file (foto/scan) oleh warga.
  label: string;
}

export interface SuratField {
  id: string;
  label: string;
  required: boolean;
  placeholder?: string;
  /** Render field sebagai pemilih wilayah berantai (Kota→Kec→Kel→RW→RT) Tiro Sompe. */
  wilayah?: boolean;
}

export interface SuratService {
  id: string; // kode DB, mis. "SKTM"
  slug: string; // segmen route, mis. "sktm"
  name: string;
  category: string;
  desc: string;
  icon: LucideIcon;
  requirements: SuratRequirement[];
  fields: SuratField[];
}

// Tidak ada lagi layanan surat bawaan — semua kartu dikelola admin.
export const SERVICES: SuratService[] = [];

// Kategori filter halaman daftar. "Lainnya" memuat kartu buatan admin.
export const CATEGORIES = [
  "Semua",
  "Kependudukan",
  "Usaha",
  "Sosial",
  "Lainnya",
] as const;
export type SuratCategory = (typeof CATEGORIES)[number];

export function getServiceBySlug(slug: string): SuratService | undefined {
  const s = slug.trim().toLowerCase();
  return SERVICES.find((svc) => svc.slug === s);
}
