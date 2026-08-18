"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Download, Eye, FileText, LayoutDashboard, Megaphone, Menu, Route, Settings, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard", active: true },
  { label: "Data Penduduk", icon: Users, href: "/data-penduduk", active: false },
  { label: "Administrasi", icon: FileText, href: "/layanan/surat", active: false },
  { label: "Peta Wilayah", icon: Route, href: "/peta", active: false },
  { label: "Pengaturan", icon: Settings, href: "/pengaturan", active: false },
] as const;

interface TimelineStep {
  title: string;
  desc: string;
  time: string;
  done?: boolean;
  active?: boolean;
  pending?: boolean;
}

const TIMELINE: TimelineStep[] = [
  {
    title: "Pengajuan Diterima",
    desc: "Berkas lengkap dan telah masuk sistem.",
    time: "12 Okt 2024, 09:00 WITA",
    done: true,
  },
  {
    title: "Verifikasi Dokumen",
    desc: "Pengecekan kesesuaian data oleh staf kelurahan.",
    time: "13 Okt 2024, 14:30 WITA",
    done: true,
  },
  {
    title: "Menunggu Tanda Tangan Lurah",
    desc: "Dokumen sedang dalam antrean pengesahan.",
    time: "Sedang diproses...",
    active: true,
  },
  {
    title: "Selesai & Siap Diambil",
    desc: "Dokumen dapat diunduh atau diambil di kantor kelurahan.",
    time: "",
    pending: true,
  },
] as const;

const HISTORY = [
  {
    name: "Surat Keterangan Domisili",
    reg: "#REG-2024-0012",
    date: "01 Sep 2024",
    status: "Selesai",
  },
  {
    name: "Surat Pengantar RT/RW",
    reg: "#REG-2024-0045",
    date: "15 Jul 2024",
    status: "Selesai",
  },
  {
    name: "Surat Keterangan Tidak Mampu",
    reg: "#REG-2024-0088",
    date: "10 Mei 2024",
    status: "Ditolak",
  },
] as const;

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

interface UserInfo {
  email?: string | null;
  nama_lengkap?: string | null;
  role?: string | null;
}

function UserBadge({ user }: { user: UserInfo | null }) {
  const initials = (user?.nama_lengkap?.trim() || user?.email || "?").trim().slice(0, 2).toUpperCase();
  return (
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md font-bold shrink-0 overflow-hidden">
        {initials || "AK"}
      </div>
      <div className="flex flex-col min-w-0">
        <span className="font-label-md text-label-md font-bold text-on-surface truncate">
          {user?.nama_lengkap || "Admin Kelurahan"}
        </span>
        <span className="font-label-sm text-label-sm text-on-surface-variant truncate">
          {user?.email || "Tiro Sompe"}
        </span>
      </div>
    </div>
  );
}

function SidebarContent({ user }: { user: UserInfo | null }) {
  return (
    <>
      <div className="p-6 border-b border-outline-variant flex items-center gap-4">
        <UserBadge user={user} />
      </div>

      <div className="flex flex-col py-4 gap-2 flex-grow overflow-y-auto">
        {NAV_ITEMS.map((item) => (
          <a
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
          </a>
        ))}
      </div>

      <div className="p-4 border-t border-outline-variant text-center">
        <span className="font-label-sm text-label-sm text-on-surface-variant">v1.0.2</span>
      </div>
    </>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState<UserInfo | null>(null);

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
        <SidebarContent user={user} />
      </nav>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <nav className="absolute left-0 top-0 h-full w-[280px] bg-surface flex flex-col shadow-xl">
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low z-10"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
            <SidebarContent user={user} />
          </nav>
        </div>
      )}

      {/* Main content */}
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
            <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full border border-surface" />
          </button>
        </header>

        {/* Scrollable content */}
        <div className="flex-grow overflow-y-auto p-margin-mobile md:p-margin-desktop bg-background">
          <div className="max-w-max-width mx-auto flex flex-col gap-8">
            {/* Page header */}
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-on-surface">Dashboard Warga</h1>
                <p className="font-body-md text-body-md text-on-surface-variant mt-2">
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left column */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                {/* Active application status */}
                <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-transparent rounded-bl-full pointer-events-none" />
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h2 className="font-headline-sm text-headline-sm text-on-surface">
                        Status Pengajuan Aktif
                      </h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                        Surat Keterangan Usaha (SKU)
                      </p>
                    </div>
                    <span className="bg-primary-container text-on-primary-container font-label-sm text-label-sm px-3 py-1 rounded-full">
                      No. Reg: 2024/SKU/089
                    </span>
                  </div>

                  {/* Timeline */}
                  <div className="relative pl-4 border-l-2 border-outline-variant space-y-8 mt-8">
                    {TIMELINE.map((step) => (
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
                          {step.desc && (
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                              {step.desc}
                            </p>
                          )}
                          {step.time && (
                            <span className="font-label-sm text-label-sm text-outline mt-2 block">
                              {step.time}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Application history */}
                <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="font-headline-sm text-headline-sm text-on-surface">Riwayat Pengajuan</h2>
                    <button
                      type="button"
                      onClick={() => router.push("/layanan/surat")}
                      className="font-label-md text-label-md text-primary hover:underline"
                    >
                      Ajukan Surat
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
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
                        {HISTORY.map((row) => (
                          <tr
                            key={row.reg}
                            className="border-b border-border-subtle hover:bg-surface-muted transition-colors"
                          >
                            <td className="py-4 pr-4">
                              <div className="font-medium">{row.name}</div>
                              <div className="text-outline font-code-md mt-1">{row.reg}</div>
                            </td>
                            <td className="py-4 px-4 text-on-surface-variant">{row.date}</td>
                            <td className="py-4 px-4">
                              {row.status === "Selesai" ? (
                                <span className="bg-[#dcfce7] text-success px-2 py-1 rounded-md font-label-sm text-label-sm">
                                  Selesai
                                </span>
                              ) : (
                                <span className="bg-error-container text-on-error-container px-2 py-1 rounded-md font-label-sm text-label-sm">
                                  Ditolak
                                </span>
                              )}
                            </td>
                            <td className="py-4 pl-4 text-right">
                              {row.status === "Selesai" ? (
                                <button
                                  type="button"
                                  onClick={() => router.push("/layanan/surat")}
                                  className="text-primary hover:text-primary-fixed-variant transition-colors"
                                  title="Unduh Dokumen"
                                  aria-label="Unduh Dokumen"
                                >
                                  <Download aria-hidden="true" className="w-5 h-5" />
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => router.push("/layanan/surat")}
                                  className="text-outline hover:text-on-surface transition-colors"
                                  title="Lihat Detail"
                                  aria-label="Lihat Detail"
                                >
                                  <Eye aria-hidden="true" className="w-5 h-5" />
                                </button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </div>

              {/* Right column: announcements */}
              <div className="flex flex-col gap-6">
                <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
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
            <footer className="relative w-full mt-12 border-t border-outline-variant py-8 grid grid-cols-1 md:grid-cols-2 gap-4 bg-surface-container-lowest">
              <div className="font-body-sm text-body-sm text-on-surface-variant">
                © 2024 Pemerintah Kelurahan Tiro Sompe. Seluruh Hak Cipta Dilindungi.
              </div>
              <div className="flex gap-4 flex-wrap md:justify-end font-body-sm text-body-sm text-on-surface-variant">
                <span className="hover:text-primary underline transition-opacity duration-150">Kontak Kami</span>
                <span className="hover:text-primary underline transition-opacity duration-150">Kebijakan Privasi</span>
                <span className="hover:text-primary underline transition-opacity duration-150">Portal Nasional</span>
                <span className="hover:text-primary underline transition-opacity duration-150">Peta Situs</span>
              </div>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}