"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { MapPin, Send } from "lucide-react";
import { cn } from "@/lib/utils";

const complaintSchema = z.object({
  kategori: z.enum(["infrastruktur", "sosial", "keamanan", "administrasi", "lainnya"]),
  judul: z.string().trim().min(5, "Judul minimal 5 karakter").max(120, "Judul maksimal 120 karakter"),
  deskripsi: z
    .string()
    .trim()
    .min(20, "Deskripsi minimal 20 karakter")
    .max(2000, "Deskripsi maksimal 2000 karakter"),
});

type ComplaintFormValues = z.infer<typeof complaintSchema>;

const KATEGORI_LABEL: Record<ComplaintFormValues["kategori"], string> = {
  infrastruktur: "Infrastruktur",
  sosial: "Sosial",
  keamanan: "Keamanan",
  administrasi: "Administrasi",
  lainnya: "Lainnya",
};

export default function ComplaintForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [lokasiAktif, setLokasiAktif] = useState(false);
  const [koordinat, setKoordinat] = useState<{ lat: number; lng: number } | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintSchema),
    defaultValues: {
      kategori: "infrastruktur",
      judul: "",
      deskripsi: "",
    },
    mode: "onTouched",
  });

  const onSubmit = handleSubmit(async (values) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/pengaduan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          latitude: koordinat?.lat ?? null,
          longitude: koordinat?.lng ?? null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Gagal mengirim pengaduan.");
        return;
      }
      toast.success("Pengaduan terkirim", {
        description: `Nomor tiket: ${data.data?.nomor_tiket ?? "-"}. Status akan dipantau oleh kelurahan.`,
      });
      reset();
      setLokasiAktif(false);
      setKoordinat(null);
      onSubmitted?.();
    } catch {
      toast.error("Terjadi kesalahan koneksi. Coba lagi.");
    } finally {
      setSubmitting(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5" noValidate>
      {/* Kategori */}
      <div>
        <label htmlFor="kategori" className="font-label-md text-label-md text-on-surface mb-2 block">
          Kategori Masalah
        </label>
        <select
          id="kategori"
          {...register("kategori")}
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        >
          {Object.entries(KATEGORI_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        {errors.kategori && (
          <p className="font-label-sm text-label-sm text-danger mt-1">{errors.kategori.message}</p>
        )}
      </div>

      {/* Judul */}
      <div>
        <label htmlFor="judul" className="font-label-md text-label-md text-on-surface mb-2 block">
          Judul Masalah
        </label>
        <input
          id="judul"
          type="text"
          placeholder="Contoh: Jalan berlubang di depan Balai RW 02"
          {...register("judul")}
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
        />
        {errors.judul && (
          <p className="font-label-sm text-label-sm text-danger mt-1">{errors.judul.message}</p>
        )}
      </div>

      {/* Deskripsi */}
      <div>
        <label htmlFor="deskripsi" className="font-label-md text-label-md text-on-surface mb-2 block">
          Deskripsi Lengkap
        </label>
        <textarea
          id="deskripsi"
          rows={4}
          placeholder="Jelaskan masalah secara detail: lokasi, sejak kapan, dan dampaknya bagi warga."
          {...register("deskripsi")}
          className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary resize-y"
        />
        {errors.deskripsi && (
          <p className="font-label-sm text-label-sm text-danger mt-1">{errors.deskripsi.message}</p>
        )}
      </div>

      {/* Titik lokasi (opsional) */}
      <div>
        <button
          type="button"
          onClick={() => setLokasiAktif((v) => !v)}
          className={cn(
            "flex items-center gap-2 px-4 py-2.5 rounded-full border font-label-md text-label-md transition-colors",
            lokasiAktif
              ? "bg-primary-container text-on-primary-container border-primary"
              : "border-outline-variant text-on-surface-variant hover:bg-surface-container-low"
          )}
        >
          <MapPin aria-hidden="true" className="w-4 h-4" />
          {lokasiAktif ? "Titik lokasi aktif" : "Tambahkan titik lokasi (opsional)"}
        </button>
        {lokasiAktif && (
          <p className="font-body-sm text-body-sm text-on-surface-variant mt-2">
            Gunakan peta wilayah di halaman{" "}
            <a href="/peta" className="text-primary underline" onClick={() => setLokasiAktif(false)}>
              Peta
            </a>{" "}
            untuk memilih titik, lalu salin koordinat di sini:
          </p>
        )}
        {lokasiAktif && (
          <div className="flex gap-2 mt-2">
            <input
              type="number"
              step="any"
              placeholder="Latitude (mis. -4.0250)"
              value={koordinat?.lat ?? ""}
              onChange={(e) =>
                setKoordinat((k) => ({ lat: Number(e.target.value), lng: k?.lng ?? 0 }))
              }
              className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="number"
              step="any"
              placeholder="Longitude (mis. 119.6291)"
              value={koordinat?.lng ?? ""}
              onChange={(e) =>
                setKoordinat((k) => ({ lat: k?.lat ?? 0, lng: Number(e.target.value) }))
              }
              className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2 font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2 bg-primary text-on-primary font-label-md text-label-md px-6 py-3 rounded-full hover:bg-primary-fixed-variant transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Send aria-hidden="true" className="w-4 h-4" />
        {submitting ? "Mengirim..." : "Kirim Pengaduan"}
      </button>
    </form>
  );
}