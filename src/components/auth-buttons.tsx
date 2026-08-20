"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";

interface AuthUser {
  id?: string;
  email?: string | null;
  nama_lengkap?: string | null;
  role?: string | null;
}

/**
 * Tombol autentikasi re-usable untuk header halaman publik.
 * - Belum login  -> tombol "Masuk" + "Daftar"
 * - Sudah login  -> avatar + nama user (link ke /dashboard) + tombol "Keluar"
 */
export default function AuthButtons({
  className,
  stacked = false,
}: {
  className?: string;
  stacked?: boolean;
}) {
  const router = useRouter();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => setUser(d.user ?? null))
      .catch(() => setUser(null))
      .finally(() => setReady(true));
  }, []);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.push("/login");
      router.refresh();
    }
  };

  if (!ready) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 animate-pulse",
          stacked && "flex-col",
          className
        )}
      >
        <div className="h-9 w-24 rounded-full bg-surface-container-low" />
        <div className="h-9 w-20 rounded-full bg-surface-container-low" />
      </div>
    );
  }

  if (user) {
    return (
      <div
        className={cn("flex items-center gap-2", stacked && "flex-col w-full", className)}
      >
        <Link
          href="/dashboard"
          title={user.email ?? "Dashboard"}
          className={cn(
            "flex items-center gap-2 pl-1 pr-3 py-1.5 rounded-full border border-outline-variant hover:bg-surface-container-low transition-colors",
            stacked && "w-full px-3"
          )}
        >
          <span className="w-7 h-7 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center text-label-sm font-bold shrink-0">
            {(user.nama_lengkap || user.email || "?").trim().slice(0, 2).toUpperCase()}
          </span>
          <span className="text-label-md text-on-surface truncate max-w-[140px]">
            {user.nama_lengkap || "Akun Saya"}
          </span>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          aria-label="Keluar"
          title="Keluar"
          className={cn(
            "flex items-center justify-center gap-2 p-2 rounded-full text-on-surface-variant hover:bg-error-container/60 hover:text-on-error-container transition-colors",
            stacked && "w-full border border-outline-variant font-label-md text-label-md"
          )}
        >
          <LogOut aria-hidden="true" className="w-5 h-5" />
          {stacked && <span>Keluar</span>}
        </button>
      </div>
    );
  }

  return (
    <div
      className={cn("flex items-center gap-2", stacked && "flex-col w-full", className)}
    >
      <Link
        href="/login"
        className={cn(
          "flex items-center justify-center gap-1.5 px-4 py-2 rounded-full border border-outline-variant text-on-surface-variant hover:bg-surface-container-low hover:text-primary font-label-md text-label-md transition-colors",
          stacked && "w-full"
        )}
      >
        <LogIn aria-hidden="true" className="w-4 h-4 shrink-0" />
        Masuk
      </Link>
      <Link
        href="/register"
        className={cn(
          "flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm",
          stacked && "w-full"
        )}
      >
        <UserPlus aria-hidden="true" className="w-4 h-4 shrink-0" />
        Daftar
      </Link>
    </div>
  );
}