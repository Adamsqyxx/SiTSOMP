import Link from "next/link";
import {
  FileText,
  Home,
  LifeBuoy,
  MapPinned,
  Megaphone,
  SearchX,
} from "lucide-react";
import AppHeader from "@/components/app-header";
import BackButton from "@/components/back-button";

export const metadata = {
  title: "404 - Halaman Tidak Ditemukan",
};
const QUICK_LINKS = [
  {
    label: "Beranda",
    desc: "Kembali ke halaman utama",
    href: "/",
    icon: Home,
  },
  {
    label: "Layanan Surat",
    desc: "Ajukan surat secara online",
    href: "/layanan/surat",
    icon: FileText,
  },
  {
    label: "Peta Wilayah",
    desc: "Jelajahi peta kelurahan",
    href: "/peta",
    icon: MapPinned,
  },
  {
    label: "Pengumuman",
    desc: "Info terbaru dari kelurahan",
    href: "/pengumuman",
    icon: Megaphone,
  },
];

export default function NotFound() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <AppHeader />

      {/* Konten utama */}
      <main className="flex-grow pt-20 lg:pt-8 lg:pl-16 pb-16 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full flex items-center justify-center">
        <div className="w-full max-w-xl text-center py-10">
          <BackButton fallbackHref="/" className="mb-8 inline-flex" />

          <div className="inline-flex p-3 rounded-full bg-primary-container/30 mb-6">
            <SearchX aria-hidden="true" className="w-8 h-8 text-primary" />
          </div>
          <p className="font-code-md text-code-md font-mono text-primary tracking-widest mb-2">
            Error 404 — Not Found
          </p>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-3">
            Halaman Tidak Ditemukan
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-8 mx-auto max-w-md">
            Maaf, halaman yang Anda tuju tidak tersedia atau telah dipindahkan.
            Gunakan tautan cepat di bawah untuk melanjutkan.
          </p>

          {/* Tautan cepat */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8 text-left">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="group bg-surface-container-lowest border border-border-subtle rounded-xl p-4 flex items-start gap-3 hover:bg-surface-container-low hover:border-outline-variant transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-primary-container/40 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary-container/60 transition-colors">
                  <link.icon aria-hidden="true" className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-label-md text-label-md text-on-surface font-semibold">
                    {link.label}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {link.desc}
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {/* Bantuan lanjutan */}
          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl px-5 py-4 flex flex-col sm:flex-row items-center gap-2 sm:gap-3 justify-center">
            <LifeBuoy
              aria-hidden="true"
              className="w-5 h-5 text-primary shrink-0"
            />
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Masih belum menemukan halaman?{" "}
              <Link
                href="/kontak"
                className="text-primary hover:underline underline-offset-4 font-semibold"
              >
                Hubungi kami
              </Link>
              .
            </p>
          </div>
        </div>
      </main>

      {/* Footer standar */}
      <footer className="bg-surface-container-lowest w-full mt-auto border-t border-outline-variant">
        <div className="py-8 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © 2026 KKN ITH 03 Tiro Sompe. Seluruh Hak Cipta
            Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
