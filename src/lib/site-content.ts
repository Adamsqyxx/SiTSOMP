import { prisma } from "@/lib/prisma";

// Bentuk konten tiap halaman statis. Key-value di tabel site_content;
// nilai default = isi awal sebelum admin pernah mengedit.

export interface KontakKonten {
  alamat: string[]; // baris-baris alamat kantor
  telepon: string[];
  email: string[];
  jam_layanan: string[];
}

export interface KebijakanPrivasiKonten {
  bagian: { judul: string; isi: string }[]; // bernomor otomatis saat render
}

export interface PetaSitusGrup {
  title: string;
  items: { label: string; href: string }[];
}

export interface PetaSitusKonten {
  grup: PetaSitusGrup[];
}

const KONTAK_DEFAULT: KontakKonten = {
  alamat: [
    "Kantor Kelurahan Tiro Sompe",
    "Jl. Poros Parepare, Kel. Tiro Sompe",
    "Kec. Bacukiki Barat, Kota Parepare",
    "Sulawesi Selatan",
  ],
  telepon: ["(0421) 2XXXXX", "WhatsApp: 0812-3456-7890"],
  email: ["kel.tirosompe@pareparekota.go.id"],
  jam_layanan: [
    "Senin – Kamis: 08.00 – 15.00 WITA",
    "Jumat: 08.00 – 11.00 WITA",
    "Sabtu – Minggu: Tutup",
  ],
};

const KEBIJAKAN_DEFAULT: KebijakanPrivasiKonten = {
  bagian: [
    {
      judul: "Data yang Dikumpulkan",
      isi: "Sistem Informasi Kelurahan Tiro Sompe (SiTSOMP) mengumpulkan data pribadi yang Anda berikan saat mendaftar dan mengajukan layanan, antara lain NIK, nama lengkap, nomor telepon, dan data pendukung lainnya yang diperlukan untuk pemrosesan surat.",
    },
    {
      judul: "Penggunaan Data",
      isi: "Data digunakan untuk memverifikasi identitas, memproses permohonan surat, memberikan notifikasi, dan meningkatkan layanan administrasi kelurahan. Data tidak akan diperjualbelikan atau digunakan di luar kepentingan pelayanan publik.",
    },
    {
      judul: "Keamanan",
      isi: "Kami menerapkan langkah keamanan teknis dan organisasi yang wajar, termasuk enkripsi saat transmisi data, untuk melindungi informasi Anda dari akses yang tidak sah.",
    },
    {
      judul: "Hak Anda",
      isi: "Anda berhak mengakses, memperbaiki, atau menghapus data pribadi Anda dengan menghubungi kantor kelurahan melalui halaman Kontak Kami.",
    },
    {
      judul: "Perubahan Kebijakan",
      isi: "Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan akan diumumkan melalui halaman pengumuman resmi kelurahan.",
    },
  ],
};

const PETA_SITUS_DEFAULT: PetaSitusKonten = {
  grup: [
    {
      title: "Umum",
      items: [
        { label: "Beranda", href: "/" },
        { label: "Layanan Surat", href: "/layanan/surat" },
        { label: "Peta Wilayah", href: "/peta" },
        { label: "Pengumuman", href: "/pengumuman" },
        { label: "Kontak Kami", href: "/kontak" },
        { label: "Kebijakan Privasi", href: "/kebijakan-privasi" },
      ],
    },
    {
      title: "Akun & Kependudukan",
      items: [
        { label: "Masuk", href: "/login" },
        { label: "Daftar", href: "/register" },
        { label: "Data Penduduk", href: "/data-penduduk" },
        { label: "Dashboard", href: "/dashboard" },
        { label: "Pengaturan", href: "/pengaturan" },
      ],
    },
  ],
};

export const SITE_CONTENT_DEFAULTS = {
  kontak: KONTAK_DEFAULT,
  kebijakan_privasi: KEBIJAKAN_DEFAULT,
  peta_situs: PETA_SITUS_DEFAULT,
} as const;

export type SiteContentKey = keyof typeof SITE_CONTENT_DEFAULTS;

function parse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** Baca satu key konten; fallback ke default bila belum pernah diedit. */
export async function getSiteContent<K extends SiteContentKey>(
  key: K
): Promise<(typeof SITE_CONTENT_DEFAULTS)[K]> {
  try {
    const row = await prisma.siteContent.findUnique({ where: { key } });
    return parse(
      row?.data,
      SITE_CONTENT_DEFAULTS[key] as (typeof SITE_CONTENT_DEFAULTS)[K]
    );
  } catch {
    // DB gagal → tampilkan default supaya halaman publik tetap hidup.
    return SITE_CONTENT_DEFAULTS[key] as (typeof SITE_CONTENT_DEFAULTS)[K];
  }
}
