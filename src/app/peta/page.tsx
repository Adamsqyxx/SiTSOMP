"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  User,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AuthButtons from "@/components/auth-buttons";
import BackButton from "@/components/back-button";

// Daftar kategori fasilitas (dipetakan ke nilai enum JenisLokasi).
const CATEGORIES = [
  { label: "Semua", key: "all", color: "text-primary" },
  { label: "Kesehatan", key: "kesehatan", color: "text-primary" },
  { label: "Pendidikan", key: "pendidikan", color: "text-on-primary-container" },
  { label: "Pemerintahan", key: "pemerintahan", color: "text-tertiary" },
  { label: "Ibadah", key: "ibadah", color: "text-secondary" },
] as const;

const DESKTOP_NAV = [
  { label: "Beranda", href: "/", active: false },
  { label: "Layanan", href: "/layanan/surat", active: false },
  { label: "Peta", href: "/peta", active: true },
  { label: "Profil", href: "/profil", active: false },
] as const;

// Batas RT/RW sementara disembunyikan dari legenda (data resmi belum tersedia).
const LEGEND_ADMIN = [
  { label: "Batas Kelurahan", className: "border-[#0059a8] bg-[#0059a8]/10" },
] as const;

const LEGEND_ROADS = [
  { label: "Jalan Utama", isDashed: false },
  { label: "Jalan Lingkungan", isDashed: true },
] as const;

interface Feature {
  id: string;
  category: string;
  name: string;
  address: string;
  detail: string;
  latitude: number;
  longitude: number;
}

function GitPanelContent({
  features,
  query,
  setQuery,
  categoryKey,
  setCategoryKey,
  feature,
  onClose,
  onPick,
}: {
  features: Feature[];
  query: string;
  setQuery: (v: string) => void;
  categoryKey: string;
  setCategoryKey: (v: string) => void;
  feature: Feature | null;
  onClose?: () => void;
  onPick?: (f: Feature) => void;
}) {
  return (
    <>
      {/* Search */}
      <div className="p-6 border-b border-outline-variant">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-4">Pencarian Peta</h2>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5"
          />
          <input
            className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary font-body-sm text-body-sm text-on-surface transition-shadow"
            placeholder="Cari fasilitas, RT/RW, jalan..."
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {/* Hasil pencarian — klik = fokus peta ke lokasi */}
        {query.trim() && (
          <ul className="mt-3 space-y-1 max-h-48 overflow-y-auto">
            {features.length === 0 && (
              <li className="font-body-sm text-body-sm text-on-surface-variant px-2 py-1">
                Tidak ada hasil.
              </li>
            )}
            {features.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => onPick?.(f)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-2"
                >
                  <MapPin aria-hidden="true" className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-body-sm text-body-sm text-on-surface truncate">
                    {f.name}
                  </span>
                  <span className="ml-auto font-label-sm text-label-sm text-outline shrink-0">
                    {f.category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Filters */}
      <div className="p-6 border-b border-outline-variant">
        <h3 className="font-label-md text-label-md text-on-surface-variant mb-3">Kategori Fasilitas</h3>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              type="button"
              onClick={() => setCategoryKey(cat.key)}
              className={cn(
                "flex flex-col items-center justify-center p-3 rounded-xl transition-colors group",
                categoryKey === cat.key
                  ? "bg-primary text-on-primary border border-primary"
                  : "bg-surface-container-low border border-outline-variant hover:bg-surface-container-high"
              )}
            >
              <span className={cn("font-label-sm text-label-sm", categoryKey === cat.key ? "text-on-primary" : "text-on-surface")}>
                {cat.label}
              </span>
            </button>
          ))}
        </div>
        <p className="font-label-sm text-label-sm text-outline mt-3">
          {features.length} fasilitas ditampilkan
        </p>

        {/* Hasil filter: list fasilitas yang cocok dengan kategori aktif */}
        {categoryKey !== "all" && (
          <ul className="mt-3 space-y-1 max-h-56 overflow-y-auto border-t border-outline-variant pt-3">
            {features.length === 0 && (
              <li className="font-body-sm text-body-sm text-on-surface-variant px-2 py-1">
                Tidak ada fasilitas pada kategori ini.
              </li>
            )}
            {features.map((f) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => onPick?.(f)}
                  className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-2"
                >
                  <MapPin aria-hidden="true" className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-body-sm text-body-sm text-on-surface truncate">
                    {f.name}
                  </span>
                  <span className="ml-auto font-label-sm text-label-sm text-outline shrink-0">
                    {f.category}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Legend */}
      <div className="p-6 flex-1 overflow-y-auto">
        <h3 className="font-label-md text-label-md text-on-surface-variant mb-4">Legenda Peta</h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-label-sm text-label-sm text-outline mb-2 uppercase tracking-wider">
              Batas Administrasi
            </h4>
            <ul className="space-y-2">
              {LEGEND_ADMIN.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <div className={cn("w-5 h-5 rounded border-2", item.className)} />
                  <span className="font-body-sm text-body-sm text-on-surface">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="pt-4 border-t border-outline-variant">
            <h4 className="font-label-sm text-label-sm text-outline mb-2 uppercase tracking-wider">
              Infrastruktur
            </h4>
            <ul className="space-y-2">
              {LEGEND_ROADS.map((item) => (
                <li key={item.label} className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-5 h-1 rounded-full",
                      item.isDashed
                        ? "bg-outline-variant border-t border-dashed border-on-surface-variant"
                        : "bg-on-surface-variant"
                    )}
                  />
                  <span className="font-body-sm text-body-sm text-on-surface">{item.label}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Selected feature card (only on desktop panel) */}
      {feature ? (
        <div className="p-4 border-t border-outline-variant bg-surface/90 backdrop-blur-md">
          <div className="flex justify-between items-start">
            <span className="inline-block px-2 py-1 bg-primary-container/30 text-primary font-label-sm text-label-sm rounded mb-1">
              {feature.category}
            </span>
            <button
              type="button"
              aria-label="Tutup"
              onClick={onClose}
              className="text-on-surface-variant hover:text-on-surface"
            >
              <X aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>
          <h4 className="font-headline-sm text-headline-sm text-on-surface">{feature.name}</h4>
          <div className="mt-3 space-y-2 text-on-surface-variant">
            <div className="flex gap-2 items-start">
              <MapPin aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="font-body-sm text-body-sm">{feature.address}</span>
            </div>
            <div className="flex gap-2 items-start">
              <MapPin aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
              <span className="font-body-sm text-body-sm whitespace-pre-line">{feature.detail}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              const url = `https://www.google.com/maps/dir/?api=1&destination=${feature.latitude},${feature.longitude}`;
              window.open(url, "_blank", "noopener,noreferrer");
            }}
            className="w-full mt-3 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-2"
          >
            <NavigationIcon /> Rute
          </button>
        </div>
      ) : (
        <div className="p-4 border-t border-outline-variant bg-surface/90 backdrop-blur-md">
          <div className="flex flex-col items-center justify-center text-center py-6 text-on-surface-variant gap-2">
            <MapPin aria-hidden="true" className="w-6 h-6 text-outline" />
            <p className="font-body-sm text-body-sm">
              Klik fasilitas atau wilayah di peta untuk melihat detailnya.
            </p>
          </div>
        </div>
      )}
    </>
  );
}

function NavigationIcon() {
  return (
    <svg
      aria-hidden="true"
      className="w-4 h-4"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
  );
}

export default function PetaPage() {
  const [selected, setSelected] = useState<Feature | null>(null);
  const [focused, setFocused] = useState<Feature | null>(null);
  const [allFeatures, setAllFeatures] = useState<Feature[]>([]);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [categoryKey, setCategoryKey] = useState<string>("all");

  // Set pilihan dari query string kalau ada (?kategori=kesehatan).
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    if (loaded) return;
    let cancelled = false;
    fetch("/api/fasilitas")
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setAllFeatures(d.data ?? []);
        setLoaded(true);
      })
      .catch(() => {
        if (!cancelled) setLoaded(true);
      });
    return () => {
      cancelled = true;
    };
  }, [loaded]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allFeatures
      .filter((f) => {
        const matchQ =
          !q ||
          f.name.toLowerCase().includes(q) ||
          f.address.toLowerCase().includes(q) ||
          f.detail.toLowerCase().includes(q);
        const matchCat = categoryKey === "all" || f.category === categoryKey;
        return matchQ && matchCat;
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allFeatures, query, categoryKey]);

  return (
    <div className="bg-background text-on-background font-body-md text-body-md overflow-hidden flex flex-col h-screen">
      {/* TopAppBar — pola header publik SiTSOMP */}
      <header className="bg-surface fixed top-0 w-full z-50 border-b border-outline-variant transition-colors duration-200">
        <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop z-50 max-w-max-width mx-auto">
          <div className="flex items-center gap-4">
            <BackButton
              fallbackHref="/"
              label=""
              className="hidden md:inline-flex text-on-surface-variant hover:bg-surface-container-low rounded-full p-2"
            />
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
            <button
              type="button"
              aria-label="Cari"
              onClick={() => setSearchOpen(true)}
              className="md:hidden text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full flex items-center justify-center"
              title="Cari lokasi"
            >
              <Search aria-hidden="true" className="w-5 h-5" />
            </button>
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

      <div className="flex flex-1 pt-16 h-full w-full">
        {/* Main GIS work area */}
        <main className="flex-1 flex h-full relative">
          {/* Persistent side panel (desktop) */}
          <aside className="hidden md:flex w-80 bg-surface border-r border-outline-variant flex-col h-full shadow-[2px_0_8px_-4px_rgba(0,0,0,0.1)] z-10">
            <GitPanelContent
              features={filtered}
              query={query}
              setQuery={setQuery}
              categoryKey={categoryKey}
              setCategoryKey={setCategoryKey}
              feature={selected}
              onClose={() => setSelected(null)}
              onPick={(f) => {
                setSelected(f);
                setFocused(f);
              }}
            />
          </aside>

          {/* Map display area */}
          <section className="flex-1 relative bg-surface-dim overflow-hidden">
            {/* Interaktif Leaflet map */}
            <LeafletMap
              onSelect={setSelected}
              focusFeature={focused}
              filterCategory={categoryKey}
            />

            {/* Mobile search overlay (muncul saat tombol Cari ditekan) */}
            {searchOpen && (
              <div className="absolute top-4 left-4 right-4 z-[600] md:hidden bg-surface rounded-xl border border-outline-variant shadow-lg p-4 max-h-[70vh] overflow-y-auto">
                <div className="flex items-center gap-2 mb-3">
                  <Search aria-hidden="true" className="w-5 h-5 text-on-surface-variant" />
                  <input
                    className="w-full bg-transparent outline-none font-body-md text-body-md text-on-surface placeholder:text-outline"
                    placeholder="Cari fasilitas, RT/RW, jalan..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setSearchOpen(false);
                    }}
                    autoFocus
                  />
                  <button
                    type="button"
                    aria-label="Tutup pencarian"
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                    }}
                    className="text-on-surface-variant hover:bg-surface-container-low rounded-full p-1"
                  >
                    <X aria-hidden="true" className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex gap-2 flex-wrap mb-3">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setCategoryKey(cat.key)}
                      className={cn(
                        "px-3 py-1 rounded-full font-label-sm text-label-sm transition-colors",
                        categoryKey === cat.key
                          ? "bg-primary text-on-primary"
                          : "bg-surface-container-low text-on-surface-variant border border-outline-variant"
                      )}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                {query.trim() === "" && categoryKey === "all" ? (
                  <p className="font-body-sm text-body-sm text-on-surface-variant px-1 py-2">
                    Ketik nama atau pilih kategori untuk memfilter fasilitas.
                  </p>
                ) : filtered.length === 0 ? (
                  <p className="font-body-sm text-body-sm text-on-surface-variant px-1 py-2">
                    Tidak ada hasil.
                  </p>
                ) : (
                  <ul className="space-y-1">
                    {filtered.map((f) => (
                      <li key={f.id}>
                        <button
                          type="button"
                          onClick={() => {
                            setSelected(f);
                            setFocused(f);
                            setSearchOpen(false);
                            setQuery("");
                          }}
                          className="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container-high transition-colors flex items-center gap-2"
                        >
                          <MapPin aria-hidden="true" className="w-4 h-4 text-primary shrink-0" />
                          <span className="font-body-sm text-body-sm text-on-surface truncate">
                            {f.name}
                          </span>
                          <span className="ml-auto font-label-sm text-label-sm text-outline shrink-0">
                            {f.category}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {/* Selected feature card (mobile overlay) */}
            {selected && (
              <div className="absolute bottom-6 left-6 right-6 md:left-auto md:w-80 bg-surface/90 backdrop-blur-md border border-outline-variant/50 rounded-xl shadow-lg overflow-hidden">
                <div className="p-4 border-b border-outline-variant/50 flex justify-between items-start">
                  <div>
                    <span className="inline-block px-2 py-1 bg-primary-container/30 text-primary font-label-sm text-label-sm rounded mb-1">
                      {selected.category}
                    </span>
                    <h4 className="font-headline-sm text-headline-sm text-on-surface">
                      {selected.name}
                    </h4>
                  </div>
                  <button
                    type="button"
                    aria-label="Tutup"
                    onClick={() => setSelected(null)}
                    className="text-on-surface-variant hover:text-on-surface"
                  >
                    <X aria-hidden="true" className="w-4 h-4" />
                  </button>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex gap-3 items-start text-on-surface-variant">
                    <MapPin aria-hidden="true" className="w-[18px] h-[18px] mt-0.5 shrink-0" />
                    <span className="font-body-sm text-body-sm">{selected.address}</span>
                  </div>
                  <div className="flex gap-3 items-start text-on-surface-variant">
                    <MapPin aria-hidden="true" className="w-[18px] h-[18px] mt-0.5 shrink-0" />
                    <span className="font-body-sm text-body-sm whitespace-pre-line">
                      {selected.detail}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${selected.latitude},${selected.longitude}`;
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    className="w-full mt-2 py-2 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-on-primary-fixed-variant transition-colors flex items-center justify-center gap-2"
                  >
                    <NavigationIcon /> Rute
                  </button>
                </div>
              </div>
            )}

            {/* Map scale */}
            <div className="absolute bottom-6 right-6 bg-surface-container-lowest/80 backdrop-blur-sm px-3 py-1 rounded border border-outline-variant/50 font-code-md text-code-md text-on-surface-variant shadow-sm hidden md:flex items-center">
              100m
              <div className="inline-block w-16 h-1 border-x-2 border-b-2 border-outline-variant ml-2 align-middle" />
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

// Leaflet akses `window` saat import → hanya dimuat di sisi client (ssr: false).
import dynamic from "next/dynamic";
const LeafletMap = dynamic(() => import("@/components/map/leaflet-map"), {
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 z-0 flex items-center justify-center bg-surface-dim text-on-surface-variant font-body-sm">
      Memuat peta...
    </div>
  ),
});