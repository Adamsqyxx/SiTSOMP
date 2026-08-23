import { prisma } from "@/lib/prisma";
import type { JenisInformasi } from "@/generated/prisma/client";

// Sumber data halaman /pengumuman. Fallback POSTS lama dipakai bila
// DB gagal / belum ada konten yang diterbitkan admin.

export interface InfoPublik {
  jenis: JenisInformasi;
  judul: string;
  konten: string;
  thumbnail_url: string | null;
  published_at: Date | null;
}

export const JENIS_INFO_LABEL: Record<JenisInformasi, string> = {
  berita: "BERITA",
  pengumuman: "PENGUMUMAN",
  kegiatan: "KEGIATAN",
  anggaran: "INFO ANGGARAN",
};

const POSTS_LAMA = [
  {
    jenis: "pengumuman" as const,
    tagClass: "text-primary",
    date: "Hari ini",
    title: "Jadwal Pemadaman Listrik",
    desc: "Akan dilakukan pemeliharaan jaringan pada area RW 03 dan RW 04 mulai pukul 09.00 - 14.00 WITA.",
  },
  {
    jenis: "kegiatan" as const,
    tagClass: "text-info",
    date: "Kemarin",
    title: "Posyandu Balita Oktober",
    desc: "Kegiatan Posyandu Mawar akan dilaksanakan di Balai Pertemuan pada tanggal 15 Oktober 2024.",
  },
  {
    jenis: "pengumuman" as const,
    tagClass: "text-warning",
    date: "10 Okt",
    title: "Waspada Genangan Air",
    desc: "Curah hujan tinggi diprediksi beberapa hari ke depan. Warga diharap membersihkan saluran air.",
  },
  {
    jenis: "kegiatan" as const,
    tagClass: "text-secondary",
    date: "05 Okt",
    title: "Kerja Bakti Lingkungan",
    desc: "Kerja bakti membersihkan saluran drainase di seluruh RW akan dilaksanakan Sabtu pagi.",
  },
];

export async function getInformasiPublik(limit = 30): Promise<{
  try {
    const rows = await prisma.informasiPublik.findMany({
      where: { is_published: true },
      orderBy: [{ published_at: "desc" }, { created_at: "desc" }],
      take: limit,
    });
    if (rows.length > 0) {
      return {
        items: rows.map((r) => ({
          jenis: r.jenis,
          tagClass:
            r.jenis === "berita"
              ? "text-primary"
              : r.jenis === "kegiatan"
                ? "text-secondary"
                : r.jenis === "anggaran"
                  ? "text-warning"
                  : "text-info",
          date: r.published_at
            ? new Intl.DateTimeFormat("id-ID", {
                day: "2-digit",
                month: "short",
              }).format(r.published_at)
            : "-",
          title: r.judul,
          desc: r.konten,
        })),
      };
    }
  } catch (e) {
    console.error("getInformasiPublik:", e);
  }
  // Fallback: contoh konten awal sebelum admin menerbitkan apa pun.
  return { items: POSTS_LAMA.map((p) => ({ ...p })) };
}
