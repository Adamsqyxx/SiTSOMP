"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BadgeCheck,
  FileText,
  LogIn,
  Mail,
  Map,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import AppHeader from "@/components/app-header";
import BackButton from "@/components/back-button";

interface ProfileUser {
  id?: string;
  email?: string | null;
  nama_lengkap?: string | null;
  role?: string | null;
}

export default function ProfilPage() {
  const router = useRouter();
  const [user, setUser] = useState<ProfileUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        setUser(d.user ?? null);
      })
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  const initials = (user?.nama_lengkap?.trim() || user?.email || "?").slice(0, 2).toUpperCase();

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-grow pt-20 lg:pt-8 lg:pl-16 pb-16 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto w-full">
        {!ready ? (
          <div className="animate-pulse space-y-4 max-w-2xl">
            <BackButton className="mb-4" />
            <div className="h-10 w-48 rounded-full bg-surface-container-low" />
            <div className="h-72 rounded-xl bg-surface-container-low" />
          </div>
        ) : !user ? (
          /* Belum login → ajakan masuk */
          <div className="max-w-md mx-auto text-center bg-surface-container-lowest border border-border-subtle rounded-xl p-10 shadow-sm">
            <BackButton className="mb-6" />
            <div className="w-16 h-16 rounded-full bg-primary-container text-primary flex items-center justify-center mx-auto mb-5">
              <UserRound aria-hidden="true" className="w-8 h-8" />
            </div>
            <h1 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">
              Belum Masuk
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-8">
              Masuk untuk melihat dan mengelola profil akun Anda.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/login?next=/profil"
                className="flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-full font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors shadow-sm"
              >
                <LogIn aria-hidden="true" className="w-4 h-4" />
                Masuk ke Sistem
              </Link>
              <Link
                href="/register"
                className="flex items-center justify-center gap-2 border border-outline-variant text-on-surface-variant px-5 py-3 rounded-full font-label-md text-label-md hover:bg-surface-container-low transition-colors"
              >
                Daftar Akun Baru
              </Link>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto">
            {/* Page header */}
            <div className="mb-8">
              <BackButton className="mb-4" />
              <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">
                Profil Saya
              </h1>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Informasi akun dan identitas Anda yang terdaftar pada SiTSOMP.
              </p>
            </div>

            {/* Identity card */}
            <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 md:p-8 mb-6">
              <div className="flex flex-wrap items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-headline-md font-bold overflow-hidden shrink-0">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="font-headline-sm text-headline-sm text-on-surface truncate">
                    {user.nama_lengkap || "Akun SiTSOMP"}
                  </p>
                  <p className="font-body-md text-body-md text-on-surface-variant truncate">
                    {user.email}
                  </p>
                </div>
                <span className="ml-auto inline-flex items-center gap-1.5 bg-primary-container/40 text-on-primary-container font-label-sm text-label-sm px-3 py-1 rounded-full">
                  <BadgeCheck aria-hidden="true" className="w-4 h-4" />
                  {user.role === "admin" ? "Admin Kelurahan" : "Warga"}
                </span>
              </div>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div>
                  <dt className="font-label-sm text-label-sm text-on-surface-variant mb-1 flex items-center gap-1.5">
                    <UserRound aria-hidden="true" className="w-4 h-4" /> Nama Lengkap
                  </dt>
                  <dd className="font-body-md text-body-md text-on-surface">
                    {user.nama_lengkap || "—"}
                  </dd>
                </div>
                <div>
                  <dt className="font-label-sm text-label-sm text-on-surface-variant mb-1 flex items-center gap-1.5">
                    <Mail aria-hidden="true" className="w-4 h-4" /> Email
                  </dt>
                  <dd className="font-body-md text-body-md text-on-surface">{user.email || "—"}</dd>
                </div>
                <div>
                  <dt className="font-label-sm text-label-sm text-on-surface-variant mb-1 flex items-center gap-1.5">
                    <ShieldCheck aria-hidden="true" className="w-4 h-4" /> Peran
                  </dt>
                  <dd className="font-body-md text-body-md text-on-surface">
                    {user.role === "admin" ? "Admin Kelurahan" : "Warga"}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                  Layanan & Pengajuan
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                  Ajukan surat keterangan dan pantau status pengajuan Anda.
                </p>
                <Link
                  href="/layanan/surat"
                  className="flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-lg font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors"
                >
                  <FileText aria-hidden="true" className="w-4 h-4" />
                  Ke Layanan Surat
                </Link>
              </section>
              <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                  Peta Wilayah
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                  Jelajahi fasilitas, batas RT/RW, dan infrastruktur Tiro Sompe.
                </p>
                <Link
                  href="/peta"
                  className="flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-lg font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors"
                >
                  <Map aria-hidden="true" className="w-4 h-4" />
                  Buka Peta
                </Link>
              </section>
              <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                  Pengaturan Akun
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                  Kelola profil, preferensi, dan sesi login Anda.
                </p>
                <Link
                  href="/pengaturan"
                  className="flex items-center justify-center gap-2 bg-primary text-on-primary px-5 py-3 rounded-lg font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors"
                >
                  <ShieldCheck aria-hidden="true" className="w-4 h-4" />
                  Buka Pengaturan
                </Link>
              </section>
              <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6">
                <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">
                  Sesi
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                  Keluar dari akun pada perangkat ini.
                </p>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center gap-2 border border-danger text-danger px-5 py-3 rounded-lg font-label-md text-label-md hover:bg-error-container/30 transition-colors w-full"
                >
                  Keluar
                </button>
              </section>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest w-full mt-auto border-t border-outline-variant">
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