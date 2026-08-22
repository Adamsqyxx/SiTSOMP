"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  FileSpreadsheet,
  FileText,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  Users,
  X,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import dynamicImport from "next/dynamic";

// Editor konten statis (kontak/kebijakan/peta situs) dimuat lazy —
// hanya saat tab Konten dibuka.
const KontenEditor = dynamicImport(
  () => import("@/components/admin/konten-editor")
);

// ── Konstanta tampilan ────────────────────────────────────────────────
const FORMAT_DITERIMA = [".xlsx", ".xlsm", ".csv", ".ods", ".xlsb"];
const PESAN_FORMAT_SALAH =
  "Format file tidak sesuai. Hanya file .xlsx, .xlsm, .csv, .ods, atau .xlsb yang dapat diupload.";

type Tab = "layanan" | "penduduk" | "konten";

const STATUS_FILTERS = [
  { key: "", label: "Semua" },
  { key: "menunggu_verifikasi", label: "Menunggu Verifikasi" },
  { key: "dalam_proses", label: "Dalam Proses" },
  { key: "perlu_revisi", label: "Perlu Revisi" },
  { key: "disetujui", label: "Disetujui" },
  { key: "ditolak", label: "Ditolak" },
  { key: "selesai", label: "Selesai" },
] as const;

function badgeStatus(status: string) {
  switch (status) {
    case "disetujui":
      return "bg-[#dcfce7] text-success";
    case "selesai":
      return "bg-primary-container text-on-primary-container";
    case "ditolak":
      return "bg-error-container text-on-error-container";
    case "perlu_revisi":
      return "bg-warning-container text-on-warning-container";
    case "dalam_proses":
      return "bg-secondary-container text-on-secondary-container";
    default:
      return "bg-surface-muted text-on-surface-variant";
  }
}

function fmtTanggal(iso?: string | null) {
  if (!iso) return "-";
  try {
    return new Date(iso).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

// ── Tipe data ─────────────────────────────────────────────────────────
interface Permohonan {
  id: string;
  nomor_permohonan: string;
  jenis_surat: string;
  kode_surat: string;
  nama_pemohon: string;
  nik_pemohon: string | null;
  form_data: Record<string, unknown> | null;
  catatan_petugas: string | null;
  status: string;
  status_label: string;
  selesai_at?: string | null;
  diajukan_at: string;
}

interface PendudukRow {
  id: string;
  nik: string;
  nama_lengkap: string;
  nomor_kk: string | null;
  alamat: string;
  tempat_lahir: string | null;
  tanggal_lahir: string | null;
  jenis_kelamin: string | null;
  agama: string | null;
  pekerjaan: string | null;
  pendidikan_terakhir: string | null;
  status_perkawinan: string | null;
  status_dalam_kk: string | null;
  status_penduduk: string;
}

interface ImportHasil {
  message: string;
  baris_baru: number;
  baris_update: number;
  baris_gagal: number;
  total_baris: number;
  errors: string[];
}

const KOSONG_FORM = {
  nik: "",
  nama_lengkap: "",
  nomor_kk: "",
  alamat: "",
  tempat_lahir: "",
  tanggal_lahir: "",
  jenis_kelamin: "",
  agama: "",
  pekerjaan: "",
  pendidikan_terakhir: "",
  status_perkawinan: "",
  status_dalam_kk: "",
};

export default function AdminPanel() {
  const [tab, setTab] = useState<Tab>("layanan");

  // ── State layanan surat ──
  const [permohonan, setPermohonan] = useState<Permohonan[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [filter, setFilter] = useState("");
  const [muatLayanan, setMuatLayanan] = useState(true);
  const [expandId, setExpandId] = useState<string | null>(null);
  const [catatan, setCatatan] = useState("");
  const [aksiBerjalan, setAksiBerjalan] = useState(false);

  const muatLayananSurat = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/admin/layanan${filter ? `?status=${filter}` : ""}`
      );
      const d = await res.json();
      if (res.ok) {
        setPermohonan(d.data ?? []);
        setCounts(d.counts ?? {});
      }
    } finally {
      setMuatLayanan(false);
    }
  }, [filter]);

  useEffect(() => {
    muatLayananSurat();
  }, [muatLayananSurat]);

  const jalankanAksi = async (id: string, aksi: string) => {
    setAksiBerjalan(true);
    try {
      const res = await fetch("/api/admin/layanan", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, aksi, catatan }),
      });
      const d = await res.json();
      if (!res.ok) {
        alert(d.error ?? "Gagal memperbarui permohonan.");
        return;
      }
      setCatatan("");
      setExpandId(null);
      muatLayananSurat();
    } finally {
      setAksiBerjalan(false);
    }
  };

  // ── State data penduduk ──
  const [penduduk, setPenduduk] = useState<PendudukRow[]>([]);
  const [qPenduduk, setQPenduduk] = useState("");
  const [muatPenduduk, setMuatPenduduk] = useState(false);
  const [formBuka, setFormBuka] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...KOSONG_FORM });
  const [formError, setFormError] = useState("");
  const [simpanBerjalan, setSimpanBerjalan] = useState(false);

  const muatPendudukData = useCallback(async (cari?: string) => {
    try {
      const res = await fetch(
        `/api/admin/penduduk${cari ? `?q=${encodeURIComponent(cari)}` : ""}`
      );
      const d = await res.json();
      if (res.ok) setPenduduk(d.data ?? []);
    } finally {
      setMuatPenduduk(false);
    }
  }, []);

  // Muat daftar penduduk hanya saat tab-nya dibuka.
  useEffect(() => {
    if (tab === "penduduk") muatPendudukData(qPenduduk);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  const bukaTambah = () => {
    setEditId(null);
    setForm({ ...KOSONG_FORM });
    setFormError("");
    setFormBuka(true);
  };

  const bukaEdit = (p: PendudukRow) => {
    setEditId(p.id);
    setForm({
      nik: p.nik,
      nama_lengkap: p.nama_lengkap,
      nomor_kk: p.nomor_kk ?? "",
      alamat: p.alamat ?? "",
      tempat_lahir: p.tempat_lahir ?? "",
      tanggal_lahir: p.tanggal_lahir ?? "",
      jenis_kelamin: p.jenis_kelamin ?? "",
      agama: p.agama ?? "",
      pekerjaan: p.pekerjaan ?? "",
      pendidikan_terakhir: p.pendidikan_terakhir ?? "",
      status_perkawinan: p.status_perkawinan ?? "",
      status_dalam_kk: p.status_dalam_kk ?? "",
    });
    setFormError("");
    setFormBuka(true);
  };

  const simpanPenduduk = async () => {
    setFormError("");
    setSimpanBerjalan(true);
    try {
      const res = await fetch("/api/admin/penduduk", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId ? { id: editId, ...form } : form),
      });
      const d = await res.json();
      if (!res.ok) {
        setFormError(d.error ?? "Gagal menyimpan data.");
        return;
      }
      setFormBuka(false);
      muatPendudukData(qPenduduk);
    } finally {
      setSimpanBerjalan(false);
    }
  };

  const hapusPenduduk = async (p: PendudukRow) => {
    if (
      !window.confirm(
        `Hapus penduduk ${p.nama_lengkap} (NIK ${p.nik})? Tindakan ini permanen.`
      )
    )
      return;
    const res = await fetch(`/api/admin/penduduk?id=${encodeURIComponent(p.id)}`, {
      method: "DELETE",
    });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      alert(d.error ?? "Gagal menghapus data.");
      return;
    }
    muatPendudukData(qPenduduk);
  };

  // ── State import file ──
  const [file, setFile] = useState<File | null>(null);
  const [importError, setImportError] = useState("");
  const [importHasil, setImportHasil] = useState<ImportHasil | null>(null);
  const [importBerjalan, setImportBerjalan] = useState(false);

  const pilihFile = (f: File | null) => {
    setFile(null);
    setImportError("");
    setImportHasil(null);
    if (!f) return;
    const ext = `.${f.name.toLowerCase().split(".").pop() ?? ""}`;
    if (!FORMAT_DITERIMA.includes(ext)) {
      setImportError(PESAN_FORMAT_SALAH);
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setImportError("Ukuran file melebihi 10 MB.");
      return;
    }
    setFile(f);
  };

  const kirimImport = async () => {
    if (!file || importBerjalan) return;
    setImportBerjalan(true);
    setImportError("");
    setImportHasil(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/penduduk/import", {
        method: "POST",
        body: fd,
      });
      const d = await res.json();
      if (!res.ok) {
        setImportError(d.error ?? "Gagal memproses file.");
        return;
      }
      setImportHasil(d);
      setFile(null);
      const el = document.getElementById("input-file-penduduk") as HTMLInputElement | null;
      if (el) el.value = "";
      muatPendudukData(qPenduduk);
    } catch {
      setImportError("Terjadi kesalahan jaringan saat mengupload.");
    } finally {
      setImportBerjalan(false);
    }
  };

  const jumlahFilter = useMemo(() => {
    const c = counts ?? {};
    return (key: string) =>
      key === "" ? (c.total ?? 0) : (c[key] ?? 0);
  }, [counts]);

  return (
    <>
      <div className="mx-auto flex w-full max-w-max-width flex-col gap-5 md:gap-6">
        <div>
          <h1 className="font-headline-lg-mobile text-headline-lg-mobile md:font-headline-lg md:text-headline-lg text-on-surface">
            Dashboard Admin
          </h1>
          <p className="font-body-sm text-body-sm md:font-body-md md:text-body-md text-on-surface-variant mt-1">
            Kelola persetujuan layanan surat dan data penduduk Kelurahan Tiro Sompe.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-outline-variant">
          <button
            type="button"
            onClick={() => setTab("layanan")}
            className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-label-md text-label-md border-b-2 -mb-px transition-colors",
              tab === "layanan"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            )}
          >
            <ClipboardList aria-hidden="true" className="w-4 h-4" />
            Layanan Surat
            {(counts.menunggu_verifikasi ?? 0) > 0 && (
              <span className="bg-error text-on-error rounded-full px-2 py-0.5 font-code-sm">
                {counts.menunggu_verifikasi}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setTab("penduduk")}
            className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-label-md text-label-md border-b-2 -mb-px transition-colors",
              tab === "penduduk"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            )}
          >
            <Users aria-hidden="true" className="w-4 h-4" />
            Data Penduduk
          </button>
          <button
            type="button"
            onClick={() => setTab("konten")}
            className={cn(
              "flex items-center gap-2 px-3 sm:px-4 py-2.5 sm:py-3 font-label-md text-label-md border-b-2 -mb-px transition-colors",
              tab === "konten"
                ? "border-primary text-primary font-semibold"
                : "border-transparent text-on-surface-variant hover:text-on-surface"
            )}
          >
            <FileText aria-hidden="true" className="w-4 h-4" />
            Konten
          </button>
        </div>

        {/* ══════════ TAB LAYANAN SURAT ══════════ */}
        {tab === "layanan" && (
          <section className="flex flex-col gap-4">
            {/* Filter status */}
            <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
              {STATUS_FILTERS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFilter(f.key)}
                  className={cn(
                    "shrink-0 px-3 py-1.5 rounded-full border font-label-sm text-label-sm transition-colors",
                    filter === f.key
                      ? "bg-primary text-on-primary border-primary"
                      : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                  )}
                >
                  {f.label} ({jumlahFilter(f.key)})
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMuatLayanan(true);
                  muatLayananSurat();
                }}
                title="Muat ulang"
                className="shrink-0 px-3 py-1.5 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
              >
                <RefreshCw aria-hidden="true" className={cn("w-4 h-4", muatLayanan && "animate-spin")} />
              </button>
            </div>

            {muatLayanan ? (
              <p className="font-body-md text-body-md text-on-surface-variant">Memuat permohonan...</p>
            ) : permohonan.length === 0 ? (
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-10 text-center">
                <FileText aria-hidden="true" className="w-10 h-10 text-outline mx-auto mb-3" />
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Tidak ada permohonan pada filter ini.
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {permohonan.map((m) => {
                  const terbuka = expandId === m.id;
                  return (
                    <article
                      key={m.id}
                      className="bg-surface-container-lowest border border-border-subtle rounded-xl overflow-hidden"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setExpandId(terbuka ? null : m.id);
                          setCatatan(m.catatan_petugas ?? "");
                        }}
                        className="w-full text-left p-4 md:p-5 flex flex-wrap items-start justify-between gap-3 hover:bg-surface-container-low transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-label-md text-label-md sm:font-label-lg sm:text-label-lg text-on-surface font-semibold">
                              {m.jenis_surat}
                            </h3>
                            <span className={cn("px-2 py-0.5 rounded-full font-label-sm text-label-sm", badgeStatus(m.status))}>
                              {m.status_label}
                            </span>
                          </div>
                          <p className="font-code-sm text-code-sm text-outline mt-1 break-all">{m.nomor_permohonan}</p>
                          <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 break-words">
                            Pemohon: <span className="text-on-surface">{m.nama_pemohon}</span>
                            {m.nik_pemohon ? ` · NIK ${m.nik_pemohon}` : ""}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="font-label-sm text-label-sm text-outline flex items-center gap-1 justify-end whitespace-nowrap">
                            <Clock aria-hidden="true" className="w-3.5 h-3.5" />
                            {fmtTanggal(m.diajukan_at)}
                          </p>
                        </div>
                      </button>

                      {terbuka && (
                        <div className="border-t border-border-subtle p-4 md:p-5 bg-surface flex flex-col gap-4">
                          {/* Detail formulir pemohon */}
                          <div>
                            <h4 className="font-label-md text-label-md text-on-surface mb-2">Detail Pengajuan</h4>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                              {m.form_data &&
                                Object.entries(m.form_data)
                                  .filter(([k]) => !k.startsWith("_") && k !== "lampiran")
                                  .map(([k, v]) => (
                                    <div key={k} className="flex flex-col sm:flex-row sm:gap-2 text-body-sm font-body-sm">
                                      <dt className="text-on-surface-variant capitalize sm:min-w-[120px] shrink-0">
                                        {k.replace(/_/g, " ")}:
                                      </dt>
                                      <dd className="text-on-surface break-words min-w-0">{String(v ?? "-")}</dd>
                                    </div>
                                  ))}
                              {!m.form_data && (
                                <dd className="font-body-sm text-body-sm text-on-surface-variant">
                                  (tidak ada data formulir)
                                </dd>
                              )}
                            </dl>
                          </div>

                          {/* Lampiran (scan/foto persyaratan) */}
                          {Array.isArray(m.form_data?.lampiran) &&
                            (m.form_data.lampiran as unknown[]).length > 0 && (
                            <div>
                              <h4 className="font-label-md text-label-md text-on-surface mb-2">
                                Lampiran Persyaratan
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                {(m.form_data.lampiran as unknown[])
                                    .filter((item): item is { label?: string; url: string } => {
                                      const l = item as { label?: string; url?: string } | null;
                                      return !!l && typeof l.url === "string";
                                    })
                                    .map((l, i) => {
                                      const isPdf = l.url.toLowerCase().endsWith(".pdf");
                                      return (
                                      <a
                                        key={`${l.url}-${i}`}
                                        href={l.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group block bg-surface-container-low border border-outline-variant rounded-lg overflow-hidden hover:border-primary transition-colors"
                                      >
                                        <div className="aspect-square w-full bg-surface flex items-center justify-center overflow-hidden">
                                          {isPdf ? (
                                            <span className="flex flex-col items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                                              <FileText aria-hidden="true" className="w-8 h-8" />
                                              PDF
                                            </span>
                                          ) : (
                                            // eslint-disable-next-line @next/next/no-img-element
                                            <img
                                              src={l.url}
                                              alt={l.label ?? `Lampiran ${i + 1}`}
                                              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                                              loading="lazy"
                                            />
                                          )}
                                        </div>
                                        <p className="px-2 py-1.5 font-label-sm text-label-sm text-on-surface truncate">
                                          {l.label ?? `Lampiran ${i + 1}`}
                                        </p>
                                      </a>
                                      );
                                    })}
                              </div>
                            </div>
                          )}

                          {m.catatan_petugas && (
                            <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-muted rounded-lg p-3">
                              Catatan sebelumnya: {m.catatan_petugas}
                            </p>
                          )}

                          {/* Aksi — terkunci setelah permohonan difinalisasi */}
                          {m.selesai_at ? (
                            <p className="font-body-sm text-body-sm text-on-surface-variant bg-surface-muted rounded-lg p-3 flex items-center gap-2">
                              <CheckCircle2 aria-hidden="true" className="w-4 h-4 shrink-0" />
                              Permohonan sudah selesai pada{" "}
                              {fmtTanggal(m.selesai_at)} — keputusan terkunci
                              dan tidak dapat diubah lagi.
                            </p>
                          ) : (
                            <div className="flex flex-col gap-3">
                            <textarea
                              value={catatan}
                              onChange={(e) => setCatatan(e.target.value)}
                              placeholder="Catatan untuk pemohon (opsional, wajib untuk revisi)..."
                              rows={2}
                              className="w-full px-4 py-3 bg-surface-container-lowest border border-outline-variant rounded-lg text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y"
                            />
                            <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={aksiBerjalan}
                                onClick={() => jalankanAksi(m.id, "setujui")}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg bg-success text-white font-label-md text-label-md disabled:opacity-60"
                              >
                                <CheckCircle2 aria-hidden="true" className="w-4 h-4" /> Setujui
                              </button>
                              <button
                                type="button"
                                disabled={aksiBerjalan}
                                onClick={() => jalankanAksi(m.id, "tolak")}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg bg-error text-on-error font-label-md text-label-md disabled:opacity-60"
                              >
                                <XCircle aria-hidden="true" className="w-4 h-4" /> Tolak
                              </button>
                              <button
                                type="button"
                                disabled={aksiBerjalan}
                                onClick={() => jalankanAksi(m.id, "proses")}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg border border-outline-variant text-on-surface font-label-md text-label-md hover:bg-surface-container-high disabled:opacity-60"
                              >
                                <Clock aria-hidden="true" className="w-4 h-4" /> Tandai Diproses
                              </button>
                              <button
                                type="button"
                                disabled={aksiBerjalan || !catatan.trim()}
                                title={!catatan.trim() ? "Isi catatan untuk meminta revisi" : ""}
                                onClick={() => jalankanAksi(m.id, "revisi")}
                                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg bg-warning-container text-on-warning-container font-label-md text-label-md disabled:opacity-50"
                              >
                                Minta Revisi
                              </button>
                              <button
                                type="button"
                                disabled={aksiBerjalan}
                                onClick={() => jalankanAksi(m.id, "selesai")}
                                className="col-span-2 sm:col-span-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md disabled:opacity-60"
                              >
                                Tandai Selesai
                              </button>
                            </div>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        )}

        {/* ══════════ TAB DATA PENDUDUK ══════════ */}
        {tab === "penduduk" && (
          <section className="flex flex-col gap-4">
            {/* Panel import file */}
            <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 md:p-5 flex flex-col gap-3">
              <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
                <FileSpreadsheet aria-hidden="true" className="w-5 h-5 text-primary" />
                Import dari File Spreadsheet
              </h2>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Baris pertama file harus berisi header kolom (contoh: nik, nama, no_kk, jenis_kelamin, ...).
                Kolom NIK dan nama wajib ada; kolom lain mengikuti isi file.
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <label
                  htmlFor="input-file-penduduk"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md cursor-pointer hover:bg-primary-fixed-variant transition-colors"
                >
                  <Upload aria-hidden="true" className="w-4 h-4" />
                  Pilih File
                </label>
                <input
                  id="input-file-penduduk"
                  type="file"
                  accept=".xlsx,.xlsm,.csv,.ods,.xlsb"
                  className="sr-only"
                  onChange={(e) => pilihFile(e.target.files?.[0] ?? null)}
                />
                <span className="font-label-sm text-label-sm text-outline">
                  Format diterima: {FORMAT_DITERIMA.join(", ")} · maks 10 MB
                </span>
              </div>

              {file && (
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2 bg-surface-muted rounded-lg p-3">
                  <FileSpreadsheet aria-hidden="true" className="w-5 h-5 text-primary shrink-0" />
                  <span className="font-body-sm text-body-sm text-on-surface break-all min-w-0 flex-1 basis-full sm:basis-auto">
                    {file.name} ({(file.size / 1024).toFixed(1)} KB)
                  </span>
                  <div className="flex gap-2 w-full sm:w-auto ml-auto">
                    <button
                      type="button"
                      onClick={kirimImport}
                      disabled={importBerjalan}
                      className="flex-1 sm:flex-none px-4 py-2 rounded-lg bg-success text-white font-label-md text-label-md disabled:opacity-60"
                    >
                      {importBerjalan ? "Memproses..." : "Upload & Import"}
                    </button>
                    <button
                      type="button"
                      onClick={() => pilihFile(null)}
                      className="px-3 py-2 rounded-lg border border-outline-variant font-label-md text-label-md text-on-surface-variant"
                    >
                      Batal
                    </button>
                  </div>
                </div>
              )}

              {importError && (
                <div role="alert" className="bg-error-container text-on-error-container rounded-lg p-3 font-body-sm text-body-sm flex items-start gap-2">
                  <XCircle aria-hidden="true" className="w-5 h-5 shrink-0 mt-0.5" />
                  {importError}
                </div>
              )}

              {importHasil && (
                <div className="bg-[#dcfce7] text-success rounded-lg p-4 font-body-sm text-body-sm flex flex-col gap-1">
                  <span className="flex items-center gap-2 font-medium">
                    <CheckCircle2 aria-hidden="true" className="w-5 h-5" />
                    {importHasil.message}
                  </span>
                  {importHasil.errors.length > 0 && (
                    <details className="mt-1">
                      <summary className="cursor-pointer font-medium">
                        {importHasil.errors.length} baris gagal — lihat rincian
                      </summary>
                      <ul className="list-disc pl-6 mt-1 space-y-0.5">
                        {importHasil.errors.map((e) => (
                          <li key={e}>{e}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              )}
            </div>

            {/* Toolbar pencarian + tambah */}
            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3">
              <div className="relative flex-1 min-w-0 sm:max-w-md">
                <Search aria-hidden="true" className="absolute left-4 top-1/2 -translate-y-1/2 text-outline w-4 h-4" />
                <input
                  className="w-full pl-11 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                  placeholder="Cari nama atau NIK..."
                  type="text"
                  value={qPenduduk}
                  onChange={(e) => setQPenduduk(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") muatPendudukData(qPenduduk);
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => muatPendudukData(qPenduduk)}
                className="px-4 py-2.5 rounded-lg border border-outline-variant font-label-md text-label-md text-on-surface-variant hover:bg-surface-container-low sm:hidden"
              >
                Cari
              </button>
              <button
                type="button"
                onClick={bukaTambah}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-fixed-variant sm:ml-auto"
              >
                <Plus aria-hidden="true" className="w-4 h-4" /> Tambah Penduduk
              </button>
            </div>

            {/* Tabel / daftar */}
            {muatPenduduk ? (
              <p className="font-body-md text-body-md text-on-surface-variant">Memuat data penduduk...</p>
            ) : penduduk.length === 0 ? (
              <div className="bg-surface-container-low border border-outline-variant rounded-xl p-10 text-center">
                <Users aria-hidden="true" className="w-10 h-10 text-outline mx-auto mb-3" />
                <p className="font-body-md text-body-md text-on-surface-variant">
                  Belum ada data penduduk. Gunakan import file atau tambah manual.
                </p>
              </div>
            ) : (
              <>
                {/* Desktop: tabel */}
                <div className="hidden md:block bg-surface-container-lowest border border-border-subtle rounded-xl overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-outline-variant">
                        {["NIK", "Nama", "No. KK", "Jenis Kelamin", "Tanggal Lahir", "Status", ""].map((h) => (
                          <th key={h} className="font-label-sm text-label-sm text-on-surface-variant py-3 px-4 whitespace-nowrap">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="font-body-sm text-body-sm text-on-surface">
                      {penduduk.map((p) => (
                        <tr key={p.id} className="border-b border-border-subtle hover:bg-surface-muted transition-colors">
                          <td className="py-3 px-4 font-code-sm whitespace-nowrap">{p.nik}</td>
                          <td className="py-3 px-4 font-medium">{p.nama_lengkap}</td>
                          <td className="py-3 px-4 font-code-sm">{p.nomor_kk ?? "-"}</td>
                          <td className="py-3 px-4">
                            {p.jenis_kelamin === "laki_laki" ? "Laki-laki" : p.jenis_kelamin === "perempuan" ? "Perempuan" : "-"}
                          </td>
                          <td className="py-3 px-4 whitespace-nowrap">{p.tanggal_lahir ?? "-"}</td>
                          <td className="py-3 px-4">
                            <span className={cn("px-2 py-0.5 rounded-full font-label-sm", p.status_penduduk === "aktif" ? "bg-[#dcfce7] text-success" : "bg-surface-muted text-on-surface-variant")}>
                              {p.status_penduduk === "aktif" ? "Aktif" : p.status_penduduk.replace("_", " ")}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex gap-1 justify-end">
                              <button
                                type="button"
                                onClick={() => bukaEdit(p)}
                                aria-label={`Ubah ${p.nama_lengkap}`}
                                className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                              >
                                <Pencil aria-hidden="true" className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => hapusPenduduk(p)}
                                aria-label={`Hapus ${p.nama_lengkap}`}
                                className="p-2 rounded-full text-on-surface-variant hover:text-danger hover:bg-surface-container-high"
                              >
                                <Trash2 aria-hidden="true" className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile: kartu */}
                <div className="md:hidden grid grid-cols-1 gap-3">
                  {penduduk.map((p) => (
                    <div key={p.id} className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="font-label-md text-label-md font-semibold text-on-surface truncate">{p.nama_lengkap}</h3>
                          <p className="font-code-sm text-code-sm text-outline">NIK {p.nik}</p>
                        </div>
                        <span className={cn("px-2 py-0.5 rounded-full font-label-sm shrink-0", p.status_penduduk === "aktif" ? "bg-[#dcfce7] text-success" : "bg-surface-muted text-on-surface-variant")}>
                          {p.status_penduduk === "aktif" ? "Aktif" : p.status_penduduk.replace("_", " ")}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
                        KK {p.nomor_kk ?? "-"} · {p.jenis_kelamin === "laki_laki" ? "Laki-laki" : p.jenis_kelamin === "perempuan" ? "Perempuan" : "-"}
                      </p>
                      <div className="flex gap-2 mt-3">
                        <button
                          type="button"
                          onClick={() => bukaEdit(p)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-outline-variant font-label-md text-label-md text-on-surface"
                        >
                          <Pencil aria-hidden="true" className="w-4 h-4" /> Ubah
                        </button>
                        <button
                          type="button"
                          onClick={() => hapusPenduduk(p)}
                          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-outline-variant font-label-md text-label-md text-danger"
                        >
                          <Trash2 aria-hidden="true" className="w-4 h-4" /> Hapus
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <p className="font-label-sm text-label-sm text-outline">{penduduk.length} penduduk ditampilkan</p>
              </>
            )}
          </section>
        )}

        {/* ══════════ TAB KONTEN STATIS ══════════ */}
        {tab === "konten" && (
          <section className="flex flex-col gap-4 md:gap-5">
            <KontenEditor />
          </section>
        )}
      </div>
      {/* Modal tambah/ubah penduduk */}
    {formBuka && (
      <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6" role="dialog" aria-modal="true">
        <div className="absolute inset-0 bg-black/40" onClick={() => setFormBuka(false)} aria-hidden="true" />
        <div className="relative bg-surface-container-lowest border border-border-subtle rounded-t-2xl md:rounded-2xl w-full md:max-w-2xl max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">
              {editId ? "Ubah Data Penduduk" : "Tambah Penduduk"}
            </h2>
            <button
              type="button"
              onClick={() => setFormBuka(false)}
              aria-label="Tutup"
              className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
          </div>

          {formError && (
            <div role="alert" className="bg-error-container text-on-error-container rounded-lg p-3 font-body-sm text-body-sm">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(
              [
                { k: "nik", label: "NIK *", ph: "16 digit" },
                { k: "nama_lengkap", label: "Nama Lengkap *", ph: "Nama sesuai KTP" },
                { k: "nomor_kk", label: "Nomor KK", ph: "Nomor Kartu Keluarga" },
                { k: "alamat", label: "Alamat KK", ph: "Alamat lengkap" },
                { k: "tempat_lahir", label: "Tempat Lahir", ph: "Contoh: Parepare" },
                { k: "tanggal_lahir", label: "Tanggal Lahir", ph: "", tipe: "date" },
                { k: "agama", label: "Agama", ph: "Islam / Kristen / ..." },
                { k: "pekerjaan", label: "Pekerjaan", ph: "Contoh: Petani" },
                { k: "pendidikan_terakhir", label: "Pendidikan Terakhir", ph: "Contoh: SMA" },
                { k: "status_perkawinan", label: "Status Perkawinan", ph: "Belum Kawin / Kawin / ..." },
                { k: "status_dalam_kk", label: "Status dalam KK", ph: "Kepala Keluarga / Anak / ..." },
              ] as const
            ).map((f) => (
              <div key={f.k} className="space-y-1">
                <label htmlFor={`f-${f.k}`} className="block font-label-sm text-label-sm text-on-surface-variant">
                  {f.label}
                </label>
                <input
                  id={`f-${f.k}`}
                  type={"tipe" in f && f.tipe ? f.tipe : "text"}
                  value={form[f.k]}
                  placeholder={f.ph}
                  onChange={(e) => setForm((prev) => ({ ...prev, [f.k]: e.target.value }))}
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
            ))}
            <div className="space-y-1">
              <label htmlFor="f-jk" className="block font-label-sm text-label-sm text-on-surface-variant">
                Jenis Kelamin
              </label>
              <select
                id="f-jk"
                value={form.jenis_kelamin}
                onChange={(e) => setForm((prev) => ({ ...prev, jenis_kelamin: e.target.value }))}
                className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md focus:border-primary outline-none"
              >
                <option value="">— Pilih —</option>
                <option value="laki_laki">Laki-laki</option>
                <option value="perempuan">Perempuan</option>
              </select>
            </div>
            {editId && (
              <div className="space-y-1">
                <label htmlFor="f-status" className="block font-label-sm text-label-sm text-on-surface-variant">
                  Status Penduduk
                </label>
                <select
                  id="f-status"
                  value={
                    (form as unknown as { status_penduduk?: string }).status_penduduk ?? "aktif"
                  }
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, status_penduduk: e.target.value } as typeof prev))
                  }
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md focus:border-primary outline-none"
                >
                  <option value="aktif">Aktif</option>
                  <option value="pindah_keluar">Pindah Keluar</option>
                  <option value="meninggal">Meninggal</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 justify-stretch sm:justify-end pt-2 sticky bottom-0 -mx-6 px-6 pb-1 bg-surface-container-lowest">
            <button
              type="button"
              onClick={() => setFormBuka(false)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-lg border border-outline-variant font-label-md text-label-md text-on-surface-variant"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={simpanPenduduk}
              disabled={simpanBerjalan}
              className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md disabled:opacity-60"
            >
              {simpanBerjalan ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>
      )}
    </>
  );
}