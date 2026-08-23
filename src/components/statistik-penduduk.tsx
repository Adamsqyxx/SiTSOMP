"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Users } from "lucide-react";

type Statistik = {
  total: number;
  laki_laki: number;
  perempuan: number;
  kartu_keluarga: number;
};

const INITIAL: Statistik = { total: 0, laki_laki: 0, perempuan: 0, kartu_keluarga: 0 };

const fmt = new Intl.NumberFormat("id-ID");

// Kartu statistik penduduk di beranda. Data diambil realtime dari
// /api/penduduk/statistik; refresh otomatis tiap 30 detik + tombol manual.
export default function StatistikPenduduk() {
  const [data, setData] = useState<Statistik>(INITIAL);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/penduduk/statistik", { cache: "no-store" });
      if (!res.ok) throw new Error(String(res.status));
      const json = (await res.json()) as Statistik;
      setData({
        total: Number(json.total) || 0,
        laki_laki: Number(json.laki_laki) || 0,
        perempuan: Number(json.perempuan) || 0,
        kartu_keluarga: Number(json.kartu_keluarga) || 0,
      });
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const t = setInterval(load, 30_000);
    return () => clearInterval(t);
  }, [load]);

  return (
    <section aria-label="Statistik penduduk" className="mb-16">
      <div className="flex items-center justify-between mb-6 gap-4">
        <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
          Jumlah Penduduk Tiro Sompe
        </h3>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          aria-label="Perbarui data"
          className="flex items-center gap-1.5 text-on-surface-variant hover:text-primary transition-colors disabled:opacity-50 shrink-0"
        >
          <RefreshCw aria-hidden="true" className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          <span className="font-label-sm text-label-sm hidden sm:inline">Perbarui</span>
        </button>
      </div>

      {error && !loading ? (
        <div className="bg-surface rounded-xl p-6 border border-border-subtle text-center">
          <p className="font-body-md text-body-md text-on-surface-variant mb-3">
            Gagal memuat data statistik.
          </p>
          <button
            type="button"
            onClick={load}
            className="font-label-md text-label-md text-primary hover:underline"
          >
            Coba lagi
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total */}
          <div className="bg-primary-container/20 rounded-xl p-5 md:p-6 border border-border-subtle col-span-2 lg:col-span-1 flex flex-col justify-between min-h-[120px]">
            <div className="bg-primary/10 w-10 h-10 rounded-lg flex items-center justify-center mb-3 text-primary">
              <Users aria-hidden="true" className="w-5 h-5" />
            </div>
            <div>
              <p className="font-headline-md text-headline-md font-bold text-on-surface tabular-nums">
                {fmt.format(data.total)}
              </p>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                Total Penduduk{loading ? " …" : ""}
              </p>
            </div>
          </div>

          {/* Laki-laki */}
          <div className="bg-surface rounded-xl p-5 md:p-6 border border-border-subtle flex flex-col justify-between min-h-[120px]">
            <p className="font-label-md text-label-md text-on-surface-variant mb-3">Laki-laki</p>
            <p className="font-headline-md text-headline-md font-bold text-on-surface tabular-nums">
              {fmt.format(data.laki_laki)}
            </p>
          </div>

          {/* Perempuan */}
          <div className="bg-surface rounded-xl p-5 md:p-6 border border-border-subtle flex flex-col justify-between min-h-[120px]">
            <p className="font-label-md text-label-md text-on-surface-variant mb-3">Perempuan</p>
            <p className="font-headline-md text-headline-md font-bold text-on-surface tabular-nums">
              {fmt.format(data.perempuan)}
            </p>
          </div>

          {/* KK */}
          <div className="bg-surface rounded-xl p-5 md:p-6 border border-border-subtle flex flex-col justify-between min-h-[120px]">
            <p className="font-label-md text-label-md text-on-surface-variant mb-3">Kartu Keluarga</p>
            <p className="font-headline-md text-headline-md font-bold text-on-surface tabular-nums">
              {fmt.format(data.kartu_keluarga)}
            </p>
          </div>
        </div>
      )}

      <p className="font-label-sm text-label-sm text-outline mt-3">
        Data langsung dari basis data kelurahan, diperbarui otomatis setiap 30 detik.
      </p>
    </section>
  );
}
