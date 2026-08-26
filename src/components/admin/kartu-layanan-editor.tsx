"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  ExternalLink,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ICON_CHOICES,
  LAYANAN_ICONS,
  getLayananIcon,
} from "@/lib/layanan-icons";

// Editor kartu layanan (tab "Kartu Layanan" di dashboard admin).
// CRUD penuh: tambah/ubah/hapus + toggle aktif. Kartu aktif tampil di
// grid /layanan/surat berdampingan dengan kartu surat bawaan.

export interface LayananCardRow {
  id: string;
  judul: string;
  deskripsi: string;
  icon: string;
  link_url: string;
  label_tombol: string;
  urutan: number;
  is_active: boolean;
}

const KOSONG = {
  judul: "",
  deskripsi: "",
  icon: "FileText",
  link_url: "",
  label_tombol: "Buka Layanan",
  urutan: 0,
};

export default function KartuLayananEditor() {
  const [cards, setCards] = useState<LayananCardRow[]>([]);
  const [muat, setMuat] = useState(true);
  const [formBuka, setFormBuka] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...KOSONG });
  const [formError, setFormError] = useState("");
  const [simpanBerjalan, setSimpanBerjalan] = useState(false);

  const muatCards = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/layanan-cards");
      const d = await res.json();
      if (res.ok) setCards(d.data ?? []);
    } finally {
      setMuat(false);
    }
  }, []);

  useEffect(() => {
    muatCards();
  }, [muatCards]);

  const bukaTambah = () => {
    setEditId(null);
    setForm({ ...KOSONG });
    setFormError("");
    setFormBuka(true);
  };

  const bukaEdit = (c: LayananCardRow) => {
    setEditId(c.id);
    setForm({
      judul: c.judul,
      deskripsi: c.deskripsi,
      icon: LAYANAN_ICONS[c.icon] ? c.icon : "FileText",
      link_url: c.link_url,
      label_tombol: c.label_tombol || "Buka Layanan",
      urutan: c.urutan ?? 0,
    });
    setFormError("");
    setFormBuka(true);
  };

  const simpan = async () => {
    setFormError("");
    if (!form.judul.trim() || !form.deskripsi.trim()) {
      const pesan = "Judul dan deskripsi wajib diisi.";
      setFormError(pesan);
      toast.error(pesan);
      return;
    }
    if (!/^https?:\/\/.+/.test(form.link_url.trim())) {
      const pesan =
        "Link harus URL http/https yang valid (contoh: https://contoh.id).";
      setFormError(pesan);
      toast.error(pesan);
      return;
    }
    setSimpanBerjalan(true);
    try {
      const res = await fetch("/api/admin/layanan-cards", {
        method: editId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId ? { id: editId, ...form } : form),
      });
      const d = await res.json();
      if (!res.ok) {
        setFormError(d.error ?? "Gagal menyimpan kartu.");
        return;
      }
      toast.success(editId ? "Kartu diperbarui." : "Kartu ditambahkan.");
      setFormBuka(false);
      muatCards();
    } finally {
      setSimpanBerjalan(false);
    }
  };

  const hapus = async (c: LayananCardRow) => {
    if (!window.confirm(`Hapus kartu "${c.judul}"? Tindakan ini permanen.`))
      return;
    const res = await fetch(
      `/api/admin/layanan-cards?id=${encodeURIComponent(c.id)}`,
      { method: "DELETE" }
    );
    const d = await res.json().catch(() => ({}));
    if (!res.ok) {
      toast.error(d.error ?? "Gagal menghapus kartu.");
      return;
    }
    toast.success("Kartu dihapus.");
    muatCards();
  };

  const toggleAktif = async (c: LayananCardRow) => {
    const res = await fetch("/api/admin/layanan-cards", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: c.id, is_active: !c.is_active }),
    });
    if (!res.ok) {
      toast.error("Gagal mengubah status kartu.");
      return;
    }
    muatCards();
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="min-w-0 flex-1">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">
            Kartu Layanan
          </h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
            Kartu tampil di halaman Layanan Surat, berdampingan dengan jenis
            surat bawaan. Tombol kartu mengarah ke link yang Anda isi.
          </p>
        </div>
        <button
          type="button"
          onClick={bukaTambah}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-fixed-variant shrink-0 sm:self-start"
        >
          <Plus aria-hidden="true" className="w-4 h-4" /> Tambah Kartu
        </button>
      </div>

      {muat ? (
        <p className="font-body-md text-body-md text-on-surface-variant">
          Memuat kartu...
        </p>
      ) : cards.length === 0 ? (
        <div className="bg-surface-container-low border border-outline-variant rounded-xl p-10 text-center">
          <ExternalLink aria-hidden="true" className="w-10 h-10 text-outline mx-auto mb-3" />
          <p className="font-body-md text-body-md text-on-surface-variant">
            Belum ada kartu layanan. Klik &quot;Tambah Kartu&quot; untuk membuat.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {cards.map((c) => {
            const Icon = getLayananIcon(c.icon);
            return (
              <article
                key={c.id}
                className={cn(
                  "bg-surface-container-lowest border rounded-xl p-4 flex flex-col gap-3",
                  c.is_active
                    ? "border-border-subtle"
                    : "border-outline-variant opacity-70"
                )}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                    <Icon aria-hidden="true" className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-label-md text-label-md font-semibold text-on-surface truncate">
                      {c.judul}
                    </h3>
                    <p className="font-code-sm text-code-sm text-outline truncate break-all">
                      {c.link_url}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-0.5 rounded-full font-label-sm text-label-sm shrink-0",
                      c.is_active
                        ? "bg-[#dcfce7] text-success"
                        : "bg-surface-muted text-on-surface-variant"
                    )}
                  >
                    {c.is_active ? "Aktif" : "Nonaktif"}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  {c.deskripsi}
                </p>
                <div className="flex flex-wrap items-center gap-1 mt-auto pt-1">
                  <span className="font-label-sm text-label-sm text-outline mr-auto">
                    Urutan {c.urutan}
                  </span>
                  <button
                    type="button"
                    onClick={() => toggleAktif(c)}
                    title={c.is_active ? "Sembunyikan dari publik" : "Tampilkan di publik"}
                    className="px-2.5 py-1.5 rounded-lg border border-outline-variant font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-low"
                  >
                    {c.is_active ? "Nonaktifkan" : "Aktifkan"}
                  </button>
                  <button
                    type="button"
                    onClick={() => bukaEdit(c)}
                    aria-label={`Ubah ${c.judul}`}
                    className="p-2 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-high"
                  >
                    <Pencil aria-hidden="true" className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => hapus(c)}
                    aria-label={`Hapus ${c.judul}`}
                    className="p-2 rounded-full text-on-surface-variant hover:text-danger hover:bg-surface-container-high"
                  >
                    <Trash2 aria-hidden="true" className="w-4 h-4" />
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Modal tambah/ubah kartu */}
      {formBuka && (
        <div
          className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setFormBuka(false)}
            aria-hidden="true"
          />
          <div className="relative bg-surface-container-lowest border border-border-subtle rounded-t-2xl md:rounded-2xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">
                {editId ? "Ubah Kartu Layanan" : "Tambah Kartu Layanan"}
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
              <div
                role="alert"
                className="bg-error-container text-on-error-container rounded-lg p-3 font-body-sm text-body-sm"
              >
                {formError}
              </div>
            )}

            {/* Pratinjau langsung */}
            <div className="bg-surface-container-low border border-border-subtle rounded-xl p-4 flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary-fixed text-primary flex items-center justify-center shrink-0">
                {(() => {
                  const PreviewIcon = getLayananIcon(form.icon);
                  return <PreviewIcon aria-hidden="true" className="w-6 h-6" />;
                })()}
              </div>
              <div className="min-w-0">
                <p className="font-headline-sm text-headline-sm text-on-surface truncate">
                  {form.judul || "Judul Kartu"}
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2">
                  {form.deskripsi || "Deskripsi kartu akan tampil di sini."}
                </p>
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="kartu-judul"
                className="block font-label-sm text-label-sm text-on-surface-variant"
              >
                Judul *
              </label>
              <input
                id="kartu-judul"
                type="text"
                value={form.judul}
                placeholder="Contoh: Cek Dukcapil"
                maxLength={150}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, judul: e.target.value }))
                }
                className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="kartu-deskripsi"
                className="block font-label-sm text-label-sm text-on-surface-variant"
              >
                Deskripsi *
              </label>
              <textarea
                id="kartu-deskripsi"
                value={form.deskripsi}
                placeholder="Jelaskan singkat kegunaan layanan ini..."
                rows={3}
                maxLength={1000}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, deskripsi: e.target.value }))
                }
                className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y"
              />
            </div>

            <div className="space-y-2">
              <span className="block font-label-sm text-label-sm text-on-surface-variant">
                Ikon
              </span>
              <div className="grid grid-cols-7 sm:grid-cols-8 gap-1.5">
                {ICON_CHOICES.map((name) => {
                  const IconOpt = getLayananIcon(name);
                  const dipilih = form.icon === name;
                  return (
                    <button
                      key={name}
                      type="button"
                      title={name}
                      aria-label={`Ikon ${name}`}
                      onClick={() => setForm((prev) => ({ ...prev, icon: name }))}
                      className={cn(
                        "aspect-square rounded-lg flex items-center justify-center border transition-colors",
                        dipilih
                          ? "border-primary bg-primary-fixed text-primary"
                          : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
                      )}
                    >
                      <IconOpt aria-hidden="true" className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="kartu-link"
                className="block font-label-sm text-label-sm text-on-surface-variant"
              >
                Link Tujuan * (http/https)
              </label>
              <input
                id="kartu-link"
                type="url"
                inputMode="url"
                value={form.link_url}
                placeholder="https://contoh.id/layanan"
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, link_url: e.target.value }))
                }
                className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label
                  htmlFor="kartu-label"
                  className="block font-label-sm text-label-sm text-on-surface-variant"
                >
                  Label Tombol
                </label>
                <input
                  id="kartu-label"
                  type="text"
                  value={form.label_tombol}
                  placeholder="Buka Layanan"
                  maxLength={50}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, label_tombol: e.target.value }))
                  }
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="kartu-urutan"
                  className="block font-label-sm text-label-sm text-on-surface-variant"
                >
                  Urutan Tampil
                </label>
                <input
                  id="kartu-urutan"
                  type="number"
                  value={Number.isFinite(form.urutan) ? form.urutan : 0}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      urutan: Number(e.target.value),
                    }))
                  }
                  className="w-full px-4 py-2.5 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                />
                <p className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                  <CheckCircle2 aria-hidden="true" className="w-3 h-3" />
                  Angka kecil tampil lebih dulu.
                </p>
              </div>
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
                onClick={simpan}
                disabled={simpanBerjalan}
                className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md disabled:opacity-60"
              >
                {simpanBerjalan ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
