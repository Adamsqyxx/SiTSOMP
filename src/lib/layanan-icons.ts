import {
  BookOpen,
  Briefcase,
  Building2,
  CalendarCheck,
  CreditCard,
  FileText,
  GraduationCap,
  HandHeart,
  Heart,
  HelpCircle,
  Home,
  Info,
  Landmark,
  Lightbulb,
  MapPin,
  Package,
  Scale,
  ShieldCheck,
  Store,
  Truck,
  Users,
  type LucideIcon,
} from "lucide-react";

// Ikon preset untuk Kartu Layanan buatan admin. Admin memilih dari daftar
// ini di dashboard; DB hanya menyimpan nama ikon (string), lalu dipetakan
// ke komponen Lucide saat render. Aman: tidak ada akses dinamis ke objek
// ikon bebas — hanya key yang terdaftar di sini yang bisa dirender.
export const LAYANAN_ICONS: Record<string, LucideIcon> = {
  FileText,
  BookOpen,
  Briefcase,
  Building2,
  CalendarCheck,
  CreditCard,
  GraduationCap,
  HandHeart,
  Heart,
  HelpCircle,
  Home,
  Info,
  Landmark,
  Lightbulb,
  MapPin,
  Package,
  Scale,
  ShieldCheck,
  Store,
  Truck,
  Users,
};

// Urutan tampil di pemilih ikon admin.
export const ICON_CHOICES = Object.keys(LAYANAN_ICONS);

export function getLayananIcon(name: string | null | undefined): LucideIcon {
  return LAYANAN_ICONS[name ?? ""] ?? LAYANAN_ICONS.FileText;
}
