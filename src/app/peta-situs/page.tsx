import Link from "next/link";
import { FileText, Home, LayoutDashboard, Map, MapPin, Megaphone, Settings, Users } from "lucide-react";
import AppHeader from "@/components/app-header";
import BackButton from "@/components/back-button";
import { getSiteContent } from "@/lib/site-content";

export const metadata = {
  title: "Peta Situs",
};

// Ikon dipetakan dari path tujuan (konten dikelola admin dari dashboard).
const ICON_BY_HREF: Record<string, React.ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" }>> = {
  "/": Home,
  "/layanan/surat": FileText,
  "/peta": Map,
  "/pengumuman": Megaphone,
  "/kontak": MapPin,
  "/kebijakan-privasi": ShieldIcon,
  "/login": Home,
  "/register": Users,
  "/data-penduduk": Users,
  "/dashboard": LayoutDashboard,
  "/pengaturan": Settings,
};

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    </svg>
  );
}

export default async function PetaSitusPage() {
  const petaSitus = await getSiteContent("peta_situs");

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
          {petaSitus.grup.map((g) => (
            <section key={g.title}>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-4">
                {g.title}
              </h2>
              <ul className="space-y-2">
                {g.items.map((item) => {
                  const Icon = ICON_BY_HREF[item.href] ?? FileText;
                  return (
                    <li key={item.href + item.label}>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 bg-surface-container-lowest border border-border-subtle rounded-lg hover:border-primary hover:text-primary transition-colors"
                      >
                        <Icon aria-hidden="true" className="w-4 h-4 text-primary shrink-0" />
                        <span className="font-body-md text-body-md text-on-surface">{item.label}</span>
                      </Link>
                    </li>
                  );
                })}
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
