"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  FileText,
  FileWarning,
  HandHeart,
  Home,
  LayoutDashboard,
  Map,
  MapPin,
  Menu,
  Route,
  Search,
  Settings,
  Store,
  User,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AuthButtons from "@/components/auth-buttons";
import BackButton from "@/components/back-button";

const DESKTOP_NAV = [
  { label: "Beranda", icon: Home, href: "/", active: false },
  { label: "Layanan", icon: FileText, href: "/layanan/surat", active: true },
  { label: "Peta", icon: Map, href: "/peta", active: false },
  { label: "Profil", icon: User, href: "/profil", active: false },
] as const;

const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: false },
  { label: "Data Penduduk", icon: Users, href: "/data-penduduk", active: false },
  { label: "Administrasi", icon: FileText, href: "/layanan/surat", active: true },
  { label: "Peta Wilayah", icon: Route, href: "/peta", active: false },
  { label: "Pengaturan", icon: Settings, href: "/pengaturan", active: false },
] as const;

const CATEGORIES = ["Semua", "Kependudukan", "Usaha", "Sosial"] as const;

interface Service {
  id: string;
  name: string;
  category: string;
  desc: string;
  requirements: string[];
  icon: typeof HandHeart;
  iconClass: string;
  action: string;
  actionClass: string;
}

const SERVICES: Service[] = [
  {
    id: "SKTM",
    name: "Surat Keterangan Tidak Mampu (SKTM)",
    category: "Sosial",
    desc: "Diperlukan untuk keperluan keringanan biaya pendidikan, kesehatan, atau bantuan sosial lainnya.",
    requirements: ["Pengantar RT/RW", "Fotokopi KK & KTP", "Foto kondisi rumah"],
    icon: HandHeart,
    iconClass: "bg-primary-fixed text-primary",
    action: "Buat Pengajuan",
    actionClass: "bg-primary text-on-primary hover:bg-on-primary-fixed-variant",
  },
  {
    id: "SKU",
    name: "Surat Keterangan Usaha (SKU)",
    category: "Usaha",
    desc: "Digunakan sebagai bukti kepemilikan usaha untuk keperluan pinjaman bank atau perizinan lanjutan.",
    requirements: ["Pengantar RT/RW", "Fotokopi KTP", "Foto tempat usaha"],
    icon: Store,
    iconClass: "bg-secondary-fixed text-secondary",
    action: "Buat Pengajuan",
    actionClass: "bg-primary text-on-primary hover:bg-on-primary-fixed-variant",
  },
  {
    id: "DOM",
    name: "Surat Keterangan Domisili",
    category: "Kependudukan",
    desc: "Keterangan tempat tinggal sementara bagi warga yang belum memiliki KTP setempat.",
    requirements: ["Pengantar RT/RW", "Fotokopi KTP asal", "Fotokopi KK asal"],
    icon: MapPin,
    // Konsisten dengan SKTM/SKU: ikon tonal + tombol solid primary.
    iconClass: "bg-secondary-fixed text-secondary",
    action: "Buat Pengajuan",
    actionClass: "bg-primary text-on-primary hover:bg-on-primary-fixed-variant",
  },
  {
    id: "SKM",
    name: "Surat Keterangan Kematian",
    category: "Kependudukan",
    desc: "Dokumen pendukung untuk mengurus akta kematian di Dinas Kependudukan dan Catatan Sipil.",
    requirements: ["Surat keterangan RS/Dokter", "KTP Asli Almarhum", "KK Asli Almarhum"],
    icon: FileWarning,
    iconClass: "bg-surface-container-highest text-on-surface-variant",
    action: "Lihat Detail",
    actionClass: "border border-primary text-primary hover:bg-surface-container-low",
  },
];

function SidebarContent() {
  return (
    <>
      <div className="flex items-center gap-4 px-4 py-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant flex-shrink-0 flex items-center justify-center font-label-md font-bold text-on-surface">
          AK
        </div>
        <div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">Admin Kelurahan</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Tiro Sompe</p>
          <span className="font-label-sm text-label-sm text-outline">v1.0.2</span>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {SIDEBAR_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 mx-2 rounded-full font-body-md text-body-md transition-all duration-200",
              item.active
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            <item.icon aria-hidden="true" className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="mt-auto p-4 border-t border-outline-variant">
        <AuthButtons stacked />
      </div>
    </>
  );
}

export default function LayananSuratPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Semua");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return SERVICES.filter((s) => {
      const matchCat = category === "Semua" || s.category === category;
      const matchQ =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.desc.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [query, category]);

  const handleAction = (s: Service) => {
    // Alur pengajuan nyata tersedia nanti; sekarang arahkan ke halaman pengajuan
    // dengan kode surat terpilih.
    router.push(`/layanan/surat/${s.id.toLowerCase()}?jenis=${encodeURIComponent(s.name)}`);
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased">
      {/* TopAppBar */}
      <header className="bg-surface text-primary border-b border-outline-variant transition-colors duration-200 fixed top-0 w-full z-50 flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setDrawerOpen(true)}
            className="md:hidden hover:bg-surface-container-low p-2 rounded-full transition-colors flex items-center justify-center text-on-surface-variant"
          >
            <Menu aria-hidden="true" className="w-5 h-5" />
          </button>
          <BackButton
            fallbackHref="/"
            label=""
            className="hidden md:inline-flex text-on-surface-variant hover:bg-surface-container-low rounded-full p-2"
          />
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">SiTSOMP</Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {DESKTOP_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-label-md text-label-md transition-colors duration-200",
                item.active
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              )}
            >
              <item.icon aria-hidden="true" className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            aria-label="Notifikasi"
            onClick={() => router.push("/pengumuman")}
            className="hover:bg-surface-container-low p-2 rounded-full transition-colors flex items-center justify-center text-on-surface-variant"
            title="Lihat pengumuman"
          >
            <Bell aria-hidden="true" className="w-5 h-5" />
          </button>
          <AuthButtons className="hidden md:flex" />
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <nav className="absolute left-0 top-0 h-full w-[280px] bg-surface flex flex-col pt-4 shadow-xl">
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

      <div className="flex flex-1 pt-16 w-full max-w-max-width mx-auto">
        {/* Sidebar (desktop) */}
        <aside className="hidden md:flex flex-col py-4 gap-2 bg-surface text-primary border-r border-outline-variant shadow-md fixed left-0 top-16 h-[calc(100vh-4rem)] w-[280px]">
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 px-margin-mobile md:px-margin-desktop py-8 md:ml-[280px]">
          <div className="mb-8">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
              Layanan Surat Administrasi
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
              Pilih jenis surat yang ingin Anda ajukan. Pastikan Anda telah melengkapi semua
              persyaratan yang dibutuhkan sebelum memulai proses pengajuan.
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
                placeholder="Cari jenis surat..."
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

          {/* Services grid */}
          {filtered.length === 0 ? (
            <div className="text-center py-16 text-on-surface-variant font-body-md">
              Tidak ada layanan yang cocok dengan pencarian &quot;{query}&quot;.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((s) => (
                <div
                  key={s.id}
                  className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 flex flex-col hover:border-primary transition-colors group"
                >
                  <div
                    className={cn(
                      "w-12 h-12 rounded-lg flex items-center justify-center mb-4",
                      s.iconClass
                    )}
                  >
                    <s.icon aria-hidden="true" className="w-6 h-6" />
                  </div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                    {s.name}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 flex-1">
                    {s.desc}
                  </p>
                  <div className="bg-surface-container-low rounded-lg p-4 mb-6">
                    <h4 className="font-label-sm text-label-sm text-on-surface mb-2">Persyaratan:</h4>
                    <ul className="font-body-sm text-body-sm text-on-surface-variant space-y-1 list-disc pl-4">
                      {s.requirements.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAction(s)}
                    className={cn(
                      "w-full py-3 rounded-lg font-label-md text-label-md transition-colors flex justify-center items-center gap-2 mt-auto",
                      s.actionClass
                    )}
                  >
                    {s.action}
                    <ArrowRight aria-hidden="true" className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-surface-container-lowest text-primary font-body-sm text-body-sm border-t border-outline-variant transition-opacity duration-150 relative w-full mt-auto py-8 px-margin-mobile md:px-margin-desktop grid grid-cols-1 md:grid-cols-2 gap-4 max-w-max-width mx-auto">
        <div className="font-label-md text-label-md font-bold text-on-surface">
          © 2024 Pemerintah Kelurahan Tiro Sompe. Seluruh Hak Cipta Dilindungi.
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