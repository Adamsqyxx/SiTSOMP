"use client";

import { useEffect, useState } from "react";
import { Globe, Loader2, Plus, Save, Trash2 } from "lucide-react";
import {
  type KontakKonten,
  type KebijakanPrivasiKonten,
  type PetaSitusKonten,
} from "@/lib/site-content";

// Editor konten statis untuk tab Konten di dashboard admin.
// Tiga bagian: kontak, kebijakan privasi, peta situs.

type SemuaKonten = {
  kontak: KontakKonten;
  kebijakan_privasi: KebijakanPrivasiKonten;
  peta_situs: PetaSitusKonten;
};

const LABEL_BAGIAN: Record<keyof SemuaKonten, string> = {
  kontak: "Halaman Kontak",
  kebijakan_privasi: "Kebijakan Privasi",
  peta_situs: "Peta Situs",
};

export default function KontenEditor() {
  const [konten, setKonten] = useState<SemuaKonten | null>(null);
  const [simpanKey, setSimpanKey] = useState<string | null>(null);
  const [pesan, setPesan] = useState<{ key: string; ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/admin/konten")
      .then((r) => r.json())
      .then((d) => {
        if (d.data) setKonten(d.data as SemuaKonten);
      })
      .catch(() => setPesan({ key: "*", ok: false, text: "Gagal memuat konten." }));
  }, []);

  async function simpan(key: keyof SemuaKonten) {
    if (!konten) return;
    setSimpanKey(key);
    setPesan(null);
    try {
      const res = await fetch("/api/admin/konten", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, data: konten[key] }),
      });
      const d = await res.json();
      setPesan(
        res.ok
          ? { key, ok: true, text: "Tersimpan. Perubahan langsung tampil di halaman publik." }
          : { key, ok: false, text: d.error ?? "Gagal menyimpan." }
      );
    } catch {
      setPesan({ key, ok: false, text: "Gagal terhubung ke server." });
    } finally {
      setSimpanKey(null);
    }
  }

  if (!konten) {
    return (
      <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-2">
        <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" /> Memuat konten...
      </p>
    );
  }

  // ── Editor kontak: satu textarea per kelompok, 1 baris = 1 entri ──
  function editKontak(field: keyof KontakKonten, value: string) {
    setKonten((k) =>
      k ? { ...k, kontak: { ...k.kontak, [field]: value.split("\n") } } : k
    );
  }

  const kontakFields: { key: keyof KontakKonten; label: string; hint: string }[] = [
    { key: "alamat", label: "Alamat", hint: "Satu baris per penjelasan alamat" },
    { key: "telepon", label: "Telepon / WhatsApp", hint: "Satu baris per nomor" },
    { key: "email", label: "Email", hint: "Satu baris per alamat email" },
    { key: "jam_layanan", label: "Jam Layanan", hint: "Satu baris per aturan jam" },
  ];

  return (
    <>
      <p className="font-body-sm text-body-sm text-on-surface-variant">
        Sunting isi halaman statis. Perubahan tersimpan per bagian dan langsung tampil di halaman publik.
      </p>

      {/* ── KONTAK ── */}
      <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 md:p-5 flex flex-col gap-3">
        <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold flex items-center gap-2">
          <Globe aria-hidden="true" className="w-5 h-5 text-primary" />
          {LABEL_BAGIAN.kontak}
        </h2>
        {kontakFields.map((f) => (
          <label key={f.key} className="flex flex-col gap-1">
            <span className="font-label-md text-label-md text-on-surface">{f.label}</span>
            <textarea
              rows={f.key === "alamat" ? 4 : 3}
              value={konten.kontak[f.key].join("\n")}
              onChange={(e) => editKontak(f.key, e.target.value)}
              placeholder={f.hint}
              className="w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y"
            />
            <span className="font-label-sm text-label-sm text-outline">{f.hint}</span>
          </label>
        ))}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => simpan("kontak")}
            disabled={simpanKey === "kontak"}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md disabled:opacity-60"
          >
            {simpanKey === "kontak" ? (
              <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
            ) : (
              <Save aria-hidden="true" className="w-4 h-4" />
            )}
            Simpan Kontak
          </button>
          {pesan && pesan.key === "kontak" && (
            <span
              role="status"
              className={cn(
                "font-label-sm text-label-sm",
                pesan.ok ? "text-success" : "text-error"
              )}
            >
              {pesan.text}
            </span>
          )}
        </div>
      </section>

      {/* ── KEBIJAKAN PRIVASI ── */}
      <section className="bg-surface-container-lowest border border-border-subtle rounded-xl p-4 md:p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
            {LABEL_BAGIAN.kebijakan_privasi}
          </h2>
          <button
            type="button"
            onClick={() =>
              setKonten((k) =>
                k
                  ? {
                      ...k,
                      kebijakan_privasi: {
                        bagian: [...k.kebijakan_privasi.bagian, { judul: "", isi: "" }],
                      },
                    }
                  : k
              )
            }
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-outline-variant font-label-sm text-label-sm text-on-surface-variant hover:bg-surface-container-low"
          >
            <Plus aria-hidden="true" className="w-4 h-4" /> Tambah Bagian
          </button>
        </div>
        {konten.kebijakan_privasi.bagian.map((b, i) => (
          <div key={i} className="flex flex-col gap-2 border border-outline-variant/60 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <span className="font-label-md text-label-md text-outline shrink-0">{i + 1}.</span>
              <input
                value={b.judul}
                onChange={(e) =>
                  setKonten((k) => {
                    if (!k) return k;
                    const bagian = [...k.kebijakan_privasi.bagian];
                    bagian[i] = { ...bagian[i], judul: e.target.value };
                    return { ...k, kebijakan_privasi: { bagian } };
                  })
                }
                placeholder={`Judul bagian ${i + 1}`}
                className="flex-1 min-w-0 px-3 py-2 bg-surface border border-outline-variant rounded-lg font-label-md text-label-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
              <button
                type="button"
                aria-label={`Hapus bagian ${i + 1}`}
                onClick={() =>
                  setKonten((k) =>
                    k
                      ? {
                          ...k,
                          kebijakan_privasi: {
                            bagian: k.kebijakan_privasi.bagian.filter((_, j) => j !== i),
                          },
                        }
                      : k
                  )
                }
                className="p-2 rounded-lg text-on-surface-variant hover:bg-error-container hover:text-on-error-container"
              >
                <Trash2 aria-hidden="true" className="w-4 h-4" />
              </button>
            </div>
            <textarea
              rows={3}
              value={b.isi}
              onChange={(e) =>
                setKonten((k) => {
                  if (!k) return k;
                  const bagian = [...k.kebijakan_privasi.bagian];
                  bagian[i] = { ...bagian[i], isi: e.target.value };
                  return { ...k, kebijakan_privasi: { bagian } };
                })
              }
              placeholder={`Isi bagian ${i + 1}`}
              className="w-full px-3 py-2 bg-surface border border-outline-variant rounded-lg font-body-sm text-body-sm text-on-surface focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-y"
            />
          </div>
        ))}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => simpan("kebijakan_privasi")}
            disabled={simpanKey === "kebijakan_privasi"}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md disabled:opacity-60"
          >
            {simpanKey === "kebijakan_privasi" ? (
              <Loader2 aria-hidden="true" className="w-4 h-4 animate-spin" />
            ) : (
              <Save aria-hidden="true" className="w-4 h-4" />
            )}
            Simpan Kebijakan
          </button>
          {pesan && pesan.key === "kebijakan_privasi" && (
            <span
              role="status"
              className={cn(
                "font-label-sm text-label-sm",
                pesan.ok ? "text-success" : "text-error"
              )}
            >
              {pesan.text}
            </span>
          )}
        </div>
      </section>
