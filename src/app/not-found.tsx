import Link from "next/link";
import {
  FileText,
  Home,
  LifeBuoy,
  MapPinned,
  Megaphone,
  SearchX,
} from "lucide-react";
import BackButton from "@/components/back-button";

export const metadata = {
  title: "404 - Halaman Tidak Ditemukan",
};

const NAV_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Layanan", href: "/layanan/surat" },
  { label: "Peta", href: "/peta" },
  { label: "Profil", href: "/profil" },
];

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
      {/* Header publik standar SiTSOMP */}
      <header className="bg-surface fixed top-0 w-full z-50 border-b border-outline-variant">
        <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="font-headline-md text-headline-md font-bold text-primary"
            >
              SiTSOMP
            </Link>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Konten utama */}
      <main className="flex-grow pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full flex items-center justify-center">
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
            © 2024 Pemerintah Kelurahan Tiro Sompe. Seluruh Hak Cipta
            Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}
