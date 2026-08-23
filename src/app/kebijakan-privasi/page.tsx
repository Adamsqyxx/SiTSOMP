import { ShieldCheck } from "lucide-react";
import AppHeader from "@/components/app-header";
import BackButton from "@/components/back-button";
import { getSiteContent } from "@/lib/site-content";

export const metadata = {
  title: "Kebijakan Privasi",
};

export default async function KebijakanPrivasiPage() {
  const kebijakan = await getSiteContent("kebijakan_privasi");

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-grow pt-20 lg:pt-8 lg:pl-16 pb-16 px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto w-full">
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
          {kebijakan.bagian.map((b, i) => (
            <section key={b.judul}>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">
                {i + 1}. {b.judul}
              </h2>
              <p>{b.isi}</p>
            </section>
          ))}
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
