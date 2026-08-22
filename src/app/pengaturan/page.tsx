"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
} from "lucide-react";
import AppHeader from "@/components/app-header";
import BackButton from "@/components/back-button";

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
      <AppHeader />

      {/* Content */}
      <main className="flex-grow pt-20 lg:pt-8 lg:pl-16 pb-16 px-margin-mobile md:px-margin-desktop bg-background">
        <div className="max-w-max-width mx-auto flex flex-col gap-6">
          <div>
              <BackButton fallbackHref="/profil" className="mb-3 -ml-1" />
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