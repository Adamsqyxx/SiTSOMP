"use client";

import { useEffect, useMemo, useState } from "react";
import {
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

export default function DataPendudukPage() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<Penduduk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
              Cari informasi kependudukan di wilayah Kelurahan Tiro Sompe.
            </p>
          </div>

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
          </div>
      </main>
    </div>
  );
}