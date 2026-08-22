"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertCircle, Clock, MapPin } from "lucide-react";
import { Toaster } from "sonner";
import AppHeader from "@/components/app-header";
import ComplaintForm from "@/components/complaint-form";

const STATUS_LABEL: Record<string, { label: string; className: string }> = {
  baru: { label: "Baru", className: "bg-primary-container text-on-primary-container" },
  diproses: { label: "Diproses", className: "bg-warning-container text-on-warning-container" },
  eskalasi: { label: "Eskalasi", className: "bg-error-container text-on-error-container" },
  selesai: { label: "Selesai", className: "bg-success-container text-on-success-container" },
  ditutup: { label: "Ditutup", className: "bg-surface-variant text-on-surface-variant" },
};

const KATEGORI_LABEL: Record<string, string> = {
  infrastruktur: "Infrastruktur",
  sosial: "Sosial",
  keamanan: "Keamanan",
  administrasi: "Administrasi",
  lainnya: "Lainnya",
};

interface Complaint {
  id: string;
  nomor_tiket: string;
  kategori: string;
  judul: string;
  deskripsi: string;
  status: string;
  latitude?: number | null;
  longitude?: number | null;
  respons_petugas?: string | null;
  created_at: string;
}

function formatTanggal(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusBadge({ status }: { status: string }) {
  const cfg = STATUS_LABEL[status] ?? STATUS_LABEL.baru;
  return (
    <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

export default function PengaduanPage() {
  const [complaints, setComplaints] = useState<Complaint[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const loadComplaints = async () => {
    try {
      const res = await fetch("/api/pengaduan");
      if (res.status === 401) {
        setError("login");
        return;
      }
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Gagal memuat pengaduan.");
      setComplaints(data.data ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetch("/api/pengaduan")
      .then(async (res) => {
        if (cancelled) return;
        if (res.status === 401) {
          setError("login");
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Gagal memuat pengaduan.");
        setComplaints(data.data ?? []);
        setError(null);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : "Terjadi kesalahan.");
      })
      .finally(() => {
        if (!cancelled) setAuthLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="bg-background text-on-background font-body-md text-body-md min-h-screen flex flex-col">
      <AppHeader />

      <main className="w-full max-w-max-width mx-auto flex-grow pt-20 lg:pt-8 lg:pl-16 px-margin-mobile md:px-margin-desktop pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Left: form */}
          <section className="lg:col-span-3 bg-surface-container-lowest border border-border-subtle rounded-xl p-6 md:p-8">
            <h1 className="font-headline-lg text-headline-lg text-on-surface mb-1">
              Laporkan Masalah
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              Sampaikan permasalahan di lingkungan Anda (jalan rusak, lampu mati, dll) — tim
              kelurahan akan menindaklanjuti.
            </p>
            {error === "login" ? (
              <div className="bg-warning-container/50 border border-warning rounded-xl p-5 text-center">
                <AlertCircle aria-hidden="true" className="w-8 h-8 text-warning mx-auto mb-2" />
                <p className="font-label-md text-label-md text-on-surface">
                  Anda harus <strong>masuk</strong> terlebih dahulu untuk membuat pengaduan.
                </p>
                <div className="flex gap-3 justify-center mt-4">
                  <Link
                    href="/login?next=/pengaduan"
                    className="bg-primary text-on-primary px-5 py-2.5 rounded-full font-label-md text-label-md hover:bg-primary-fixed-variant transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    href="/register"
                    className="border border-outline-variant text-on-surface-variant px-5 py-2.5 rounded-full font-label-md text-label-md hover:bg-surface-container-low transition-colors"
                  >
                    Daftar
                  </Link>
                </div>
              </div>
            ) : (
              <ComplaintForm onSubmitted={loadComplaints} />
            )}
          </section>

          {/* Right: riwayat */}
          <section className="lg:col-span-2 flex flex-col gap-4">
            <h2 className="font-headline-md text-headline-md text-on-surface flex items-center gap-2">
              <Clock aria-hidden="true" className="w-5 h-5 text-primary" />
              Riwayat Pengaduan Saya
            </h2>

            {authLoading ? (
              <div className="animate-pulse flex flex-col gap-3">
                <div className="h-28 bg-surface-container-low rounded-xl" />
                <div className="h-28 bg-surface-container-low rounded-xl" />
              </div>
            ) : error === "login" ? (
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Masuk untuk melihat riwayat pengaduan Anda.
              </p>
            ) : error ? (
              <p className="font-body-sm text-body-sm text-danger">{error}</p>
            ) : complaints?.length === 0 ? (
              <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 text-center">
                <MapPin aria-hidden="true" className="w-8 h-8 text-outline mx-auto mb-2" />
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  Belum ada pengaduan. Buat laporan pertama Anda!
                </p>
              </div>
            ) : (
              complaints?.map((c) => (
                <article
                  key={c.id}
                  className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className="font-code-md text-code-md text-outline">{c.nomor_tiket}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <h3 className="font-label-md text-label-md font-bold text-on-surface">{c.judul}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-3">
                    {c.deskripsi}
                  </p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="font-label-sm text-label-sm text-on-surface-variant">
                      {KATEGORI_LABEL[c.kategori] ?? c.kategori}
                    </span>
                    <span className="font-label-sm text-label-sm text-outline">
                      {formatTanggal(c.created_at)}
                    </span>
                  </div>
                  {c.respons_petugas && (
                    <div className="bg-surface-muted rounded-lg p-3 mt-1 border border-surface-variant">
                      <p className="font-label-sm text-label-sm text-on-surface font-bold mb-1">
                        Respons petugas
                      </p>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        {c.respons_petugas}
                      </p>
                    </div>
                  )}
                </article>
              ))
            )}
          </section>
        </div>
      </main>

      <Toaster position="top-center" richColors />
    </div>
  );
}