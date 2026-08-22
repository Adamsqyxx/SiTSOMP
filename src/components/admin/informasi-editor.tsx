"use client";

import { useEffect, useState } from "react";
import { Loader2, Megaphone, Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Editor daftar berita/pengumuman untuk tab Konten di dashboard admin.
// CRUD penuh via /api/admin/informasi.

type Jenis = "berita" | "pengumuman" | "kegiatan" | "anggaran";
interface Info {
  id: string;
  jenis: Jenis;
  judul: string;
  konten: string;
  thumbnail_url: string | null;
  is_published: boolean;
  published_at: string | null;
}

const JENIS_LABEL: Record<Jenis, string> = {
  berita: "Berita",
  pengumuman: "Pengumuman",
  kegiatan: "Kegiatan",
  anggaran: "Info Anggaran",
};

const KOSONG = {
  jenis: "pengumuman" as Jenis,
  judul: "",
  konten: "",
  thumbnail_url: "",
  is_published: true,
};

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

export default function InformasiEditor() {
  const [daftar, setDaftar] = useState<Info[] | null>(null);
  const [form, setForm] = useState<typeof KOSONG | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [berjalan, setBerjalan] = useState(false);
  const [pesan, setPesan] = useState<{ ok: boolean; text: string } | null>(null);

  async function muat() {
    try {
      const r = await fetch("/api/admin/informasi");
      const d = await r.json();
      if (r.ok) setDaftar(d.data as Info[]);
      else setPesan({ ok: false, text: d.error ?? "Gagal memuat." });
    } catch {
      setPesan({ ok: false, text: "Gagal terhubung ke server." });
    }
  }

  useEffect(() => {
    let batal = false;
    (async () => {
      try {
        const r = await fetch("/api/admin/informasi");
        const d = await r.json();
        if (!batal) {
          if (r.ok) setDaftar(d.data as Info[]);
          else setPesan({ ok: false, text: d.error ?? "Gagal memuat." });
        }
      } catch {
        if (!batal) setPesan({ ok: false, text: "Gagal terhubung ke server." });
      }
    })();
    return () => {
      batal = true;
    };
  }, []);

  async function simpan() {
    if (!form || !form.judul.trim() || !form.konten.trim()) {
      setPesan({ ok: false, text: "Judul dan konten wajib diisi." });
      return;
    }
    setBerjalan(true);
    setPesan(null);
    try {
      const res = await fetch(
        editId ? `/api/admin/informasi/${editId}` : "/api/admin/informasi",
        {
          method: editId ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        }
      );
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal menyimpan.");
      setPesan({
        ok: true,
        text: editId ? "Perubahan tersimpan." : "Berita/pengumuman ditambahkan.",
      });
      setForm(null);
      setEditId(null);
      await muat();
    } catch (e) {
      setPesan({ ok: false, text: e instanceof Error ? e.message : "Gagal menyimpan." });
    } finally {
      setBerjalan(false);
    }
  }

  async function hapus(id: string, judul: string) {
    if (!window.confirm(`Hapus "${judul}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    setPesan(null);
    try {
      const res = await fetch(`/api/admin/informasi/${id}`, { method: "DELETE" });
      const d = await res.json();
      if (!res.ok) throw new Error(d.error ?? "Gagal menghapus.");
      setPesan({ ok: true, text: "Berhasil dihapus." });
      await muat();
    } catch (e) {
      setPesan({ ok: false, text: e instanceof Error ? e.message : "Gagal menghapus." });
    }
  }

  return (
    <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 sm:p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-headline-sm text-headline-sm text-on-surface flex items-center gap-2">
          <Megaphone aria-hidden="true" className="w-5 h-5 text-primary" />
          Berita &amp; Pengumuman
        </h2>
        {!form && (
          <button
            type="button"
            onClick={() => {
              setEditId(null);
              setForm({ ...KOSONG });
            }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-fixed-variant"
          >
            <Plus aria-hidden="true" className="w-4 h-4" /> Tambah
          </button>
        )}
      </div>

      {pesan && (
        <p
          role={pesan.ok ? "status" : "alert"}
          className={cn(
            "font-body-sm text-body-sm rounded-lg p-3",
            pesan.ok
              ? "bg-[#dcfce7] text-success"
              : "bg-error-container text-on-error-container"
          )}
        >
          {pesan.text}
        </p>
      )}

      {/* Form tambah/ubah */}
      {form && (
        <div className="border border-outline-variant rounded-lg p-4 flex flex-col gap-3 bg-surface">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label htmlFor="info-jenis" className="block font-label-sm text-label-sm text-on-surface-variant">
                Jenis
              </label>
              <select
                id="info-jenis"
                value={form.jenis}
                onChange={(e) => setForm({ ...form, jenis: e.target.value as Jenis })}
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-sm text-body-sm focus:border-primary outline-none"
              >
                {(Object.keys(JENIS_LABEL) as Jenis[]).map((j) => (
                  <option key={j} value={j}>{JENIS_LABEL[j]}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label htmlFor="info-thumb" className="block font-label-sm text-label-sm text-on-surface-variant">
                URL Thumbnail (opsional)
              </label>
              <input
                id="info-thumb"
                type="url"
                value={form.thumbnail_url}
                placeholder="https://…"
                onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
                className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-sm text-body-sm focus:border-primary outline-none"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label htmlFor="info-judul" className="block font-label-sm text-label-sm text-on-surface-variant">
              Judul
            </label>
            <input
              id="info-judul"
              type="text"
              value={form.judul}
              placeholder="Contoh: Jadwal Kerja Bakti Bulan Ini"
              onChange={(e) => setForm({ ...form, judul: e.target.value })}
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md focus:border-primary outline-none"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="info-konten" className="block font-label-sm text-label-sm text-on-surface-variant">
              Isi / Deskripsi
            </label>
            <textarea
              id="info-konten"
              value={form.konten}
              rows={5}
              placeholder="Tulis isi berita atau pengumuman…"
              onChange={(e) => setForm({ ...form, konten: e.target.value })}
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-sm text-body-sm focus:border-primary outline-none resize-y"
            />
          </div>
          <label className="flex items-center gap-2 font-body-sm text-body-sm text-on-surface">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="w-4 h-4 accent-[var(--color-primary)]"
            />
            Tampilkan di halaman publik (terbitkan)
          </label>
          <div className="flex flex-col-reverse sm:flex-row justify-stretch sm:justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setForm(null);
                setEditId(null);
              }}
              className="px-4 py-2.5 rounded-lg border border-outline-variant font-label-md text-label-md text-on-surface-variant w-full sm:w-auto"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={simpan}
              disabled={berjalan}
              className="px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md disabled:opacity-60 w-full sm:w-auto"
            >
              {berjalan ? "Menyimpan..." : editId ? "Simpan Perubahan" : "Tambahkan"}
            </button>
          </div>
        </div>
      )}

      {/* Daftar */}
      {daftar === null ? (
        <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
          <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" /> Memuat daftar...
        </p>
      ) : daftar.length === 0 ? (
        <p className="font-body-md text-body-md text-on-surface-variant">
          Belum ada berita/pengumuman. Klik &quot;Tambah&quot; untuk membuat.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {daftar.map((item) => (
            <li
              key={item.id}
              className="border border-outline-variant rounded-lg p-3 sm:p-4 flex items-start justify-between gap-3 flex-wrap"
            >
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-label-sm text-label-sm font-bold text-primary">
                    {JENIS_LABEL[item.jenis]}
                  </span>
                  {!item.is_published && (
                    <span className="font-label-xs text-label-xs px-1.5 py-0.5 rounded bg-surface-muted text-on-surface-variant">
                      Draf
                    </span>
                  )}
                  <span className="font-label-sm text-label-sm text-outline">
                    {fmtTanggal(item.published_at)}
                  </span>
                </div>
                <h3 className="font-label-md text-label-md text-on-surface break-words">{item.judul}</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mt-0.5">
                  {item.konten}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setEditId(item.id);
                    setForm({
                      jenis: item.jenis,
                      judul: item.judul,
                      konten: item.konten,
                      thumbnail_url: item.thumbnail_url ?? "",
                      is_published: item.is_published,
                    });
                  }}
                  aria-label={`Ubah ${item.judul}`}
                  title="Ubah"
                  className="p-2 rounded-lg text-primary hover:bg-primary-container/40 transition-colors"
                >
                  <Pencil aria-hidden="true" className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => hapus(item.id, item.judul)}
                  aria-label={`Hapus ${item.judul}`}
                  title="Hapus"
                  className="p-2 rounded-lg text-error hover:bg-error-container transition-colors"
                >
                  <Trash2 aria-hidden="true" className="w-4 h-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
