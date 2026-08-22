"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Upload, X } from "lucide-react";
import AppHeader from "@/components/app-header";
import BackButton from "@/components/back-button";
import { getServiceBySlug, type SuratService } from "@/lib/surat-config";
import { uploadLampiran, type LampiranUpload } from "@/lib/lampiran";

interface ProfileUser {
  id?: string;
}

export default function PengajuanPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [values, setValues] = useState<Record<string, string>>({});
  const [service, setService] = useState<SuratService | null>(null);
  const [userId, setUserId] = useState<string>("");
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [previews, setPreviews] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [slug, setSlug] = useState<string>("");
  const [jenis, setJenis] = useState<string>("");
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // Next 15+: useParams/useSearchParams adalah Promise — baca lewat useEffect.
  useEffect(() => {
    let cancelled = false;
    Promise.all([params, searchParams])
      .then(([p, sp]) => {
        if (cancelled) return;
        const rawSlug = Array.isArray(p?.slug) ? p.slug[0] : p?.slug;
        const s = typeof rawSlug === "string" ? getServiceBySlug(rawSlug) : undefined;
        setService(s ?? null);
        setSlug(s?.slug ?? "");
        const rawJenis =
          typeof sp?.get === "function" ? sp.get("jenis") : undefined;
        setJenis(typeof rawJenis === "string" ? rawJenis : "");
      })
      .catch(() => {
        if (!cancelled) {
          setService(null);
          setSlug("");
          setJenis("");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [params, searchParams]);

  // Ambil user.id dari session (dibutuhkan sebagai prefix path upload).
  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((d: ProfileUser | null) => {
        if (d?.id) setUserId(d.id);
      })
      .catch(() => {});
  }, []);

  // Bersihkan object URL preview saat unmount.
  useEffect(() => {
    return () => {
      Object.values(previews).forEach((url) => {
        if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      });
    };
  }, [previews]);

  const setField = (id: string, value: string) =>
    setValues((prev) => ({ ...prev, [id]: value }));

  const pickFile = (label: string, file: File | null) => {
    setFiles((prev) => ({ ...prev, [label]: file }));
    setPreviews((prev) => {
      const next = { ...prev };
      if (prev[label]?.startsWith("blob:")) URL.revokeObjectURL(prev[label]);
      if (file) next[label] = URL.createObjectURL(file);
      else delete next[label];
      return next;
    });
  };

  const clearFile = (label: string) => {
    pickFile(label, null);
    const el = fileInputRefs.current[label];
    if (el) el.value = "";
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!service) {
        setError("Jenis surat tidak dikenali.");
        return;
      }
      if (!userId) {
        setError("Sesi tidak valid. Silakan muat ulang halaman atau masuk kembali.");
        return;
      }

      // Upload tiap lampiran persyaratan ke Supabase Storage.
      const lampiran: LampiranUpload[] = [];
      for (const req of service.requirements) {
        const file = files[req.label];
        if (file) {
          const url = await uploadLampiran(file, userId, service.slug);
          lampiran.push({ label: req.label, url });
        }
      }

      const res = await fetch("/api/layanan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode: service.slug,
          jenis: jenis || undefined,
          data: values,
          lampiran,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim pengajuan. Coba lagi.");
        return;
      }
      setDone(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan jaringan. Coba lagi."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (done) {
    return (
      <div className="bg-background text-on-background min-h-screen flex items-center justify-center font-body-md p-6">
        <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-10 max-w-md w-full text-center shadow-sm">
          <CheckCircle2 aria-hidden="true" className="w-16 h-16 text-success mx-auto mb-4" />
          <h1 className="font-headline-md text-headline-md text-on-surface font-bold mb-2">
            Pengajuan Terkirim
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-6">
            Permohonan surat Anda beserta lampiran telah diterima sistem. Pantau
            statusnya di Dashboard.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full py-3 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-fixed-variant transition-colors"
          >
            Ke Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col font-body-md antialiased">
      <AppHeader />

      <main className="flex-1 pt-20 lg:pt-8 lg:pl-16 w-full max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop pb-16">
        <div className="mb-8">
          <BackButton fallbackHref="/layanan/surat" className="mb-3 -ml-1 md:hidden" />
          <span className="inline-block px-3 py-1 bg-primary-container/30 text-primary font-label-sm text-label-sm rounded-full mb-3 uppercase tracking-wide">
            {(slug || "surat").toUpperCase()}
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-2">
            {jenis || service?.name || "Pengajuan Surat"}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Lengkapi formulir dan unggah lampiran persyaratan di bawah ini.
            Data akan diverifikasi oleh staf kelurahan.
          </p>
        </div>

        {!service ? (
          <div className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 text-on-surface-variant">
            Jenis surat tidak ditemukan. Kembali ke{" "}
            <button
              type="button"
              onClick={() => router.push("/layanan/surat")}
              className="text-primary underline"
            >
              daftar layanan
            </button>
            .
          </div>
        ) : (
          <form
            className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 md:p-8 space-y-5"
            onSubmit={handleSubmit}
          >
            {service.fields.map((f) => (
              <div key={f.id} className="space-y-1.5">
                <label className="block font-label-md text-label-md text-on-surface" htmlFor={f.id}>
                  {f.label}
                  {f.required && <span className="text-danger"> *</span>}
                </label>
                <textarea
                  id={f.id}
                  name={f.id}
                  required={f.required}
                  rows={2}
                  placeholder={f.placeholder}
                  value={values[f.id] ?? ""}
                  onChange={(e) => setField(f.id, e.target.value)}
                  className="block w-full px-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none resize-y"
                />
              </div>
            ))}

            {/* Lampiran per persyaratan */}
            <div className="pt-2 border-t border-outline-variant space-y-4">
              <h2 className="font-label-md text-label-md text-on-surface">
                Lampiran Persyaratan
              </h2>
              {service.requirements.map((req) => {
                const file = files[req.label];
                const preview = previews[req.label];
                const isImage = file?.type.startsWith("image/");
                return (
                  <div key={req.label} className="space-y-2">
                    <label className="block font-label-sm text-label-sm text-on-surface-variant">
                      {req.label}
                    </label>
                    {preview ? (
                      <div className="flex items-start gap-3 bg-surface border border-outline-variant rounded-lg p-3">
                        {isImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={preview}
                            alt={req.label}
                            className="w-16 h-16 object-cover rounded-md flex-shrink-0"
                          />
                        ) : (
                          <span className="w-16 h-16 flex items-center justify-center bg-surface-container-low rounded-md text-on-surface-variant text-xs flex-shrink-0">
                            PDF
                          </span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-body-sm text-body-sm text-on-surface truncate">
                            {file?.name}
                          </p>
                          <button
                            type="button"
                            onClick={() => clearFile(req.label)}
                            className="mt-1 inline-flex items-center gap-1 text-danger font-label-sm text-label-sm"
                          >
                            <X className="w-3.5 h-3.5" /> Hapus
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 cursor-pointer bg-surface border border-dashed border-outline-variant rounded-lg px-4 py-3 hover:border-primary transition-colors">
                        <Upload className="w-4 h-4 text-outline" />
                        <span className="font-body-sm text-body-sm text-on-surface-variant">
                          Pilih foto/scan (JPG, PNG, WEBP, PDF, maks 5 MB)
                        </span>
                        <input
                          ref={(el) => {
                            fileInputRefs.current[req.label] = el;
                          }}
                          type="file"
                          accept="image/jpeg,image/png,image/webp,application/pdf"
                          className="hidden"
                          onChange={(e) => pickFile(req.label, e.target.files?.[0] ?? null)}
                        />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>

            {error && (
              <div
                role="alert"
                className="bg-error-container text-on-error-container px-4 py-3 rounded-lg border border-error-container font-body-sm text-body-sm"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-primary text-on-primary font-label-md text-label-md rounded-lg hover:bg-primary-fixed-variant transition-colors disabled:opacity-60"
            >
              {submitting ? "Mengirim..." : "Kirim Pengajuan"}
            </button>
          </form>
        )}
      </main>
    </div>
  );
}
