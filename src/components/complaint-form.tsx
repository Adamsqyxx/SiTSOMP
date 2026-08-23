"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import dynamicImport from "next/dynamic";
import { toast } from "sonner";
import { MapPin, Send } from "lucide-react";

const PilihLokasiPeta = dynamicImport(
  () => import("@/components/map/pilih-lokasi-peta"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[280px] md:h-[320px] rounded-lg border border-outline-variant bg-surface-container-low flex items-center justify-center">
        <p className="font-body-sm text-body-sm text-on-surface-variant">Memuat peta…</p>
      </div>
    ),
  }
);

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

interface WilayahResponse {
  id: string;
  nomor_rw: string;
  rt_list: { id: string; nomor_rt: string }[];
}

// Pusat perkiraan tiap RT tidak tersedia di DB — dropdown hanya menandai
// wilayah administratif; koordinat tetap dari klik pin di peta.
export default function ComplaintForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [submitting, setSubmitting] = useState(false);
  const [koordinat, setKoordinat] = useState<{ lat: number; lng: number } | null>(null);
  const [wilayah, setWilayah] = useState<WilayahResponse[]>([]);
  const [pilihanRw, setPilihanRw] = useState("");
  const [pilihanRt, setPilihanRt] = useState("");

  useEffect(() => {
    fetch("/api/wilayah")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setWilayah(d?.data ?? []))
      .catch(() => {});
  }, []);

  const rtTersedia = wilayah.find((w) => w.nomor_rw === pilihanRw)?.rt_list ?? [];

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
    if (!koordinat) {
      toast.error("Pilih titik lokasi kejadian pada peta terlebih dahulu.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/pengaduan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          latitude: koordinat.lat,
          longitude: koordinat.lng,
          ...(pilihanRw ? { rw: pilihanRw } : {}),
          ...(pilihanRt ? { rt: pilihanRt } : {}),
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
      setKoordinat(null);
      setPilihanRw("");
      setPilihanRt("");
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

      {/* Lokasi kejadian — peta + dropdown RT/RW, khusus Kel. Tiro Sompe */}
      <div className="space-y-3">
        <label className="font-label-md text-label-md text-on-surface flex items-center gap-2">
          <MapPin aria-hidden="true" className="w-4 h-4 text-primary" />
          Titik Lokasi Kejadian <span className="text-danger">*</span>
        </label>

        {/* Dropdown RW/RT sebagai bantuan penanda wilayah */}
        <div className="grid grid-cols-2 gap-3">
          <select
            value={pilihanRw}
            onChange={(e) => {
              setPilihanRw(e.target.value);
              setPilihanRt("");
            }}
            aria-label="Pilih RW"
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">RW (opsional)</option>
            {wilayah.map((w) => (
              <option key={w.id} value={w.nomor_rw}>
                RW {w.nomor_rw}
              </option>
            ))}
          </select>
          <select
            value={pilihanRt}
            onChange={(e) => setPilihanRt(e.target.value)}
            aria-label="Pilih RT"
            disabled={!pilihanRw}
            className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg px-3 py-2.5 font-body-sm text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
          >
            <option value="">RT (opsional)</option>
            {rtTersedia.map((rt) => (
              <option key={rt.id} value={rt.nomor_rt}>
                RT {rt.nomor_rt}
              </option>
            ))}
          </select>
        </div>

        <PilihLokasiPeta
          value={koordinat}
          onChange={setKoordinat}
          onLuarBatas={() =>
            toast.error("Lokasi di luar batas Kelurahan Tiro Sompe. Klik di dalam area yang disorot.")
          }
        />

        <p className="font-body-sm text-body-sm text-on-surface-variant">
          Klik langsung pada peta untuk menaruh pin lokasi kejadian. Area biru adalah
          batas Kelurahan Tiro Sompe — lokasi di luarnya tidak dapat dipilih.
          {koordinat && (
            <span className="block mt-1 font-code-sm text-code-sm text-outline">
              Pin: {koordinat.lat.toFixed(6)}, {koordinat.lng.toFixed(6)}
            </span>
          )}
        </p>
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
