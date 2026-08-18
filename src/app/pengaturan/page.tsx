"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Bell,
  FileText,
  LayoutDashboard,
  LogOut,
  Menu,
  Route,
  Settings,
  Users,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: false },
  { label: "Data Penduduk", icon: Users, href: "/data-penduduk", active: false },
  { label: "Administrasi", icon: FileText, href: "/layanan/surat", active: false },
  { label: "Peta Wilayah", icon: Route, href: "/peta", active: false },
  { label: "Pengaturan", icon: Settings, href: "/pengaturan", active: true },
] as const;

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

export default function PengaturanPage() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<{ email?: string | null; nama_lengkap?: string | null } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

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
              <h1 className="font-headline-lg text-headline-lg text-on-surface">Pengaturan</h1>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2">
                Kelola profil dan preferensi akun Anda.
              </p>
            </div>

            <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">Profil Akun</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                Informasi ini digunakan pada pengajuan surat dan notifikasi.
              </p>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md font-bold overflow-hidden">
                  {(user?.nama_lengkap || user?.email || "AK").slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-label-md text-label-md text-on-surface truncate">
                    {user?.nama_lengkap || "Belum masuk"}
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {user?.email || "Silakan masuk untuk melihat profil"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-1.5">
                  <label className="block font-label-md text-label-md text-on-surface" htmlFor="nama">
                    Nama Lengkap
                  </label>
                  <input
                    id="nama"
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    defaultValue={user?.nama_lengkap ?? ""}
                    placeholder="Nama sesuai KTP"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block font-label-md text-label-md text-on-surface" htmlFor="telepon">
                    Nomor Telepon / WhatsApp
                  </label>
                  <input
                    id="telepon"
                    className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                    placeholder="08xxxxxxxxxx"
                  />
                </div>
              </div>

              <button
                type="button"
                className="px-6 py-3 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-fixed-variant transition-colors"
              >
                Simpan Perubahan
              </button>
            </section>

            <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6">
              <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">Sesi</h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                Keluar dari akun pada perangkat ini.
              </p>
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-2 px-6 py-3 border border-danger text-danger font-label-md text-label-md rounded-lg hover:bg-error-container/30 transition-colors"
              >
                <LogOut aria-hidden="true" className="w-4 h-4" /> Keluar
              </button>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}