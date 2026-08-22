"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  Download,
  FileText,
  Loader2,
  MapPin,
  Stamp,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/app-header";
import BackButton from "@/components/back-button";

interface Detail {
  id: string;
  nomor_permohonan: string;
  jenis_surat: string;
  kode_surat: string;
  estimasi_hari_proses: number | null;
  status: string;
  status_label: string;
  catatan_petugas: string | null;
  diajukan_at: string;
  diproses_at: string | null;
  selesai_at: string | null;
}

function fmtTanggal(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function DetailPermohonanPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [detail, setDetail] = useState<Detail | null>(null);
  const [gagal, setGagal] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/layanan/riwayat/${id}`)
      .then(async (r) => {
        const d = await r.json();
        if (!r.ok) throw new Error(d.error ?? "Gagal memuat.");
        setDetail(d.data);
      })
      .catch((e: Error) => setGagal(e.message));
  }, [id]);

  if (gagal) {
    return (
      <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-grow pt-20 lg:pt-8 lg:pl-16 pb-16 md:px-margin-desktop max-w-max-width mx-auto w-full px-safe">
          <div role="alert" className="bg-error-container text-on-error-container rounded-xl p-6">
            {gagal}
          </div>
        </main>
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
        <AppHeader />
        <main className="flex-grow pt-20 lg:pt-8 lg:pl-16 pb-16 px-safe">
          <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
            <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" /> Memuat detail...
          </p>
        </main>
      </div>
    );
  }

  const final = detail.status === "disetujui" || detail.status === "selesai";
  const ditolak = detail.status === "ditolak";
  const perluRevisi = detail.status === "perlu_revisi";

  // Timeline status — langkah "Pengajuan Diterima" selalu terlewati
  // (permohonan sudah masuk sistem sejak diajukan).
  const steps = [
    {
      title: "Pengajuan Diterima",
      desc: `Berkas diterima sistem pada ${fmtTanggal(detail.diajukan_at)}.`,
      icon: ClipboardCheck,
      state: "done" as const,
      at: detail.diajukan_at,
    },
    {
      title: "Verifikasi Dokumen",
      desc: "Pengecekan kesesuaian data oleh staf kelurahan.",
      icon: FileText,
      state: (detail.diproses_at || final ? "done" : ditolak || perluRevisi ? "done" : "active") as
        | "done"
        | "active"
        | "pending",
      at: detail.diproses_at,
    },
    {
      title: "Persetujuan Lurah",
      desc: "Pengesahan dokumen oleh pejabat berwenang.",
      icon: Stamp,
      state: (final ? "done" : perluRevisi ? "pending" : ditolak ? "pending" : "pending") as
        | "done"
        | "active"
        | "pending",
      at: null,
    },
    {
      title: "Selesai & Siap Diambil",
      desc: "Dokumen dapat diambil di kantor kelurahan.",
      icon: MapPin,
      state: (detail.status === "selesai" ? "done" : final ? "active" : "pending") as
        | "done"
        | "active"
        | "pending",
      at: detail.selesai_at,
    },
  ];

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <AppHeader />

      <main className="flex-grow pt-20 lg:pt-8 lg:pl-16 pb-16 md:px-margin-desktop max-w-3xl mx-auto w-full px-safe">
        <BackButton fallbackHref="/dashboard" className="mb-3 -ml-1" />

        {/* Kartu utama */}
        <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 sm:p-6 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <span
                className={cn(
                  "inline-block px-3 py-1 rounded-full font-label-sm text-label-sm mb-3",
                  final
                    ? "bg-[#dcfce7] text-success"
                    : ditolak
                      ? "bg-error-container text-on-error-container"
                      : "bg-primary-container/40 text-primary"
                )}
              >
                {detail.status_label}
              </span>
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile leading-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">
                {detail.jenis_surat}
              </h1>
              <p className="font-code-md text-code-md text-outline mt-2">
                {detail.nomor_permohonan}
              </p>
            </div>
            {final && (
              <button
                type="button"
                onClick={() => router.push("/layanan/surat")}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-fixed-variant"
              >
                <Download aria-hidden="true" className="w-4 h-4" /> Unduh Dokumen
              </button>
            )}
          </div>

          {perluRevisi && detail.catatan_petugas && (
            <div role="alert" className="mt-4 bg-warning-container text-on-warning-container rounded-lg p-4 font-body-sm text-body-sm">
              Permohonan perlu revisi: {detail.catatan_petugas}. Silakan ajukan ulang melalui halaman{" "}
              <Link href="/layanan/surat" className="underline font-medium">Layanan Surat</Link>.
            </div>
          )}
          {ditolak && detail.catatan_petugas && (
            <div role="alert" className="mt-4 bg-error-container text-on-error-container rounded-lg p-4 font-body-sm text-body-sm">
              Permohonan ditolak. Alasan: {detail.catatan_petugas}
            </div>
          )}
        </section>

        {/* Riwayat proses */}
        <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 sm:p-6">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-5">
            Riwayat Proses
          </h2>
          <ol className="relative border-l-2 border-outline-variant space-y-7 ml-2">
            {steps.map((s) => (
              <li key={s.title} className="relative pl-6">
                <span
                  className={cn(
                    "absolute -left-[15px] top-0 w-7 h-7 rounded-full flex items-center justify-center ring-4 ring-surface-container-lowest",
                    s.state === "done"
                      ? "bg-success text-white"
                      : s.state === "active"
                        ? "bg-primary text-on-primary ring-primary-container"
                        : "bg-surface-variant text-outline"
                  )}
                >
                  {s.state === "done" ? (
                    <CheckCircle2 aria-hidden="true" className="w-4 h-4" />
                  ) : s.state === "active" ? (
                    <Clock aria-hidden="true" className="w-4 h-4 animate-pulse" />
                  ) : (
                    <s.icon aria-hidden="true" className="w-4 h-4" />
                  )}
                </span>
                <div className={cn("ml-1", s.state === "pending" && "opacity-50")}>
                  <h3
                    className={cn(
                      "font-label-md text-label-md",
                      s.state === "active" ? "text-primary font-bold" : "text-on-surface"
                    )}
                  >
                    {s.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{s.desc}</p>
                  {s.at && (
                    <p className="font-label-sm text-label-sm text-outline mt-1">
                      {fmtTanggal(s.at)}
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>

          {detail.estimasi_hari_proses != null && !final && !ditolak && (
            <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-muted rounded-lg p-3 mt-6">
              Estimasi waktu proses: {detail.estimasi_hari_proses} hari kerja.
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
