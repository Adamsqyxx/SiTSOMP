import { Building2, Clock, Mail, MapPin, Phone } from "lucide-react";
import AppHeader from "@/components/app-header";
import BackButton from "@/components/back-button";
import { getSiteContent } from "@/lib/site-content";

export const metadata = {
  title: "Kontak Kami",
};

export default async function KontakPage() {
  const kontak = await getSiteContent("kontak");

  const CONTACTS = [
    { icon: MapPin, title: "Alamat", lines: kontak.alamat },
    { icon: Phone, title: "Telepon", lines: kontak.telepon },
    { icon: Mail, title: "Email", lines: kontak.email },
    { icon: Clock, title: "Jam Layanan", lines: kontak.jam_layanan },
  ];

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-grow pt-20 lg:pt-8 lg:pl-16 pb-16 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full">
        <div className="mb-10">
          <BackButton fallbackHref="/" className="mb-3 -ml-1" />
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
            © 2026 KKN ITH 03 Tiro Sompe. Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}