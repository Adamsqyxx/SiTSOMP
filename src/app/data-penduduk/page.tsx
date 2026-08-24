"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  ExternalLink,
  MapPin,
  Search,
  Users,
} from "lucide-react";
import AppHeader from "@/components/app-header";
import BackButton from "@/components/back-button";

interface Penduduk {
  nik: string;
  nama_lengkap: string;
  alamat: string;
}

interface StatistikBps {
  jumlah_penduduk: number;
  laki_laki: number;
  perempuan: number;
  rasio_jenis_kelamin: number;
  laju_pertumbuhan_persen: string;
  distribusi_persen_kcamatan: number;
  kepadatan_per_km2: number;
  luas_km2: number;
  tinggi_mdpl: number;
  jarak_ibukota_kecamatan_km: number;
  wilayah_pantai: boolean;
  rt: number;
  rw: number;
  proyeksi_tahunan: { tahun: number; jumlah: number }[];
  agama: Record<string, number>;
}

interface SumberData {
  publikasi: string;
  penerbit: string;
  url: string;
  catatan: string;
}

const AGAMA_LABELS: Record<string, string> = {
  islam: "Islam",
  protestan: "Kristen Protestan",
  katolik: "Katolik",
  hindu: "Hindu",
  budha: "Buddha",
  lainnya: "Lainnya",
};

const nf = new Intl.NumberFormat("id-ID");

export default function DataPendudukPage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Penduduk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Statistik BPS
  const [stat, setStat] = useState<StatistikBps | null>(null);
  const [sumber, setSumber] = useState<SumberData | null>(null);
  const [muatStat, setMuatStat] = useState(true);

  useEffect(() => {
    fetch("/api/penduduk")
      .then((r) => r.json())
      .then((d) => {
        if (!d?.data) throw new Error("format");
        setData(d.data);
        setError(null);
      })
      .catch(() => {
        setData([]);
        setError("Data penduduk belum tersedia.");
      })
      .finally(() => setLoading(false));

    fetch("/api/penduduk/statistik")
      .then((r) => r.json())
      .then((d) => {
        if (d?.data) {
          setStat(d.data);
          setSumber(d.sumber ?? null);
        }
      })
      .catch(() => {})
      .finally(() => setMuatStat(false));
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (p) =>
        p.nama_lengkap.toLowerCase().includes(q) ||
        p.nik.toLowerCase().includes(q) ||
        p.alamat.toLowerCase().includes(q)
    );
  }, [data, query]);

  const maxProyeksi = useMemo(
    () => Math.max(...(stat?.proyeksi_tahunan.map((p) => p.jumlah) ?? [1])),
    [stat]
  );

  const totalAgama = useMemo(
    () =>
      stat ? Object.values(stat.agama).reduce((a, b) => a + b, 0) : 0,
    [stat]
  );

  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <AppHeader />

      {/* Content */}
      <main className="flex-grow pt-20 lg:pt-8 lg:pl-16 pb-16 px-margin-mobile md:px-margin-desktop bg-background">
        <div className="max-w-max-width mx-auto flex flex-col gap-6">
          <div>
            <BackButton fallbackHref="/" className="mb-3 -ml-1" />
            <h1 className="font-headline-lg text-headline-lg text-on-surface">Data Penduduk</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-2">
              Statistik resmi dari BPS Kota Parepare dan informasi kependudukan
              Kelurahan Tiro Sompe.
            </p>
          </div>

          {/* ═══ Statistik BPS ═══ */}
          <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 md:p-6">
            <div className="flex items-center justify-between gap-3 flex-wrap mb-4">
              <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <BarChart3 aria-hidden="true" className="w-5 h-5 text-primary" />
                Statistik Penduduk Tiro Sompe
              </h2>
              {sumber && (
                <a
                  href={sumber.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-label-sm text-label-sm text-primary hover:underline"
                >
                  {sumber.penerbit}
                  <ExternalLink aria-hidden="true" className="w-3.5 h-3.5" />
                </a>
              )}
            </div>

            {muatStat ? (
              <p className="font-body-md text-body-md text-on-surface-variant">Memuat statistik...</p>
            ) : !stat ? (
              <p className="font-body-md text-body-md text-on-surface-variant">Statistik tidak tersedia.</p>
            ) : (
              <>
                {/* Kartu utama */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                  <div className="bg-surface-muted rounded-xl p-4">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Jumlah Penduduk</p>
                    <p className="font-headline-md text-headline-md font-bold text-on-surface mt-1">
                      {nf.format(stat.jumlah_penduduk)}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">jiwa</p>
                  </div>
                  <div className="bg-surface-muted rounded-xl p-4">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Laki-laki</p>
                    <p className="font-headline-md text-headline-md font-bold text-on-surface mt-1">
                      {nf.format(stat.laki_laki)}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">jiwa</p>
                  </div>
                  <div className="bg-surface-muted rounded-xl p-4">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Perempuan</p>
                    <p className="font-headline-md text-headline-md font-bold text-on-surface mt-1">
                      {nf.format(stat.perempuan)}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">jiwa</p>
                  </div>
                  <div className="bg-surface-muted rounded-xl p-4">
                    <p className="font-label-sm text-label-sm text-on-surface-variant">Kepadatan</p>
                    <p className="font-headline-md text-headline-md font-bold text-on-surface mt-1">
                      {nf.format(stat.kepadatan_per_km2)}
                    </p>
                    <p className="font-body-sm text-body-sm text-on-surface-variant">jiwa/km²</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  {/* Tren proyeksi penduduk (bar chart CSS) */}
                  <div className="bg-surface-muted rounded-xl p-4">
                    <h3 className="font-label-md text-label-md text-on-surface mb-3">
                      Perkembangan Jumlah Penduduk (Proyeksi BPS)
                    </h3>
                    <div className="flex items-end justify-between gap-3 h-40" role="img" aria-label="Grafik batang perkembangan jumlah penduduk 2015 sampai 2019">
                      {stat.proyeksi_tahunan.map((p) => (
                        <div key={p.tahun} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                          <span className="font-code-sm text-code-sm text-on-surface-variant">
                            {nf.format(p.jumlah)}
                          </span>
                          <div
                            className="w-full max-w-[48px] bg-primary/80 hover:bg-primary transition-colors rounded-t-md"
                            style={{ height: `${(p.jumlah / maxProyeksi) * 100}%` }}
                            title={`${p.tahun}: ${p.jumlah} jiwa`}
                          />
                          <span className="font-label-sm text-label-sm text-outline">{p.tahun}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Komposisi agama */}
                  <div className="bg-surface-muted rounded-xl p-4">
                    <h3 className="font-label-md text-label-md text-on-surface mb-3">
                      Penduduk Menurut Agama
                    </h3>
                    <ul className="space-y-2">
                      {Object.entries(stat.agama)
                        .filter(([, v]) => v > 0)
                        .sort((a, b) => b[1] - a[1])
                        .map(([k, v]) => (
                          <li key={k}>
                            <div className="flex justify-between font-body-sm text-body-sm text-on-surface">
                              <span>{AGAMA_LABELS[k] ?? k}</span>
                              <span className="text-on-surface-variant">
                                {nf.format(v)} ({((v / totalAgama) * 100).toFixed(1)}%)
                              </span>
                            </div>
                            <div className="h-1.5 bg-surface-container-low rounded-full mt-1 overflow-hidden">
                              <div
                                className="h-full bg-primary rounded-full"
                                style={{ width: `${(v / totalAgama) * 100}%` }}
                              />
                            </div>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                {/* Detail wilayah */}
                <dl className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-3 mt-5 pt-4 border-t border-outline-variant font-body-sm text-body-sm">
                  <div className="flex justify-between md:block">
                    <dt className="text-on-surface-variant">Luas Wilayah</dt>
                    <dd className="text-on-surface md:mt-0.5">{String(stat.luas_km2).replace(".", ",")} km²</dd>
                  </div>
                  <div className="flex justify-between md:block">
                    <dt className="text-on-surface-variant">Rasio Jenis Kelamin</dt>
                    <dd className="text-on-surface md:mt-0.5">{stat.rasio_jenis_kelamin}</dd>
                  </div>
                  <div className="flex justify-between md:block">
                    <dt className="text-on-surface-variant">Pertumbuhan</dt>
                    <dd className="text-on-surface md:mt-0.5">{stat.laju_pertumbuhan_persen}</dd>
                  </div>
                  <div className="flex justify-between md:block">
                    <dt className="text-on-surface-variant">RT / RW</dt>
                    <dd className="text-on-surface md:mt-0.5">{stat.rt} RT / {stat.rw} RW</dd>
                  </div>
                  <div className="flex justify-between md:block">
                    <dt className="text-on-surface-variant">Tinggi Wilayah</dt>
                    <dd className="text-on-surface md:mt-0.5">{String(stat.tinggi_mdpl).replace(".", ",")} mdpl</dd>
                  </div>
                  <div className="flex justify-between md:block">
                    <dt className="text-on-surface-variant">Wilayah</dt>
                    <dd className="text-on-surface md:mt-0.5 inline-flex items-center gap-1">
                      <MapPin aria-hidden="true" className="w-3.5 h-3.5 text-primary" />
                      {stat.wilayah_pantai ? "Pesisir pantai" : "Daratan"}
                    </dd>
                  </div>
                </dl>

                {sumber && (
                  <p className="font-label-sm text-label-sm text-outline mt-4">
                    Sumber: {sumber.penerbit}, “{sumber.publikasi}”. {sumber.catatan}
                  </p>
                )}
              </>
            )}
          </section>

          {/* ═══ Daftar penduduk (DB kelurahan) ═══ */}
          <section className="flex flex-col gap-4">
            <div className="relative max-w-md">
              <Search
                aria-hidden="true"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-5 h-5"
              />
              <input
                className="w-full pl-12 pr-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
                placeholder="Cari nama, NIK, atau alamat..."
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            {loading ? (
              <p className="font-body-md text-body-md text-on-surface-variant">Memuat data...</p>
            ) : error ? (
              <div
                role="status"
                className="bg-surface-container-low border border-outline-variant rounded-xl p-8 text-center"
              >
                <Users aria-hidden="true" className="w-10 h-10 text-outline mx-auto mb-3" />
                <p className="font-body-md text-body-md text-on-surface-variant">{error}</p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant">
                Tidak ada data yang cocok.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((p) => (
                  <div
                    key={p.nik}
                    className="bg-surface-container-lowest border border-border-subtle rounded-xl p-5 hover:border-primary transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-label-md font-bold shrink-0 overflow-hidden">
                        {p.nama_lengkap.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-label-md text-label-md text-on-surface font-semibold truncate">
                          {p.nama_lengkap}
                        </h3>
                        <span className="font-code-sm text-code-sm text-outline block truncate">
                          NIK {p.nik}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2 items-start text-on-surface-variant">
                      <MapPin aria-hidden="true" className="w-4 h-4 mt-0.5 shrink-0" />
                      <span className="font-body-sm text-body-sm">{p.alamat}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <p className="font-label-sm text-label-sm text-outline">
              {filtered.length} penduduk ditampilkan
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
