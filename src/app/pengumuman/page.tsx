import Link from "next/link";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/app-header";
import BackButton from "@/components/back-button";
import { getInformasiPublik, JENIS_INFO_LABEL } from "@/lib/informasi-publik";

export const dynamic = "force-dynamic";

export default async function PengumumanPage() {
  const { items } = await getInformasiPublik();

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-grow pt-20 lg:pt-8 lg:pl-16 pb-16 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full">
        <div className="mb-8">
          <BackButton fallbackHref="/" className="mb-3 -ml-1 md:hidden" />
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">
            Informasi &amp; Pengumuman
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Informasi resmi dari Pemerintah Kelurahan Tiro Sompe untuk warga.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((p) => (
            <article
              key={p.id ?? p.title}
            >
              <Link
                href={p.id ? `/pengumuman/${p.id}` : "/pengumuman"}
                aria-label={`Baca selengkapnya: ${p.title}`}
                className="block bg-surface-container-lowest border border-border-subtle rounded-xl p-6 hover:border-primary hover:shadow-md transition-all h-full"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className={cn("font-label-sm text-label-sm font-bold", p.tagClass)}>
                    {JENIS_INFO_LABEL[p.jenis as keyof typeof JENIS_INFO_LABEL] ?? "INFO"}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">{p.date}</span>
                </div>
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2 group-hover:text-primary transition-colors">
                  {p.title}
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3">
                  {p.desc}
                </p>
              </Link>
            </article>
          ))}
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
