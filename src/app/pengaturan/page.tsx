"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LogOut,
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

export default function PengaturanPage() {
  const router = useRouter();
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
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      {/* TopAppBar — pola header publik SiTSOMP */}
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

      {/* Content */}
      <main className="flex-grow pt-16 md:pt-24 pb-16 px-margin-mobile md:px-margin-desktop bg-background">
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
      </main>
    </div>
  );
}