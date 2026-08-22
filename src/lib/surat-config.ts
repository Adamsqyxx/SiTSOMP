import {
  HandHeart,
  Store,
  MapPin,
  FileWarning,
  type LucideIcon,
} from "lucide-react";

// Konfigurasi layanan surat — dipakai bersama oleh halaman daftar
// (layanan/surat/page.tsx) dan form pengajuan (layanan/surat/[slug]/page.tsx)
// agar persyaratan + field form tidak duplikat.

export interface SuratRequirement {
  // Semua persyaratan diinput sebagai lampiran file (foto/scan) oleh warga.
  label: string;
}

export interface SuratField {
  id: string;
  label: string;
  required: boolean;
  placeholder?: string;
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

export const SERVICES: SuratService[] = [
  {
    id: "SKTM",
    slug: "sktm",
    name: "Surat Keterangan Tidak Mampu (SKTM)",
    category: "Sosial",
    desc: "Diperlukan untuk keperluan keringanan biaya pendidikan, kesehatan, atau bantuan sosial lainnya.",
    icon: HandHeart,
    requirements: [
      { label: "Pengantar RT/RW" },
      { label: "Fotokopi KK & KTP" },
      { label: "Foto kondisi rumah" },
    ],
    fields: [
      { id: "nama_lengkap", label: "Nama Lengkap (sesuai KTP)", required: true, placeholder: "Nama sesuai KTP" },
      { id: "nik", label: "NIK", required: true, placeholder: "16 digit NIK" },
      { id: "alamat", label: "Alamat Domisili", required: true, placeholder: "Alamat lengkap" },
      { id: "keperluan", label: "Keperluan Surat", required: true, placeholder: "Misal: keringanan biaya sekolah" },
      { id: "keterangan", label: "Keterangan Tambahan", required: false, placeholder: "Opsional" },
    ],
  },
  {
    id: "SKU",
    slug: "sku",
    name: "Surat Keterangan Usaha (SKU)",
    category: "Usaha",
    desc: "Digunakan sebagai bukti kepemilikan usaha untuk keperluan pinjaman bank atau perizinan lanjutan.",
    icon: Store,
    requirements: [
      { label: "Pengantar RT/RW" },
      { label: "Fotokopi KTP" },
      { label: "Foto tempat usaha" },
    ],
    fields: [
      { id: "nama_lengkap", label: "Nama Lengkap (sesuai KTP)", required: true, placeholder: "Nama sesuai KTP" },
      { id: "nik", label: "NIK", required: true, placeholder: "16 digit NIK" },
      { id: "nama_usaha", label: "Nama Usaha", required: true, placeholder: "Nama usaha Anda" },
      { id: "alamat_usaha", label: "Alamat Usaha", required: true, placeholder: "Alamat lokasi usaha" },
      { id: "keterangan", label: "Keterangan Tambahan", required: false, placeholder: "Opsional" },
    ],
  },
  {
    id: "DOM",
    slug: "dom",
    name: "Surat Keterangan Domisili",
    category: "Kependudukan",
    desc: "Keterangan tempat tinggal sementara bagi warga yang belum memiliki KTP setempat.",
    icon: MapPin,
    requirements: [
      { label: "Pengantar RT/RW" },
      { label: "Fotokopi KTP asal" },
      { label: "Fotokopi KK asal" },
    ],
    fields: [
      { id: "nama_lengkap", label: "Nama Lengkap (sesuai KTP)", required: true, placeholder: "Nama sesuai KTP" },
      { id: "nik", label: "NIK", required: true, placeholder: "16 digit NIK" },
      { id: "alamat_asal", label: "Alamat Asal", required: true, placeholder: "Alamat KTP asal" },
      { id: "alamat_domisili", label: "Alamat Domisili Sekarang", required: true, placeholder: "Alamat tinggal saat ini" },
      { id: "keterangan", label: "Keterangan Tambahan", required: false, placeholder: "Opsional" },
    ],
  },
  {
    id: "SKM",
    slug: "skm",
    name: "Surat Keterangan Kematian",
    category: "Kependudukan",
    desc: "Dokumen pendukung untuk mengurus akta kematian di Dinas Kependudukan dan Catatan Sipil.",
    icon: FileWarning,
    requirements: [
      { label: "Surat keterangan RS/Dokter" },
      { label: "KTP Asli Almarhum" },
      { label: "KK Asli Almarhum" },
    ],
    fields: [
      { id: "nama_lengkap", label: "Nama Lengkap (sesuai KTP)", required: true, placeholder: "Nama sesuai KTP" },
      { id: "nik", label: "NIK", required: true, placeholder: "16 digit NIK" },
      { id: "nama_almarhum", label: "Nama Almarhum/Almarhumah", required: true, placeholder: "Nama yang meninggal" },
      { id: "nik_almarhum", label: "NIK Almarhum/Almarhumah", required: true, placeholder: "16 digit NIK" },
      { id: "keterangan", label: "Keterangan Tambahan", required: false, placeholder: "Opsional" },
    ],
  },
];

export const CATEGORIES = ["Semua", "Kependudukan", "Usaha", "Sosial"] as const;
export type SuratCategory = (typeof CATEGORIES)[number];

export function getServiceBySlug(slug: string): SuratService | undefined {
  const s = slug.trim().toLowerCase();
  return SERVICES.find((svc) => svc.slug === s);
}
