import Link from "next/link";
import { FileText, Home, LayoutDashboard, Map, MapPin, Megaphone, Settings, User, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthButtons from "@/components/auth-buttons";
import BackButton from "@/components/back-button";

export const metadata = {
  title: "Peta Situs",
};

const DESKTOP_NAV = [
  { label: "Beranda", href: "/", active: false },
  { label: "Layanan", href: "/layanan/surat", active: false },
  { label: "Peta", href: "/peta", active: false },
  { label: "Profil", href: "/profil", active: false },
] as const;

const GROUPS = [
  {
    title: "Umum",
    items: [
      { label: "Beranda", href: "/", icon: Home },
      { label: "Layanan Surat", href: "/layanan/surat", icon: FileText },
      { label: "Peta Wilayah", href: "/peta", icon: Map },
      { label: "Pengumuman", href: "/pengumuman", icon: Megaphone },
      { label: "Kontak Kami", href: "/kontak", icon: MapPin },
      { label: "Kebijakan Privasi", href: "/kebijakan-privasi", icon: FileText },
    ],
  },
  {
    title: "Akun & Kependudukan",
    items: [
      { label: "Masuk", href: "/login", icon: Home },
      { label: "Daftar", href: "/register", icon: Users },
      { label: "Data Penduduk", href: "/data-penduduk", icon: Users },
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Pengaturan", href: "/pengaturan", icon: Settings },
    ],
  },
] as const;

export default function PetaSitusPage() {
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

      <main className="flex-grow pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full">
        <div className="mb-10">
          <BackButton fallbackHref="/" className="mb-3 -ml-1" />
          <span className="inline-block px-3 py-1 bg-primary-container/30 text-primary font-label-sm text-label-sm rounded-full mb-3">
            NAVIGASI
          </span>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">Peta Situs</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Daftar halaman yang tersedia di SiTSOMP.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {GROUPS.map((g) => (
            <section key={g.title}>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-4">
                {g.title}
              </h2>
              <ul className="space-y-2">
                {g.items.map((item) => (
                  <li key={item.href + item.label}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-3 bg-surface-container-lowest border border-border-subtle rounded-lg hover:border-primary hover:text-primary transition-colors"
                    >
                      <item.icon aria-hidden="true" className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-body-md text-body-md text-on-surface">{item.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
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