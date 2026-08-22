"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  /** Tujuan fallback saat tidak ada riwayat navigasi sebelumnya. Default: beranda. */
  fallbackHref?: string;
  className?: string;
}

/**
 * Tombol kembali konsisten untuk semua halaman SiTSOMP (ikon saja, tanpa teks).
 * Mencoba router.back() terlebih dahulu; jika tidak ada riwayat
 * (halaman dibuka langsung / deep-link), arahkan ke fallbackHref.
 */
export default function BackButton({
  fallbackHref = "/",
  className,
}: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Kembali"
      title="Kembali"
      className={cn(
        "inline-flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-full p-2 transition-colors",
        className
      )}
    >
      <ArrowLeft aria-hidden="true" className="w-5 h-5" />
    </button>
  );
}