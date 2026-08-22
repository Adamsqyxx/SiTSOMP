"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  FileText,
  Map,
  Megaphone,
  User,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import AuthButtons from "@/components/auth-buttons";
import BackButton from "@/components/back-button";

const NAV = [
  { label: "Beranda", href: "/", icon: Home, exact: true },
  { label: "Layanan", href: "/layanan/surat", icon: FileText },
  { label: "Peta", href: "/peta", icon: Map },
  { label: "Pengumuman", href: "/pengumuman", icon: Megaphone },
  { label: "Profil", href: "/profil", icon: User },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
] as const;

export default function AppSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const navList = (
    <nav className="flex flex-col gap-1 px-3">
      {NAV.map((item) => {
        const active = isActive(item.href, item.exact);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-label-md transition-colors",
              active
                ? "bg-primary-container text-on-primary-container"
                : "text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            <item.icon aria-hidden="true" className="w-5 h-5 shrink-0" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  const authArea = (
    <div className="p-3 border-t border-outline-variant">
      <AuthButtons stacked />
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 h-screen w-64 bg-surface border-r border-outline-variant z-40">
        <div className="flex items-center justify-between h-16 px-4 border-b border-outline-variant">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">
            SiTSOMP
          </Link>
          <BackButton className="-mr-2" />
        </div>
        <div className="flex-1 overflow-y-auto py-4">{navList}</div>
        {authArea}
      </aside>

      {/* Mobile top bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-surface border-b border-outline-variant z-50 flex items-center justify-between px-3">
        <div className="flex items-center gap-1">
          <BackButton className="-ml-2" />
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">
            SiTSOMP
          </Link>
        </div>
        <button
          type="button"
          aria-label="Buka menu"
          onClick={() => setOpen(true)}
          className="text-on-surface-variant hover:bg-surface-container-low rounded-full p-2"
        >
          <Menu aria-hidden="true" className="w-5 h-5" />
        </button>
      </header>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <aside className="absolute left-0 top-0 h-full w-64 bg-surface flex flex-col shadow-xl">
            <div className="flex items-center justify-between h-16 px-4 border-b border-outline-variant">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="font-headline-md text-headline-md font-bold text-primary"
              >
                SiTSOMP
              </Link>
              <button
                type="button"
                aria-label="Tutup menu"
                onClick={() => setOpen(false)}
                className="text-on-surface-variant hover:bg-surface-container-low rounded-full p-2"
              >
                <X aria-hidden="true" className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-4">{navList}</div>
            {authArea}
          </aside>
        </div>
      )}
    </>
  );
}
