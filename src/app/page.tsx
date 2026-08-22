"use client";

import Link from "next/link";
import { FileText, Map, Megaphone, Users } from "lucide-react";
import AppHeader from "@/components/app-header";
import BackButton from "@/components/back-button";

export default function BerandaPage() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-grow pt-20 lg:pt-8 lg:pl-64 pb-20 md:pb-8 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full">
        {/* Hero Section */}
        <section className="relative rounded-2xl overflow-hidden mb-12 bg-surface-container-high h-[400px] md:h-[500px] flex items-end">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "url(https://lh3.googleusercontent.com/aida-public/AB6AXuAEhWtXWY0MpY1CNmGvuogy1VJWffhGWUj8eptFXzxg8eZS-cRLdDN5jMo0f594rRx0zblOhBPeVdWm8aCfpsiDjNZMM3brUttFRJmZBbGZpyoTn_yAUWi13PqtfP7fLdq6y3HTvUGy5zXqdiKNXPHRZjPwpNvqeYZVIl9Kzu1iGnGvBDdGTWAG-94scH_Ta1KPsi7FdCJXSKOgJVOMm8UBSQfV9d1XAnNMPhW1ubMFMlm9D4PxwpfHMw)",
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-on-background/80 to-transparent" />
          <div className="relative z-10 p-8 md:p-12 text-on-tertiary w-full max-w-3xl">
            <span className="inline-block px-3 py-1 bg-primary text-on-primary font-label-sm text-label-sm rounded-full mb-4">
              Portal Resmi Kelurahan
            </span>
            <h2 className="font-headline-lg text-headline-lg md:text-[48px] md:leading-[56px] font-bold mb-4">
              Selamat Datang di Kelurahan Tiro Sompe
            </h2>
            <p className="font-body-lg text-body-lg opacity-90 mb-8 max-w-2xl">
              Sistem Informasi Terpadu Kelurahan Tiro Sompe hadir untuk memberikan pelayanan
              administrasi yang cepat, transparan, dan mudah diakses oleh seluruh warga.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Link
                href="/layanan/surat"
                className="bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
              >
                Ajukan Surat
              </Link>
              <Link
                href="/peta"
                className="bg-surface/20 backdrop-blur-sm text-on-tertiary border border-on-tertiary/30 font-label-md text-label-md px-6 py-3 rounded-lg hover:bg-surface/30 transition-colors"
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
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Layanan Administrasi Surat */}
            <Link
              href="/layanan/surat"
              className="bg-surface rounded-xl p-6 border border-border-subtle hover:border-primary hover:shadow-md transition-all group col-span-1 md:col-span-2 lg:col-span-2 flex flex-col justify-between min-h-[160px] relative overflow-hidden"
            >
              <div className="absolute -right-8 -bottom-8 opacity-5 text-primary">
                <FileText aria-hidden="true" className="w-[120px] h-[120px] fill" />
              </div>
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
              className="bg-surface rounded-xl p-6 border border-border-subtle hover:border-primary hover:shadow-md transition-all group min-h-[160px] flex flex-col justify-between"
            >
              <div>
                <div className="bg-secondary-container/20 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-secondary">
                  <Users aria-hidden="true" className="w-5 h-5" />
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
              className="bg-surface rounded-xl p-6 border border-border-subtle hover:border-primary hover:shadow-md transition-all group min-h-[160px] flex flex-col justify-between"
            >
              <div>
                <div className="bg-success/10 w-10 h-10 rounded-lg flex items-center justify-center mb-4 text-success">
                  <Map aria-hidden="true" className="w-5 h-5" />
                </div>
                <h4 className="font-label-md text-label-md font-semibold text-on-surface mb-1 group-hover:text-primary transition-colors">
                  Peta Wilayah
                </h4>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Batas wilayah dan fasilitas umum.
                </p>
              </div>
            </Link>

            {/* Pengumuman */}
            <Link
              href="/pengumuman"
              className="bg-surface rounded-xl p-6 border border-border-subtle hover:border-primary hover:shadow-md transition-all group col-span-1 md:col-span-3 lg:col-span-4 bg-surface-muted flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="bg-info/10 w-12 h-12 rounded-full flex items-center justify-center text-info shrink-0">
                  <Megaphone aria-hidden="true" className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-label-md text-label-md font-semibold text-on-surface">
                    Pengumuman Terbaru: Jadwal Posyandu Balita Bulan Ini
                  </h4>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                    Pelaksanaan Posyandu akan diadakan pada tanggal 15 di Balai Warga RW 02.
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest relative w-full mt-auto border-t border-outline-variant">
        <div className="w-full py-8 px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-4 max-w-max-width mx-auto">
          <div>
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              © 2024 Pemerintah Kelurahan Tiro Sompe. Seluruh Hak Cipta Dilindungi.
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