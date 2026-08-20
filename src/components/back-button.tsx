"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  /** Tujuan fallback saat tidak ada riwayat navigasi sebelumnya. Default: beranda. */
  fallbackHref?: string;
  label?: string;
  className?: string;
}

/**
 * Tombol kembali konsisten untuk semua halaman SiTSOMP.
 * Mencoba router.back() terlebih dahulu; jika tidak ada riwayat
 * (halaman dibuka langsung / deep-link), arahkan ke fallbackHref.
 */
export default function BackButton({
  fallbackHref = "/",
  label = "Kembali",
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
      className={cn(
        "inline-flex items-center gap-2 font-label-md text-label-md text-on-surface-variant hover:text-primary transition-colors",
        className
      )}
    >
      <ArrowLeft aria-hidden="true" className="w-4 h-4" />
      {label}
    </button>
  );
}