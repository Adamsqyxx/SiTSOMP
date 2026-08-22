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
  { label: "Layanan", href: "/layanan/surat", icon: FileText, exact: false },
  { label: "Peta", href: "/peta", icon: Map, exact: false },
  { label: "Pengumuman", href: "/pengumuman", icon: Megaphone, exact: false },
  { label: "Profil", href: "/profil", icon: User, exact: false },
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, exact: false },
] as const;

export default function AppHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  const navLinks = (mobile: boolean) =>
    NAV.map((item) => {
      const active = isActive(item.href, item.exact);
      return (
        <Link
          key={item.href}
          href={item.href}
          onClick={() => setOpen(false)}
          className={cn(
            "transition-colors",
            mobile
              ? "flex items-center gap-3 px-3 py-2.5 rounded-xl font-label-md text-label-md " +
                  (active
                    ? "bg-primary-container text-on-primary-container"
                    : "text-on-surface-variant hover:bg-surface-container-high")
              : "font-label-md text-label-md " +
                  (active
                    ? "text-primary font-semibold border-b-2 border-primary pb-1"
                    : "text-on-surface-variant hover:text-primary")
          )}
        >
          {mobile && <item.icon aria-hidden="true" className="w-5 h-5 shrink-0" />}
          {item.label}
        </Link>
      );
    });

  return (
    <>
      <header className="bg-surface fixed top-0 w-full z-50 border-b border-outline-variant transition-colors duration-200">
        <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop z-50 max-w-max-width mx-auto">
          <div className="flex items-center gap-3">
            <BackButton className="-ml-2" />
            <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">
              SiTSOMP
            </Link>
            <nav className="hidden lg:flex gap-6 items-center ml-2">
              {navLinks(false)}
            </nav>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <AuthButtons className="hidden md:flex" />
            <button
              type="button"
              aria-label="Buka menu"
              onClick={() => setOpen(true)}
              className="lg:hidden text-on-surface-variant hover:bg-surface-container-low rounded-full p-2"
            >
              <Menu aria-hidden="true" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile / tablet drawer */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-[60]" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <nav className="absolute left-0 top-0 h-full w-64 bg-surface flex flex-col shadow-xl pt-4">
            <div className="flex items-center justify-between px-4 h-12 mb-2">
              <span className="font-headline-sm text-headline-sm font-bold text-primary">Menu</span>
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
              {navLinks(true)}
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
