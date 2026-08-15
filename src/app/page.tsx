"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  FileText,
  Map,
  Megaphone,
  Menu,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const DESKTOP_NAV = [
  { label: "Beranda", href: "/", active: true },
  { label: "Layanan", href: "/layanan/surat", active: false },
  { label: "Peta", href: "/peta", active: false },
  { label: "Profil", href: "/login", active: false },
] as const;

export default function BerandaPage() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="bg-surface fixed top-0 w-full z-50 border-b border-outline-variant transition-colors duration-200">
        <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop z-50 max-w-max-width mx-auto">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setDrawerOpen(true)}
              className="md:hidden text-on-surface-variant hover:bg-surface-container-low rounded-full p-2"
            >
              <Menu aria-hidden="true" className="w-5 h-5" />
            </button>
            <h1 className="font-headline-md text-headline-md font-bold text-primary">SiTSOMP</h1>
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

          <button
            type="button"
            aria-label="Notifikasi"
            className="text-on-surface-variant hover:bg-surface-container-low rounded-full p-2"
          >
            <Bell aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {/* Mobile drawer */}
        {drawerOpen && (
          <div className="lg hidden">
            <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
              <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
              <nav className="absolute left-0 top-0 h-full w-[280px] bg-surface flex flex-col p-4 shadow-xl">
                <button
                  type="button"
                  aria-label="Tutup menu"
                  onClick={() => setDrawerOpen(false)}
                  className="absolute top-4 right-4 p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low z-10"
                >
                  <X aria-hidden="true" className="w-5 h-5" />
                </button>
                {DESKTOP_NAV.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={() => setDrawerOpen(false)}
                    className={cn(
                      "px-4 py-3 rounded-full font-label-md text-label-md transition-colors",
                      item.active
                        ? "bg-primary-container text-on-primary-container"
                        : "text-on-surface-variant hover:bg-surface-container-high"
                    )}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>

      <main className="flex-grow pt-16 md:pt-24 pb-20 md:pb-8 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full">
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
              href="#"
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
              href="#"
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
              <ArrowRight aria-hidden="true" className="w-5 h-5 text-outline hidden md:block group-hover:text-primary transition-colors" />
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
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary underline transition-opacity duration-150" href="#">
              Kontak Kami
            </a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary underline transition-opacity duration-150" href="#">
              Kebijakan Privasi
            </a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary underline transition-opacity duration-150" href="#">
              Portal Nasional
            </a>
            <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary underline transition-opacity duration-150" href="#">
              Peta Situs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}