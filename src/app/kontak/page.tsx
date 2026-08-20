import Link from "next/link";
import { Building2, Clock, Mail, MapPin, Phone, User } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthButtons from "@/components/auth-buttons";

export const metadata = {
  title: "Kontak Kami",
};

const DESKTOP_NAV = [
  { label: "Beranda", href: "/", active: false },
  { label: "Layanan", href: "/layanan/surat", active: false },
  { label: "Peta", href: "/peta", active: false },
  { label: "Profil", href: "/profil", active: false },
] as const;

const CONTACTS = [
  {
    icon: MapPin,
    title: "Alamat",
    lines: [
      "Kantor Kelurahan Tiro Sompe",
      "Jl. Poros Parepare, Kel. Tiro Sompe",
      "Kec. Bacukiki Barat, Kota Parepare",
      "Sulawesi Selatan",
    ],
  },
  {
    icon: Phone,
    title: "Telepon",
    lines: ["(0421) 2XXXXX", "WhatsApp: 0812-3456-7890"],
  },
  {
    icon: Mail,
    title: "Email",
    lines: ["kel.tirosompe@pareparekota.go.id"],
  },
  {
    icon: Clock,
    title: "Jam Layanan",
    lines: [
      "Senin – Kamis: 08.00 – 15.00 WITA",
      "Jumat: 08.00 – 11.00 WITA",
      "Sabtu – Minggu: Tutup",
    ],
  },
];

export default function KontakPage() {
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
          <span className="inline-block px-3 py-1 bg-primary-container/30 text-primary font-label-sm text-label-sm rounded-full mb-3">
            HUBUNGI KAMI
          </span>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">
            Kontak Kami
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Hubungi Kantor Kelurahan Tiro Sompe untuk bantuan layanan administrasi atau informasi lainnya.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {CONTACTS.map((c) => (
            <div
              key={c.title}
              className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-primary-container/40 text-primary flex items-center justify-center">
                  <c.icon aria-hidden="true" className="w-5 h-5" />
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  {c.title}
                </h2>
              </div>
              {c.lines.map((l) => (
                <p key={l} className="font-body-sm text-body-sm text-on-surface-variant">
                  {l}
                </p>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-10 bg-surface-container-lowest border border-border-subtle rounded-xl p-6 flex items-center gap-4">
          <Building2 aria-hidden="true" className="w-6 h-6 text-primary shrink-0" />
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Kantor Kelurahan Tiro Sompe juga dapat dikunjungi langsung pada jam layanan. Bawa dokumen
            pendukung sesuai kebutuhan pengajuan Anda.
          </p>
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