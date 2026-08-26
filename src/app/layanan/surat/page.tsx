"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/app-header";
import { getLayananIcon } from "@/lib/layanan-icons";
import {
  CATEGORIES,
  type SuratCategory,
} from "@/lib/surat-config";

// Kartu layanan buatan admin (tabel layanan_cards). SEJAK 2026-08-25
// seluruh layanan surat bawaan dihapus — grid ini HANYA menampilkan kartu
// yang dikelola admin dari dashboard (tab "Kartu Layanan").
interface LayananCardPublik {
  id: string;
  judul: string;
  deskripsi: string;
  icon: string;
  link_url: string;
  label_tombol: string;
}

export default function LayananSuratPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SuratCategory>("Semua");
  const [cards, setCards] = useState<LayananCardPublik[]>([]);
  const [muat, setMuat] = useState(true);

  useEffect(() => {
    let batal = false;
    fetch("/api/layanan/cards")
      .then((r) => r.json())
      .then((d) => {
        if (!batal && Array.isArray(d?.data)) setCards(d.data);
      })
      .catch(() => {})
      .finally(() => {
        if (!batal) setMuat(false);
      });
    return () => {
      batal = true;
    };
  }, []);

  const kartuTerfilter = useMemo(() => {
    const q = query.trim().toLowerCase();
    return cards.filter((c) => {
      const matchCat = category === "Semua" || category === "Lainnya";
      const matchQ =
        !q ||
        c.judul.toLowerCase().includes(q) ||
        c.deskripsi.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [cards, query, category]);

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased">
      <AppHeader />

      <main className="flex-1 pt-20 lg:pt-8 lg:pl-16 px-margin-mobile md:px-margin-desktop pb-16">
        <div className="max-w-max-width mx-auto">
          <div className="mb-8">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
              Layanan Surat Administrasi
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Pilih layanan yang ingin Anda gunakan. Setiap kartu mengarahkan
              ke halaman layanan resmi terkait.
            </p>
          </div>

          {/* Search & filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search
                aria-hidden="true"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5"
              />
              <input
                className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="Cari layanan..."
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={cn(
                    "px-4 py-2 rounded-full font-label-md text-label-md whitespace-nowrap transition-colors",
                    category === cat
                      ? "bg-primary-container text-on-primary-container"
                      : "bg-surface text-on-surface-variant border border-outline-variant hover:bg-surface-container-low"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grid kartu layanan (semua dikelola admin) */}
          {muat ? (
            <p className="text-on-surface-variant font-body-md py-8 text-center">
              Memuat layanan...
            </p>
          ) : kartuTerfilter.length === 0 ? (
            <div className="bg-surface-container-low border border-outline-variant rounded-xl p-10 text-center">
              <ExternalLink aria-hidden="true" className="w-10 h-10 text-outline mx-auto mb-3" />
              <p className="font-body-md text-body-md text-on-surface-variant">
                {cards.length === 0
                  ? "Belum ada layanan yang tersedia. Layanan akan ditambahkan oleh admin kelurahan."
                  : `Tidak ada layanan yang cocok dengan pencarian "${query}".`}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {kartuTerfilter.map((c) => {
                const Icon = getLayananIcon(c.icon);
                return (
                  <div
                    key={c.id}
                    className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 flex flex-col hover:border-primary transition-colors group"
                  >
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-primary-fixed text-primary">
                      <Icon aria-hidden="true" className="w-6 h-6" />
                    </div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                      {c.judul}
                    </h3>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 flex-1">
                      {c.deskripsi}
                    </p>
                    <a
                      href={c.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={cn(
                        "w-full py-3 rounded-lg font-label-md text-label-md transition-colors flex justify-center items-center gap-2 mt-auto",
                        "bg-primary text-on-primary hover:bg-on-primary-fixed-variant"
                      )}
                    >
                      {c.label_tombol || "Buka Layanan"}
                      <ExternalLink aria-hidden="true" className="w-4 h-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest text-primary font-body-sm text-body-sm border-t border-outline-variant transition-opacity duration-150 relative w-full mt-auto py-8 px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-4 max-w-max-width mx-auto">
        <div className="font-label-md text-label-md font-bold text-on-surface">
          © 2026 KKN ITH 03 Tiro Sompe. Seluruh Hak Cipta Dilindungi.
        </div>
        <div className="flex flex-wrap gap-4 md:justify-end text-on-surface-variant">
          <Link className="hover:text-primary underline transition-opacity duration-150" href="/kontak">
            Kontak Kami
          </Link>
          <Link className="hover:text-primary underline transition-opacity duration-150" href="/kebijakan-privasi">
            Kebijakan Privasi
          </Link>
          <Link
            className="hover:text-primary underline transition-opacity duration-150"
            href="https://kemendagri.go.id"
            target="_blank"
            rel="noopener noreferrer"
          >
            Portal Nasional
          </Link>
          <Link className="hover:text-primary underline transition-opacity duration-150" href="/peta-situs">
            Peta Situs
          </Link>
        </div>
      </footer>
    </div>
  );
}
