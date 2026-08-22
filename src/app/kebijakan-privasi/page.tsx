import Link from "next/link";
import { ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthButtons from "@/components/auth-buttons";
import BackButton from "@/components/back-button";

export const metadata = {
  title: "Kebijakan Privasi",
};

const DESKTOP_NAV = [
  { label: "Beranda", href: "/", active: false },
  { label: "Layanan", href: "/layanan/surat", active: false },
  { label: "Peta", href: "/peta", active: false },
  { label: "Profil", href: "/profil", active: false },
] as const;

export default function KebijakanPrivasiPage() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <header className="bg-surface fixed top-0 w-full z-50 border-b border-outline-variant transition-colors duration-200">
        <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop z-50 max-w-max-width mx-auto">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">
              SiTSOMP
            </Link>
          </div>
          <nav className="hidden md:flex gap-6 items-center">
            {DESKTOP_NAV.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "font-label-md text-label-md transition-colors",
                  item.active
                    ? "text-primary font-semibold border-b-2 border-primary pb-1"
                    : "text-on-surface-variant hover:text-primary"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2 md:gap-3">
            <AuthButtons className="hidden md:flex" />
            <Link
              href="/login"
              aria-label="Profil"
              className="text-on-surface-variant hover:bg-surface-container-low rounded-full p-2"
              title="Masuk"
            >
              <User aria-hidden="true" className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <BackButton fallbackHref="/" className="-ml-1" />
        </div>
          <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center">
            <ShieldCheck aria-hidden="true" className="w-6 h-6" />
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            Kebijakan Privasi
          </h1>
        </div>

        <div className="space-y-6 text-on-surface-variant font-body-md text-body-md leading-relaxed">
          <section>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">1. Data yang Dikumpulkan</h2>
            <p>
              Sistem Informasi Kelurahan Tiro Sompe (SiTSOMP) mengumpulkan data pribadi yang Anda
              berikan saat mendaftar dan mengajukan layanan, antara lain NIK, nama lengkap, nomor
              telepon, dan data pendukung lainnya yang diperlukan untuk pemrosesan surat.
            </p>
          </section>
          <section>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">2. Penggunaan Data</h2>
            <p>
              Data digunakan untuk memverifikasi identitas, memproses permohonan surat, memberikan
              notifikasi, dan meningkatkan layanan administrasi kelurahan. Data tidak akan
              diperjualbelikan atau digunakan di luar kepentingan pelayanan publik.
            </p>
          </section>
          <section>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">3. Keamanan</h2>
            <p>
              Kami menerapkan langkah keamanan teknis dan organisasi yang wajar, termasuk enkripsi
              saat transmisi data, untuk melindungi informasi Anda dari akses yang tidak sah.
            </p>
          </section>
          <section>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">4. Hak Anda</h2>
            <p>
              Anda berhak mengakses, memperbaiki, atau menghapus data pribadi Anda dengan menghubungi
              kantor kelurahan melalui halaman <Link href="/kontak" className="text-primary hover:underline">Kontak Kami</Link>.
            </p>
          </section>
          <section>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">5. Perubahan Kebijakan</h2>
            <p>
              Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan akan diumumkan melalui halaman
              pengumuman resmi kelurahan.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-surface-container-lowest w-full mt-auto border-t border-outline-variant">
        <div className="py-8 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © 2024 Pemerintah Kelurahan Tiro Sompe. Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}