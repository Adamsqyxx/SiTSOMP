import Link from "next/link";
import { FileText, Home, LayoutDashboard, Map, MapPin, Megaphone, Settings, Users } from "lucide-react";
import AppHeader from "@/components/app-header";
import BackButton from "@/components/back-button";

export const metadata = {
  title: "Peta Situs",
};

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
      <AppHeader />

      <main className="flex-grow pt-20 lg:pt-8 lg:pl-16 pb-16 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full">
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