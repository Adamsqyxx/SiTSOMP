"use client";

import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";

// Pemilih wilayah berantai khusus Kel. Tiro Sompe:
// Kota Parepare → Kec. Bacukiki Barat → Kel. Tiro Sompe → RW → RT.
// Daftar RW/RT dimuat dari DB (data resmi KPU/BPS, di-seed lewat seed-wilayah.ts).

interface WilayahResponse {
  id: string;
  nomor_rw: string;
  rt_list: { id: string; nomor_rt: string }[];
}

export interface WilayahSelection {
  kota: string;
  kecamatan: string;
  kelurahan: string;
  rw: string;
  rt: string;
}

const WILAYAH_ATAS = {
  kota: "Kota Parepare",
  kecamatan: "Kecamatan Bacukiki Barat",
  kelurahan: "Kelurahan Tiro Sompe",
};

interface Props {
  value: WilayahSelection;
  onChange: (v: WilayahSelection) => void;
}

const selectCls =
  "w-full bg-surface border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors disabled:opacity-50";

export default function PemilihWilayah({ value, onChange }: Props) {
  const [wilayah, setWilayah] = useState<WilayahResponse[]>([]);
  const [muat, setMuat] = useState(true);

  useEffect(() => {
    fetch("/api/wilayah")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setWilayah(d?.data ?? []))
      .catch(() => {})
      .finally(() => setMuat(false));
  }, []);

  const rtTersedia = useMemo(
    () => wilayah.find((w) => w.nomor_rw === value.rw)?.rt_list ?? [],
    [wilayah, value.rw]
  );

  const ringkasan =
    value.rt && value.rw
      ? `RT ${value.rt} / RW ${value.rw}, ${WILAYAH_ATAS.kelurahan}, ${WILAYAH_ATAS.kecamatan}, ${WILAYAH_ATAS.kota}`
      : "";

  return (
    <div className="space-y-2">
      {/* Kota — tetap (satu-satunya wilayah layanan) */}
      <div>
        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
          Kota
        </label>
        <select
          className={selectCls}
          value={WILAYAH_ATAS.kota}
          onChange={() => {}}
          aria-label="Kota"
        >
          <option>{WILAYAH_ATAS.kota}</option>
        </select>
      </div>

      {/* Kecamatan — tetap */}
      <div>
        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
          Kecamatan
        </label>
        <select
          className={selectCls}
          value={WILAYAH_ATAS.kecamatan}
          onChange={() => {}}
          aria-label="Kecamatan"
        >
          <option>{WILAYAH_ATAS.kecamatan}</option>
        </select>
      </div>

      {/* Kelurahan — tetap */}
      <div>
        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
          Kelurahan
        </label>
        <select
          className={selectCls}
          value={WILAYAH_ATAS.kelurahan}
          onChange={() => {}}
          aria-label="Kelurahan"
        >
          <option>{WILAYAH_ATAS.kelurahan}</option>
        </select>
      </div>

      {/* RW — dari DB */}
      <div>
        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
          RW {muat ? "(memuat…)" : ""}
        </label>
        <select
          className={selectCls}
          value={value.rw}
          onChange={(e) => onChange({ ...value, rw: e.target.value, rt: "" })}
          aria-label="RW"
          disabled={muat || wilayah.length === 0}
        >
          <option value="">Pilih RW…</option>
          {wilayah.map((w) => (
            <option key={w.id} value={w.nomor_rw}>
              RW {w.nomor_rw}
            </option>
          ))}
        </select>
      </div>

      {/* RT — bergantung RW */}
      <div>
        <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
          RT
        </label>
        <select
          className={selectCls}
          value={value.rt}
          onChange={(e) => onChange({ ...value, rt: e.target.value })}
          aria-label="RT"
          disabled={!value.rw || rtTersedia.length === 0}
        >
          <option value="">Pilih RT…</option>
          {rtTersedia.map((rt) => (
            <option key={rt.id} value={rt.nomor_rt}>
              RT {rt.nomor_rt}
            </option>
          ))}
        </select>
      </div>

      {ringkasan && (
        <p className="flex items-start gap-1.5 font-body-sm text-body-sm text-on-surface-variant pt-1">
          <MapPin aria-hidden="true" className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          {ringkasan}
        </p>
      )}
    </div>
  );
}
