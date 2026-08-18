"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  FileText,
  LayoutDashboard,
  MapPin,
  Menu,
  Route,
  Search,
  Settings,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: false },
  { label: "Data Penduduk", icon: Users, href: "/data-penduduk", active: true },
  { label: "Administrasi", icon: FileText, href: "/layanan/surat", active: false },
  { label: "Peta Wilayah", icon: Route, href: "/peta", active: false },
  { label: "Pengaturan", icon: Settings, href: "/pengaturan", active: false },
] as const;

interface Penduduk {
  nik: string;
  nama_lengkap: string;
  alamat: string;
}

function SidebarContent() {
  return (
    <>
      <div className="px-6 py-6 border-b border-outline-variant flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center font-label-md font-bold text-on-primary-container overflow-hidden shrink-0">
          AK
        </div>
        <div className="flex flex-col">
          <span className="font-label-md text-label-md text-on-surface">Admin Kelurahan</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant">Tiro Sompe</span>
        </div>
      </div>
      <div className="flex flex-col py-4 gap-2 overflow-y-auto">
        {SIDEBAR_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 mx-2 rounded-full transition-all duration-200",
              item.active
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            <item.icon aria-hidden="true" className="w-5 h-5" />
            <span className="font-label-md text-label-md">{item.label}</span>
          </Link>
        ))}
      </div>
      <div className="mt-auto p-4 text-center border-t border-outline-variant">
        <span className="font-label-sm text-label-sm text-outline">v1.0.2</span>
      </div>
    </>
  );
}

export default function DataPendudukPage() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Penduduk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/penduduk")
      .then((r) => r.json())
      .then((d) => {
        if (!d?.data) throw new Error("format");
        setData(d.data);
        setError(null);
      })
      .catch(() => {
        setData([]);
        setError("Data penduduk belum tersedia.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (p) =>
        p.nama_lengkap.toLowerCase().includes(q) ||
        p.nik.toLowerCase().includes(q) ||
        p.alamat.toLowerCase().includes(q)
    );
  }, [data, query]);

  return (
    <div className="bg-background text-on-background font-body-md text-body-md h-screen flex overflow-hidden">
      {/* Sidebar (desktop) */}
      <nav className="hidden md:flex flex-col bg-surface border-r border-outline-variant shadow-md fixed left-0 top-0 h-full w-[280px] z-40">
        <SidebarContent />
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <nav className="absolute left-0 top-0 h-full w-[280px] bg-surface flex flex-col shadow-xl">
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low z-10"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
            <SidebarContent />
          </nav>
        </div>
      )}

      <main className="flex-grow flex flex-col md:ml-[280px] h-full overflow-hidden">
        {/* TopAppBar */}
        <header className="bg-surface flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop z-30 border-b border-border-subtle shrink-0">
          <div className="flex items-center gap-4">
            <button
              type="button"
              aria-label="Menu"
              onClick={() => setDrawerOpen(true)}
              className="md:hidden text-on-surface-variant p-2 hover:bg-surface-container-low rounded-full transition-colors duration-200"
            >
              <Menu aria-hidden="true" className="w-5 h-5" />
            </button>
            <span className="font-headline-md text-headline-md font-bold text-primary">SiTSOMP</span>
          </div>
          <button
            type="button"
            aria-label="Notifikasi"
            onClick={() => router.push("/pengumuman")}
            className="text-on-surface-variant p-2 hover:bg-surface-container-low rounded-full transition-colors duration-200 relative"
            title="Lihat pengumuman"
          >
            <Bell aria-hidden="true" className="w-5 h-5" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-grow overflow-y-auto p-margin-mobile md:p-margin-desktop bg-background">
          <div className="max-w-max-width mx-auto flex flex-col gap-6">
            <div>
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Data Penduduk</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                Cari informasi kependudukan di wilayah Kelurahan Tiro Sompe.
              </p>
            </div>

            <div className="relative max-w-md">
              <Search
                aria-hidden="true"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5"
              />
              <input
                className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="Cari nama, NIK, atau alamat..."
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <p className="font-body-md text-body-md text-on-surface-variant">Memuat data...</p>
            ) : error ? (
              <div
                role="status"
                className="bg-surface-container-low border border-outline-variant rounded-xl p-8 text-center"
              >
                <Users aria-hidden="true" className="w-10 h-10 text-outline mx-auto mb-3" />
                <p className="font-body-md text-body-md text-on-surface-variant">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                Tidak ada data yang cocok.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((p) => (
                  <div
                    key={p.nik}
                    className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md font-bold shrink-0 overflow-hidden">
                        {p.nama_lengkap.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-label-md text-label-md text-on-surface font-semibold truncate">
                          {p.nama_lengkap}
                        </h3>
                        <span className="font-code-sm text-code-sm text-outline block truncate">
                          NIK {p.nik}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start text-on-surface-variant">
                      <MapPin aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
                      <span className="font-body-sm text-body-sm">{p.alamat}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="font-label-sm text-label-sm text-outline">
              {filtered.length} penduduk ditampilkan
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}