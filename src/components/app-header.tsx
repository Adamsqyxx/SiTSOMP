"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, FileText, Map, Megaphone, User, LayoutDashboard, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import AuthButtons from "@/components/auth-buttons";

const NAV = [
  { label: "Beranda", href: "/", icon: Home, exact: true },
  { label: "Layanan", href: "/layanan/surat", icon: FileText, exact: false },
  { label: "Peta", href: "/peta", icon: Map, exact: false },
  { label: "Pengumuman", href: "/pengumuman", icon: Megaphone, exact: false },
  { label: "Profil", href: "/profil", icon: User, exact: false },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: false },
] as const;

type NavMode = "drawer" | "sidebar";

export default function AppHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const navLinks = (mode: NavMode) =>
    NAV.map((item) => {
      const active = isActive(item.href, item.exact);
      const base =
        "group flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-label-md transition-colors ";
      const state = active
        ? "bg-primary-container text-on-primary-container"
        : "text-on-surface-variant hover:bg-surface-container-high hover:text-primary";
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={cn(base, state)}
        >
          <item.icon
            aria-hidden="true"
            className={cn(
              "w-5 h-5 shrink-0 transition-colors",
              active
                ? "text-on-primary-container"
                : "text-on-surface-variant group-hover:text-primary"
            )}
          />
          {item.label}
        </Link>
      );
    });

  return (
    <>
      {/* Persistent sidebar (lg+) */}
      <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-64 bg-surface border-r border-outline-variant z-50">
        <div className="h-16 flex items-center px-5 border-b border-outline-variant">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">
            SiTSOMP
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-3 flex-1 overflow-y-auto">
          {navLinks("sidebar")}
        </nav>
        <div className="p-3 border-t border-outline-variant">
          <AuthButtons stacked />
        </div>
      </aside>

      {/* Mobile / tablet hamburger + drawer (<lg) */}
      <button
        type="button"
        aria-label="Buka menu"
        onClick={() => setOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-[55] bg-surface border border-outline-variant text-on-surface-variant hover:bg-surface-container-low rounded-full p-2 shadow-sm"
      >
        <Menu aria-hidden="true" className="w-5 h-5" />
      </button>

      {open && (
        <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav className="absolute left-0 top-0 h-full w-64 bg-surface flex flex-col shadow-xl pt-4">
            <div className="flex items-center justify-between px-4 h-12 mb-2">
              <span className="font-headline-sm text-headline-sm font-bold text-primary">
                Menu
              </span>
              <button
                type="button"
                aria-label="Tutup menu"
                onClick={() => setOpen(false)}
                className="text-on-surface-variant hover:bg-surface-container-low rounded-full p-2"
              >
                <X aria-hidden="true" className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col gap-1 px-3 overflow-y-auto flex-1">
              {navLinks("drawer")}
            </div>
            <div className="p-3 border-t border-outline-variant">
              <AuthButtons stacked />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
