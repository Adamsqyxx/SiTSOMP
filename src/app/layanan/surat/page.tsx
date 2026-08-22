"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  FileWarning,
  HandHeart,
  MapPin,
  Search,
  Store,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AppSidebar from "@/components/app-sidebar";

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

export default function LayananSuratPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("Semua");

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
    <div className="bg-background text-on-background min-h-screen flex flex-col md:pl-64 font-body-md antialiased">
      <AppSidebar />

      <main className="flex-1 pt-16 px-margin-mobile md:px-margin-desktop pb-8">
        <div className="max-w-max-width mx-auto">
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
        </div>
      </main>

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
