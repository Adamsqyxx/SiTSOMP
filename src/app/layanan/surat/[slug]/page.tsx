"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import AppSidebar from "@/components/app-sidebar";
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

function SidebarContent() {
  return (
    <>
      <div className="flex items-center gap-4 px-4 py-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant flex-shrink-0 flex items-center justify-center font-label-md font-bold text-on-surface">
          AK
        </div>
        <div>
          <h2 className="font-headline-sm text-headline-sm font-bold text-primary">Admin Kelurahan</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant">Tiro Sompe</p>
          <span className="font-label-sm text-label-sm text-outline">v1.0.2</span>
        </div>
      </div>
      <nav className="flex flex-col gap-1">
        {SIDEBAR_ITEMS.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 mx-2 rounded-full font-body-md text-body-md transition-all duration-200",
              item.active
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            <item.icon aria-hidden="true" className="w-5 h-5" />
            {item.label}
          </Link>
        ))}
      </nav>
    </>
  );
}

export default function PengajuanPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const [drawerOpen, setDrawerOpen] = useState(false);
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
      {/* TopAppBar */}
      <header className="bg-surface text-primary border-b border-outline-variant transition-colors duration-200 fixed top-0 w-full z-50 flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop">
        <div className="flex items-center gap-4">
          <button
            type="button"
            aria-label="Menu"
            onClick={() => setDrawerOpen(true)}
            className="md:hidden hover:bg-surface-container-low p-2 rounded-full transition-colors flex items-center justify-center text-on-surface-variant"
          >
            <Menu aria-hidden="true" className="w-5 h-5" />
          </button>
          <BackButton
            fallbackHref="/layanan/surat"
            label=""
            className="hidden md:inline-flex text-on-surface-variant hover:bg-surface-container-low rounded-full p-2"
          />
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">SiTSOMP</Link>
        </div>

        <nav className="hidden md:flex items-center gap-2">
          {DESKTOP_NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full font-label-md text-label-md transition-colors duration-200",
                item.active
                  ? "bg-secondary-container text-on-secondary-container"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              )}
            >
              <item.icon aria-hidden="true" className="w-5 h-5" />
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          <button
            type="button"
            aria-label="Notifikasi"
            onClick={() => router.push("/pengumuman")}
            className="hover:bg-surface-container-low p-2 rounded-full transition-colors flex items-center justify-center text-on-surface-variant"
            title="Lihat pengumuman"
          >
            <Bell aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Mobile drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDrawerOpen(false)} aria-hidden="true" />
          <nav className="absolute left-0 top-0 h-full w-[280px] bg-surface flex flex-col pt-4 shadow-xl">
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setDrawerOpen(false)}
              className="absolute top-4 right-4 p-2 rounded-full text-on-surface-variant hover:bg-surface-container-low z-10"
            >
              <X aria-hidden="true" className="w-5 h-5" />
            </button>
            <SidebarContent />
          </nav>
        </div>
      )}

      <main className="flex-1 pt-16 w-full max-w-2xl mx-auto px-margin-mobile md:px-margin-desktop py-8">
        <div className="mb-8">
          <BackButton fallbackHref="/layanan/surat" className="mb-3 -ml-1" />
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