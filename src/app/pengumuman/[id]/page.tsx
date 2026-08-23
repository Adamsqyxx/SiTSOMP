import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Clock, MapPin } from "lucide-react";
import AppHeader from "@/components/app-header";
import BackButton from "@/components/back-button";
import {
  getInformasiPublikById,
  JENIS_INFO_LABEL,
} from "@/lib/informasi-publik";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const fmtTanggal = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

const fmtWaktu = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
});

function formatRentangWaktu(mulai: Date | null, selesai: Date | null) {
  if (!mulai) return null;
  const tgl = fmtTanggal.format(mulai);
  if (selesai) {
    const samaHari = mulai.toDateString() === selesai.toDateString();
    if (samaHari) {
      return `${tgl}, ${fmtWaktu.format(mulai)} – ${fmtWaktu.format(selesai)} WITA`;
    }
    return `${fmtTanggal.format(mulai)} – ${fmtTanggal.format(selesai)}`;
  }
  return `${tgl}, ${fmtWaktu.format(mulai)} WITA`;
}

// Detail informasi/pengumuman publik. Hanya konten is_published yang tampil;
// selain itu → 404.
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const info = await getInformasiPublikById(id);
  if (!info) return { title: "Tidak ditemukan — SiTSOMP" };
  return {
    title: `${info.judul} — SiTSOMP`,
    description: info.konten.slice(0, 160),
  };
}

export default async function DetailPengumumanPage({ params }: Props) {
  const { id } = await params;
  const info = await getInformasiPublikById(id);
  if (!info) notFound();

  const rentangKegiatan = formatRentangWaktu(info.kegiatan_mulai, info.kegiatan_selesai);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-grow pt-20 lg:pt-8 lg:pl-16 pb-16 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full">
        <div className="max-w-3xl mx-auto">
          <BackButton fallbackHref="/pengumuman" className="mb-3 -ml-1" />

          <article className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 md:p-10">
            <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
              <span
                className={`font-label-sm text-label-sm font-bold ${info.tagClass}`}
              >
                {JENIS_INFO_LABEL[info.jenis as keyof typeof JENIS_INFO_LABEL] ?? "INFO"}
              </span>
              {info.published_at && (
                <time
                  dateTime={info.published_at.toISOString()}
                  className="font-label-sm text-label-sm text-outline"
                >
                  {fmtTanggal.format(info.published_at)}
                </time>
              )}
            </div>

            <h1 className="font-headline-md text-headline-md text-on-surface font-semibold mb-6 break-words">
              {info.judul}
            </h1>

            {/* Info khusus kegiatan */}
            {(rentangKegiatan || info.lokasi_kegiatan) && (
              <div className="flex flex-col gap-2 bg-surface-muted rounded-lg p-4 mb-6 border border-border-subtle">
                {rentangKegiatan && (
                  <p className="font-body-sm text-body-sm text-on-surface flex items-start gap-2">
                    <Clock aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    {rentangKegiatan}
                  </p>
                )}
                {info.lokasi_kegiatan && (
                  <p className="font-body-sm text-body-sm text-on-surface flex items-start gap-2">
                    <MapPin aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0 text-primary" />
                    {info.lokasi_kegiatan}
                  </p>
                )}
              </div>
            )}

            {/* Konten: baris kosong jadi paragraf terpisah */}
            <div className="space-y-4">
              {info.konten.split(/\n{2,}/).map((paragraf, i) => (
                <p key={i} className="font-body-md text-body-md text-on-surface-variant leading-relaxed whitespace-pre-line">
                  {paragraf}
                </p>
              ))}
            </div>

            {info.thumbnail_url && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={info.thumbnail_url}
                alt={`Gambar: ${info.judul}`}
                className="mt-6 w-full rounded-lg border border-border-subtle"
              />
            )}
          </article>

          <div className="text-center mt-8">
            <Link
              href="/pengumuman"
              className="inline-block px-5 py-2.5 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-fixed-variant transition-colors"
            >
              Kembali ke Daftar Pengumuman
            </Link>
          </div>
        </div>
      </main>

      <footer className="bg-surface-container-lowest relative w-full mt-auto border-t border-outline-variant">
        <div className="w-full py-8 px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-4 max-w-max-width mx-auto">
          <div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              © 2026 KKN ITH 03 Tiro Sompe. Seluruh Hak Cipta Dilindungi.
            </p>
          </div>
          <div className="flex flex-wrap gap-4 md:justify-end">
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary underline transition-opacity duration-150" href="/kontak">
              Kontak Kami
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary underline transition-opacity duration-150" href="/kebijakan-privasi">
              Kebijakan Privasi
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary underline transition-opacity duration-150" href="https://kemendagri.go.id" target="_blank" rel="noopener noreferrer">
              Portal Nasional
            </Link>
            <Link className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary underline transition-opacity duration-150" href="/peta-situs">
              Peta Situs
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
