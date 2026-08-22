"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import AppHeader from "@/components/app-header";
import BackButton from "@/components/back-button";

interface FormField {
  id: string;
  label: string;
  required: boolean;
  placeholder?: string;
}

// Field disesuaikan dengan `form_fields` di tabel `jenis_surat` (sederhana).
const FIELDS: Record<string, FormField[]> = {
  sktm: [
    { id: "nama_lengkap", label: "Nama Lengkap (sesuai KTP)", required: true, placeholder: "Nama sesuai KTP" },
    { id: "nik", label: "NIK", required: true, placeholder: "16 digit NIK" },
    { id: "alamat", label: "Alamat Domisili", required: true, placeholder: "Alamat lengkap" },
    { id: "keperluan", label: "Keperluan Surat", required: true, placeholder: "Misal: keringanan biaya sekolah" },
    { id: "keterangan", label: "Keterangan Tambahan", required: false, placeholder: "Opsional" },
  ],
  sku: [
    { id: "nama_lengkap", label: "Nama Lengkap (sesuai KTP)", required: true, placeholder: "Nama sesuai KTP" },
    { id: "nik", label: "NIK", required: true, placeholder: "16 digit NIK" },
    { id: "nama_usaha", label: "Nama Usaha", required: true, placeholder: "Nama usaha Anda" },
    { id: "alamat_usaha", label: "Alamat Usaha", required: true, placeholder: "Alamat lokasi usaha" },
    { id: "keterangan", label: "Keterangan Tambahan", required: false, placeholder: "Opsional" },
  ],
  dom: [
    { id: "nama_lengkap", label: "Nama Lengkap (sesuai KTP)", required: true, placeholder: "Nama sesuai KTP" },
    { id: "nik", label: "NIK", required: true, placeholder: "16 digit NIK" },
    { id: "alamat_asal", label: "Alamat Asal", required: true, placeholder: "Alamat KTP asal" },
    { id: "alamat_domisili", label: "Alamat Domisili Sekarang", required: true, placeholder: "Alamat tinggal saat ini" },
    { id: "keterangan", label: "Keterangan Tambahan", required: false, placeholder: "Opsional" },
  ],
  skm: [
    { id: "nama_lengkap", label: "Nama Lengkap (sesuai KTP)", required: true, placeholder: "Nama sesuai KTP" },
    { id: "nik", label: "NIK", required: true, placeholder: "16 digit NIK" },
    { id: "nama_almarhum", label: "Nama Almarhum/Almarhumah", required: true, placeholder: "Nama yang meninggal" },
    { id: "nik_almarhum", label: "NIK Almarhum/Almarhumah", required: true, placeholder: "16 digit NIK" },
    { id: "keterangan", label: "Keterangan Tambahan", required: false, placeholder: "Opsional" },
  ],
};

const FALLBACK_FIELDS: FormField[] = [
  { id: "nama_lengkap", label: "Nama Lengkap (sesuai KTP)", required: true, placeholder: "Nama sesuai KTP" },
  { id: "nik", label: "NIK", required: true, placeholder: "16 digit NIK" },
  { id: "keterangan", label: "Keterangan", required: false, placeholder: "Opsional" },
];

export default function PengajuanPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [values, setValues] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [slug, setSlug] = useState<string>("");
  const [jenis, setJenis] = useState<string>("");

  // Next 15+: useParams/useSearchParams adalah Promise — baca lewat useEffect.
  useEffect(() => {
    let cancelled = false;
    Promise.all([params, searchParams])
      .then(([p, sp]) => {
        if (cancelled) return;
        const rawSlug = Array.isArray(p?.slug) ? p.slug[0] : p?.slug;
        setSlug(typeof rawSlug === "string" ? rawSlug : "");
        const rawJenis =
          typeof sp?.get === "function" ? sp.get("jenis") : undefined;
        setJenis(typeof rawJenis === "string" ? rawJenis : "");
      })
      .catch(() => {
        if (!cancelled) {
          setSlug("");
          setJenis("");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [params, searchParams]);
  const key = slug;
  const fields = FIELDS[key] ?? FALLBACK_FIELDS;

  const setField = (id: string, value: string) =>
    setValues((prev) => ({ ...prev, [id]: value }));

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/layanan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kode: key,
          jenis: jenis || undefined,
          data: values,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mengirim pengajuan. Coba lagi.");
        return;
      }
      setDone(true);
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
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
            Permohonan surat Anda telah diterima sistem. Pantau statusnya di Dashboard.
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

      <main className="flex-1 pt-16 lg:pt-8 lg:pl-64 w-full max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop py-8">
        <div className="mb-8">
          <BackButton fallbackHref="/layanan/surat" className="mb-3 -ml-1 md:hidden" />
          <span className="inline-block px-3 py-1 bg-primary-container/30 text-primary font-label-sm text-label-sm rounded-full mb-3 uppercase tracking-wide">
            {(key || "surat").toUpperCase()}
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface font-bold mb-2">
            {jenis || "Pengajuan Surat"}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Lengkapi formulir di bawah ini. Data akan diverifikasi oleh staf kelurahan.
          </p>
        </div>

        <form
          className="bg-surface-container-lowest border border-border-subtle rounded-xl p-6 md:p-8 space-y-5"
          onSubmit={handleSubmit}
        >
          {fields.map((f) => (
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
      </main>
    </div>
  );
}