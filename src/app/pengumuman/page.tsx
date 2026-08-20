"use client";

import Link from "next/link";
import {
  Megaphone,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AuthButtons from "@/components/auth-buttons";

const DESKTOP_NAV = [
  { label: "Beranda", href: "/", active: false },
  { label: "Layanan", href: "/layanan/surat", active: false },
  { label: "Peta", href: "/peta", active: false },
  { label: "Profil", href: "/profil", active: false },
] as const;

const POSTS = [
  {
    tag: "INFO KELURAHAN",
    tagClass: "text-primary",
    date: "Hari ini",
    title: "Jadwal Pemadaman Listrik",
    desc: "Akan dilakukan pemeliharaan jaringan pada area RW 03 dan RW 04 mulai pukul 09.00 - 14.00 WITA.",
  },
  {
    tag: "LAYANAN KESEHATAN",
    tagClass: "text-info",
    date: "Kemarin",
    title: "Posyandu Balita Oktober",
    desc: "Kegiatan Posyandu Mawar akan dilaksanakan di Balai Pertemuan pada tanggal 15 Oktober 2024.",
  },
  {
    tag: "PERINGATAN DINI",
    tagClass: "text-warning",
    date: "10 Okt",
    title: "Waspada Genangan Air",
    desc: "Curah hujan tinggi diprediksi beberapa hari ke depan. Warga diharap membersihkan saluran air.",
  },
  {
    tag: "KEGIATAN",
    tagClass: "text-secondary",
    date: "05 Okt",
    title: "Kerja Bakti Lingkungan",
    desc: "Kerja bakti membersihkan saluran drainase di seluruh RW akan dilaksanakan Sabtu pagi.",
  },
] as const;

export default function PengumumanPage() {
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

      <main className="flex-grow pt-16 md:pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full">
        <div className="mb-8">
          <span className="inline-block px-3 py-1 bg-primary-container/30 text-primary font-label-sm text-label-sm rounded-full mb-3 flex items-center gap-1.5">
            <Megaphone aria-hidden="true" className="w-4 h-4" /> PENGUMUMAN
          </span>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">
            Informasi & Pengumuman
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
            Informasi resmi dari Pemerintah Kelurahan Tiro Sompe untuk warga.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {POSTS.map((p) => (
            <article
              key={p.title}
              className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 hover:border-primary transition-colors"
            >
              <div className="flex justify-between items-start mb-2">
                <span className={cn("font-label-sm text-label-sm font-bold", p.tagClass)}>{p.tag}</span>
                <span className="font-label-sm text-label-sm text-outline">{p.date}</span>
              </div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">{p.title}</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{p.desc}</p>
            </article>
          ))}
        </div>
      </main>

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