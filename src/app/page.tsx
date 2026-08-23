import Link from "next/link";
import { FileText, Map, Megaphone, Users } from "lucide-react";
import AppHeader from "@/components/app-header";
import StatistikPenduduk from "@/components/statistik-penduduk";
import { getInformasiPublik, JENIS_INFO_LABEL } from "@/lib/informasi-publik";

export const dynamic = "force-dynamic";

export default async function BerandaPage() {
  // Satu pengumuman/berita terbaru dari admin untuk strip di bawah kartu layanan.
  const { items } = await getInformasiPublik(1);
  const terbaru = items[0] ?? null;

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-grow pt-20 lg:pt-8 lg:pl-16 pb-16 md:px-margin-desktop max-w-max-width mx-auto w-full px-safe">
        {/* Hero Section */}
        <section className="relative rounded-2xl overflow-hidden mb-8 md:mb-12 bg-surface-container-high h-[360px] sm:h-[400px] md:h-[500px] flex items-end">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://lh3.googleusercontent.com/aida-public/AB6AXuAEhWtXWY0MpY1CNmGvuogy1VJWffhGWUj8eptFXzxg8eZS-cRLdDN5jMo0f594rRx0zblOhBPeVdWm8aCfpsiDjNZMM3brUttFRJmZBbGZpyoTn_yAUWi13PqtfP7fLdq6y3HTvUGy5zXqdiKNXPHRZjPwpNvqeYZVIl9Kzu1iGnGvBDdGTWAG-94scH_Ta1KPsi7FdCJXSKOgJVOMm8UBSQfV9d1XAnNMPhW1ubMFMlm9D4PxwpfHMw)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 to-transparent" />
          <div className="relative z-10 p-5 sm:p-8 md:p-12 text-on-tertiary w-full max-w-3xl">
            <span className="inline-block px-3 py-1 bg-primary text-on-primary font-label-sm text-label-sm rounded-full mb-4">
              Portal Resmi Kelurahan
            </span>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile leading-headline-lg-mobile md:font-headline-lg md:text-headline-lg md:leading-headline-lg font-bold mb-4">
              Selamat Datang di Kelurahan Tiro Sompe
            </h2>
            <p className="font-body-md text-body-md md:font-body-lg md:text-body-lg opacity-90 mb-6 md:mb-8 max-w-2xl">
              Sistem Informasi Terpadu Kelurahan Tiro Sompe hadir untuk memberikan pelayanan
              administrasi yang cepat, transparan, dan mudah diakses oleh seluruh warga.
            </p>
            <div className="flex gap-3 md:gap-4 flex-wrap">
              <Link
                href="/layanan/surat"
                className="flex-1 sm:flex-none text-center bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
              >
                Ajukan Surat
              </Link>
              <Link
                href="/peta"
                className="flex-1 sm:flex-none text-center bg-surface/20 backdrop-blur-sm text-on-tertiary border border-on-tertiary/30 font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-surface/30 transition-colors"
              >
                Jelajahi Peta
              </Link>
            </div>
          </div>
        </section>

        {/* Bento Grid Services */}
        <section className="mb-16">
          <h3 className="font-headline-sm text-headline-sm font-semibold mb-6 text-on-surface">
            Akses Layanan Cepat
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Layanan Administrasi Surat */}
            <Link
              href="/layanan/surat"
              className="bg-surface rounded-xl p-5 md:p-6 border border-border-subtle hover:border-primary hover:shadow-md transition-all group col-span-1 sm:col-span-2 md:col-span-2 flex flex-col justify-between min-h-[150px] md:min-h-[160px]"
            >
              <div className="relative z-10">
                <div className="bg-primary-container/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-primary">
                  <FileText aria-hidden="true" className="w-6 h-6" />
                </div>
                <h4 className="font-headline-sm text-headline-sm font-semibold text-on-surface mb-2 group-hover:text-primary transition-colors">
                  Layanan Administrasi Surat
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Pengajuan Surat Keterangan Usaha, Domisili, dan Pengantar lainnya secara online.
                </p>
              </div>
            </Link>

            {/* Data Penduduk */}
            <Link
              href="/data-penduduk"
              className="bg-surface rounded-xl p-5 md:p-6 border border-border-subtle hover:border-primary hover:shadow-md transition-all group min-h-[150px] md:min-h-[160px] flex flex-col justify-between"
            >
              <div>
                <div className="bg-secondary-container/20 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-secondary">
                  <Users aria-hidden="true" className="w-6 h-6" />
                </div>
                <h4 className="font-label-md text-label-md font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors">
                  Data Penduduk
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Cari informasi kependudukan RT/RW.
                </p>
              </div>
            </Link>

            {/* Peta Wilayah */}
            <Link
              href="/peta"
              className="bg-surface rounded-xl p-5 md:p-6 border border-border-subtle hover:border-primary hover:shadow-md transition-all group min-h-[150px] md:min-h-[160px] flex flex-col justify-between"
            >
              <div>
                <div className="bg-success/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 text-success">
                  <Map aria-hidden="true" className="w-6 h-6" />
                </div>
                <h4 className="font-label-md text-label-md font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors">
                  Peta Wilayah
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Batas wilayah dan fasilitas umum.
                </p>
              </div>
            </Link>

            {/* Pengumuman terbaru dari admin */}
            <Link
              href="/pengumuman"
              className="bg-surface-muted rounded-xl p-5 md:p-6 border border-border-subtle hover:border-primary hover:shadow-md transition-all group col-span-1 sm:col-span-2 md:col-span-3 lg:col-span-4 flex items-start md:items-center gap-4"
            >
              <div className="bg-info/10 w-12 h-12 shrink-0 rounded-full flex items-center justify-center text-info">
                <Megaphone aria-hidden="true" className="w-6 h-6" />
              </div>
              <div className="min-w-0">
                {terbaru ? (
                  <>
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface break-words">
                      {JENIS_INFO_LABEL[terbaru.jenis as keyof typeof JENIS_INFO_LABEL] ?? "INFO"}{" "}
                      Terbaru: {terbaru.title}
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">
                      {terbaru.desc}
                    </p>
                  </>
                ) : (
                  <>
                    <h4 className="font-label-md text-label-md font-semibold text-on-surface break-words">
                      Informasi &amp; Pengumuman
                    </h4>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      Lihat informasi resmi dari Kelurahan Tiro Sompe.
                    </p>
                  </>
                )}
              </div>
            </Link>
          </div>
        </section>

        {/* Statistik penduduk realtime */}
        <StatistikPenduduk />
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest relative w-full mt-auto border-t border-outline-variant">
        <div className="w-full py-8 md:px-margin-desktop max-w-max-width mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 px-safe">
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