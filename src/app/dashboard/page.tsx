"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Download,
  Eye,
  FileText,
  Megaphone,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppHeader from "@/components/app-header";
import BackButton from "@/components/back-button";
import dynamicImport from "next/dynamic";

// Panel admin (antrean setujui + data penduduk) dimuat lazy —
// hanya dipakai bila user login adalah staf kelurahan.
const AdminPanel = dynamicImport(() => import("@/components/admin/admin-panel"));

interface Riwayat {
  id: string;
  nomor_permohonan: string;
  jenis_surat: string;
  status: string;
  status_label: string;
  catatan_petugas: string | null;
  diajukan_at: string;
}

interface UserInfo {
  email?: string | null;
  nama_lengkap?: string | null;
  role?: string | null;
}

// Role yang dianggap staf kelurahan (sinkron src/lib/admin-auth.ts).
const STAFF_ROLES = ["super_admin", "lurah", "sekretaris", "petugas"];

// Urutan proses surat untuk timeline.
function langkahTimeline(status: string) {
  const dasar = [
    { title: "Pengajuan Diterima", desc: "Berkas lengkap dan telah masuk sistem." },
    { title: "Verifikasi Dokumen", desc: "Pengecekan kesesuaian data oleh staf kelurahan." },
    { title: "Persetujuan Lurah", desc: "Dokumen sedang dalam antrean pengesahan." },
    { title: "Selesai & Siap Diambil", desc: "Dokumen dapat diambil di kantor kelurahan." },
  ];
  // indeks langkah aktif berdasarkan status permohonan
  const aktifIdx =
    status === "menunggo_verifikasi" || status === "menunggu_verifikasi"
      ? 1
      : status === "dalam_proses"
        ? 2
        : status === "disetujui"
          ? 3
          : -1;
  return dasar.map((l, i) => ({
    ...l,
    done: aktifIdx < 0 || i < aktifIdx,
    active: i === aktifIdx,
    pending: aktifIdx >= 0 && i > aktifIdx,
  }));
}

const ANNOUNCEMENTS = [
  {
    tag: "INFO KELURAHAN",
    tagClass: "text-primary",
    date: "Hari ini",
    title: "Jadwal Pemadaman Listrik",
    desc: "Akan dilakukan pemeliharaan jaringan pada area RW 03 dan RW 04 mulai pukul 09.00 - 14.00 WITA.",
  },
  {
    tag: "LAYANAN KESEHATAN",
    tagClass: "text-info",
    date: "Kemarin",
    title: "Posyandu Balita Oktober",
    desc: "Kegiatan Posyandu Mawar akan dilaksanakan di Balai Pertemuan pada tanggal 15 Oktober 2024.",
  },
  {
    tag: "PERINGATAN DINI",
    tagClass: "text-warning",
    date: "10 Okt",
    title: "Waspada Genangan Air",
    desc: "Curah hujan tinggi diprediksi beberapa hari ke depan. Warga diharap membersihkan saluran air.",
  },
] as const;

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [riwayat, setRiwayat] = useState<Riwayat[]>([]);
  const [muatRiwayat, setMuatRiwayat] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null));

    fetch("/api/layanan/riwayat")
      .then((r) => r.json())
      .then((d) => setRiwayat(Array.isArray(d?.data) ? d.data : []))
      .catch(() => setRiwayat([]))
      .finally(() => setMuatRiwayat(false));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  // Permohonan aktif = yang belum final (belum disetujui/ditolak/selesai).
  const aktif = useMemo(
    () =>
      riwayat.find((r) =>
        ["menunggu_verifikasi", "dalam_proses", "perlu_revisi"].includes(r.status)
      ) ?? null,
    [riwayat]
  );

  const isStaff =
    !!user?.role && (STAFF_ROLES as string[]).includes(user.role);

  const fmtTanggal = (iso: string) => {
    try {
      return new Date(iso).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return iso;
    }
  };

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <AppHeader />

      {/* Content */}
      <main className="flex-grow pt-20 lg:pt-8 lg:pl-16 pb-16 md:px-margin-desktop bg-background px-safe">
        {isStaff ? (
          /* Staf kelurahan: dashboard terpadu — antrean persetujuan
             layanan surat + data penduduk dalam satu halaman. */
          <AdminPanel />
        ) : (
        <div className="max-w-max-width mx-auto flex flex-col gap-6 md:gap-8">
          {/* Page header */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <BackButton fallbackHref="/" className="mb-3 -ml-1 md:hidden" />
              <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">Dashboard Warga</h1>
              <p className="font-body-sm text-body-sm md:font-body-md md:text-body-md text-on-surface-variant mt-2">
                Pantau status pengajuan administrasi dan notifikasi terkini Anda.
              </p>
            </div>
            {user && (
              <button
                type="button"
                onClick={handleLogout}
                className="font-label-md text-label-md text-on-surface-variant hover:text-danger border border-outline-variant hover:border-danger px-4 py-2 rounded-full transition-colors"
              >
                Keluar
              </button>
            )}
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-6">
            {/* Left column */}
            <div className="lg:col-span-2 flex flex-col gap-5 md:gap-6">
              {/* Active application status */}
              <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 sm:p-6 relative">
                <div className="absolute top-0 right-0 w-40 h-40 sm:w-64 sm:h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
                {muatRiwayat ? (
                  <p className="font-body-md text-body-md text-on-surface-variant">Memuat status pengajuan...</p>
                ) : !aktif ? (
                  <div className="text-center py-6">
                    <FileText aria-hidden="true" className="w-10 h-10 text-outline mx-auto mb-3" />
                    <h2 className="font-headline-sm text-headline-sm text-on-surface mb-1">
                      Tidak ada pengajuan aktif
                    </h2>
                    <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">
                      Ajukan surat administrasi dan pantau prosesnya di sini.
                    </p>
                    <Link
                      href="/layanan/surat"
                      className="inline-block px-5 py-2.5 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-fixed-variant transition-colors"
                    >
                      Ajukan Surat
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="flex justify-between items-start mb-6 flex-wrap gap-2">
                      <div>
                        <h2 className="font-headline-sm text-headline-sm text-on-surface">
                          Status Pengajuan Aktif
                        </h2>
                        <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                          {aktif.jenis_surat}
                          {aktif.status === "perlu_revisi" && aktif.catatan_petugas
                            ? ` — ${aktif.catatan_petugas}`
                            : ""}
                        </p>
                      </div>
                      <span className="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-3 py-1 rounded-full">
                        No. Reg: {aktif.nomor_permohonan}
                      </span>
                    </div>

                    {aktif.status === "perlu_revisi" ? (
                      <div
                        role="alert"
                        className="bg-warning-container text-on-warning-container rounded-lg p-4 font-body-sm text-body-sm"
                      >
                        Permohonan perlu revisi{aktif.catatan_petugas ? `: ${aktif.catatan_petugas}` : "."}{" "}
                        Silakan ajukan ulang melalui halaman Layanan.
                      </div>
                    ) : (
                      /* Timeline */
                      <div className="relative pl-4 border-l-2 border-outline-variant space-y-8 mt-8">
                        {langkahTimeline(aktif.status).map((step) => (
                          <div key={step.title} className="relative">
                            <div
                              className={cn(
                                "absolute -left-[23px] top-0.5 w-4 h-4 rounded-full ring-4 ring-surface-container-lowest",
                                step.done
                                  ? "bg-success"
                                  : step.active
                                    ? "bg-primary ring-primary-container"
                                    : "bg-surface-variant"
                              )}
                            />
                            <div className={cn("ml-4", step.pending && "opacity-50")}>
                              <h3
                                className={cn(
                                  "font-label-md text-label-md",
                                  step.active ? "text-primary font-bold" : "text-on-surface"
                                )}
                              >
                                {step.title}
                              </h3>
                              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                                {step.desc}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </section>

              {/* Application history */}
              <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4 sm:mb-6 gap-2 flex-wrap">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface">Riwayat Pengajuan</h2>
                  <Link
                    href="/layanan/surat"
                    className="font-label-md text-label-md text-primary hover:underline"
                  >
                    Ajukan Surat
                  </Link>
                </div>
                {muatRiwayat ? (
                  <p className="font-body-md text-body-md text-on-surface-variant">Memuat riwayat...</p>
                ) : riwayat.length === 0 ? (
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Belum ada pengajuan surat.
                  </p>
                ) : (
                  <div className="overflow-x-auto -mx-1 px-1">
                    <table className="w-full text-left border-collapse min-w-[480px]">
                      <thead>
                        <tr className="border-b border-outline-variant">
                          <th className="font-label-sm text-label-sm text-on-surface-variant py-3 pr-4">
                            Jenis Surat
                          </th>
                          <th className="font-label-sm text-label-sm text-on-surface-variant py-3 px-4">
                            Tanggal
                          </th>
                          <th className="font-label-sm text-label-sm text-on-surface-variant py-3 px-4">
                            Status
                          </th>
                          <th className="font-label-sm text-label-sm text-on-surface-variant py-3 pl-4 text-right">
                            Aksi
                          </th>
                        </tr>
                      </thead>
                      <tbody className="font-body-sm text-body-sm text-on-surface">
                        {riwayat.map((row) => (
                          <tr
                            key={row.id}
                            onClick={() => router.push(`/dashboard/permohonan/${row.id}`)}
                            className="border-b border-border-subtle hover:bg-surface-muted transition-colors cursor-pointer"
                          >
                            <td className="py-4 pr-4">
                              <div className="font-medium">{row.jenis_surat}</div>
                              <div className="text-outline font-code-md mt-1">{row.nomor_permohonan}</div>
                              {row.status === "ditolak" && row.catatan_petugas && (
                                <div className="text-on-surface-variant font-code-sm mt-1">
                                  Alasan: {row.catatan_petugas}
                                </div>
                              )}
                            </td>
                            <td className="py-4 px-4 text-on-surface-variant whitespace-nowrap">
                              {fmtTanggal(row.diajukan_at)}
                            </td>
                            <td className="py-4 px-4">
                              {row.status === "selesai" || row.status === "disetujui" ? (
                                <span className="bg-[#dcfce7] text-success px-2 py-1 rounded-md font-label-sm text-label-sm whitespace-nowrap">
                                  {row.status_label}
                                </span>
                              ) : row.status === "ditolak" ? (
                                <span className="bg-error-container text-on-error-container px-2 py-1 rounded-md font-label-sm text-label-sm whitespace-nowrap">
                                  Ditolak
                                </span>
                              ) : (
                                <span className="bg-surface-muted text-on-surface-variant px-2 py-1 rounded-md font-label-sm text-label-sm whitespace-nowrap">
                                  {row.status_label}
                                </span>
                              )}
                            </td>
                            <td className="py-4 pl-4 text-right">
                              {row.status === "selesai" || row.status === "disetujui" ? (
                                <span
                                  className="inline-block text-primary hover:text-primary-fixed-variant transition-colors"
                                  title="Unduh Dokumen"
                                  aria-label="Unduh Dokumen"
                                >
                                  <Download aria-hidden="true" className="w-5 h-5" />
                                </span>
                              ) : (
                                <span
                                  className="inline-block text-outline hover:text-on-surface transition-colors"
                                  title="Lihat Detail"
                                  aria-label="Lihat Detail"
                                >
                                  <Eye aria-hidden="true" className="w-5 h-5" />
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>

            {/* Right column: announcements */}
            <div className="flex flex-col gap-5 md:gap-6">
              <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 sm:p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-4 sm:mb-6">
                  <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                    <Megaphone aria-hidden="true" className="w-5 h-5 text-primary" />
                    Pengumuman
                  </h2>
                </div>
                <div className="flex flex-col gap-4 flex-grow">
                  {ANNOUNCEMENTS.map((n) => (
                    <div key={n.title} className="p-4 bg-surface-muted rounded-lg border border-surface-variant">
                      <div className="flex justify-between items-start mb-2">
                        <span className={cn("font-label-sm text-label-sm font-bold", n.tagClass)}>
                          {n.tag}
                        </span>
                        <span className="font-label-sm text-label-sm text-outline">{n.date}</span>
                      </div>
                      <h3 className="font-label-md text-label-md text-on-surface mb-1">{n.title}</h3>
                      <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                        {n.desc}
                      </p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => router.push("/pengumuman")}
                  className="w-full mt-6 py-2 border border-outline-variant text-on-surface font-label-md text-label-md rounded-lg hover:bg-surface-container-low transition-colors"
                >
                  Lihat Semua Pengumuman
                </button>
              </section>
            </div>
          </div>

          {/* Footer */}
          <footer className="relative w-full mt-8 md:mt-12 border-t border-outline-variant py-6 md:py-8 grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 bg-surface-container-lowest rounded-xl px-4 sm:px-0">
            <div className="font-body-sm text-body-sm text-on-surface-variant">
              © 2024 Pemerintah Kelurahan Tiro Sompe. Seluruh Hak Cipta Dilindungi.
            </div>
            <div className="flex gap-x-4 gap-y-2 flex-wrap md:justify-end font-body-sm text-body-sm text-on-surface-variant">
              <span className="hover:text-primary underline transition-opacity duration-150">Kontak Kami</span>
              <span className="hover:text-primary underline transition-opacity duration-150">Kebijakan Privasi</span>
              <span className="hover:text-primary underline transition-opacity duration-150">Portal Nasional</span>
              <span className="hover:text-primary underline transition-opacity duration-150">Peta Situs</span>
            </div>
          </footer>
        </div>
        )}
      </main>
    </div>
  );
}
