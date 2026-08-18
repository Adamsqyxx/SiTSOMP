"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Building2,
  Eye,
  EyeOff,
  IdCard,
  Info,
  Lock,
  Smartphone,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Form state untuk registrasi; koneksi ke Supabase Auth menunggu kredensial.
const INITIAL_FORM = {
  nik: "",
  fullname: "",
  contact: "",
  password: "",
  terms: false,
};

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setField = (field: keyof typeof INITIAL_FORM, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Email belum ada di form; NIK dianggap sebagai email placeholder tidak valid.
    // Untuk sekarang gunakan NIK + domain dummy? TIDAK — NIK bukan email.
    // Ganti pendekatan: butuh email sebagai identifier Supabase.
    // Untuk MVP, user bisa login pakai email. Karena form tidak punya email,
    // kita jadikan NIK sebagai email sintetis <nik>@sitsomp.id sehingga
    // Supabase Auth dapat dibuat & login bisa memakainya.
    const email = `${form.nik}@sitsomp.id`;

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: form.password,
          nik: form.nik,
          nama_lengkap: form.fullname,
          nomor_hp: form.contact,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal mendaftar. Coba lagi.");
        return;
      }
      // Registrasi sukses — arahkan ke login
      router.push("/login?registered=1");
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-background text-on-background min-h-screen w-full antialiased flex">
      {/* LEFT PANEL: Context & Branding (hidden lg) */}
      <section className="hidden lg:flex lg:w-5/12 bg-surface-container-low relative flex-col justify-between p-12 border-r border-outline-variant overflow-hidden">
        {/* Decorative background */}
        <div
          aria-hidden="true"
          className="absolute inset-0 z-0 opacity-[0.15] bg-cover bg-center"
          style={{
            backgroundImage:
              "url(https://lh3.googleusercontent.com/aida-public/AB6AXuBXfvfd6sJs5jrqqZeZzImp0HOMYWBZuSoOUc10k1wS8XDMDhRGUvQEbkqXGIA7VFCgTOpAlLC7RkSfKbB_NYiDaRsVkC030zn6zo2CbiG1_go1my4ktN4UbDr5N8-cDW5eIPR0_F5SmIpmizjVDIZiaDcCmV5geSqsimu74y1jCVeyIyN-eo9N7TbfpdNj2rZV-MsIyE7SEQZfoPt-YKo8X5bBZucKLS6_orjBobR3B1RinE5rRbNM1Q)",
          }}
        />
        {/* Branding header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-sm">
              <Building2 aria-hidden="true" className="w-5 h-5 text-on-primary" />
            </div>
            <h1 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">
              SiTSOMP
            </h1>
          </div>
          <h2 className="font-headline-md text-headline-md text-on-surface mb-4 max-w-sm">
            Portal Layanan Terpadu Kelurahan Tiro Sompe
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-sm leading-relaxed">
            Wujudkan akses administratif yang transparan, cepat, dan terpercaya.
            Daftar untuk mulai mengelola dokumen kependudukan Anda secara digital.
          </p>
        </div>
        {/* Trust indicator */}
        <div className="relative z-10 flex items-center gap-3 text-on-surface-variant bg-surface-container/50 p-4 rounded-xl backdrop-blur-sm border border-outline-variant/30">
          <BadgeCheck aria-hidden="true" className="w-6 h-6 text-primary shrink-0" />
          <div>
            <p className="font-label-md text-label-md text-on-surface">Data Dilindungi</p>
            <p className="font-body-sm text-body-sm">
              Sistem ini menggunakan standar keamanan enkripsi data tingkat lanjut.
            </p>
          </div>
        </div>
      </section>

      {/* RIGHT PANEL: Registration form */}
      <section className="w-full lg:w-7/12 bg-surface-container-lowest flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-[480px]">
          {/* Mobile branding */}
          <div className="lg:hidden flex flex-col items-center mb-8 text-center">
            <div className="w-12 h-12 bg-primary-container rounded-full flex items-center justify-center mb-3">
              <Building2 aria-hidden="true" className="w-6 h-6 text-on-primary-container" />
            </div>
            <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">
              SiTSOMP
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
              Portal Layanan Kelurahan
            </p>
          </div>

          {/* Form header */}
          <div className="mb-8">
            <h2 className="font-headline-md text-headline-md text-on-surface font-semibold mb-2">
              Pendaftaran Akun Baru
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Lengkapi informasi di bawah ini sesuai dengan Kartu Tanda Penduduk (KTP) Anda.
            </p>
          </div>

          {/* Registration form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* NIK */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="nik">
                Nomor Induk Kependudukan (NIK)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <IdCard aria-hidden="true" className="w-5 h-5 text-outline-variant" />
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface font-code-md text-code-md placeholder:text-outline placeholder:font-body-md focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
                  id="nik"
                  maxLength={16}
                  name="nik"
                  pattern="\d{16}"
                  placeholder="16 Digit NIK"
                  required
                  type="text"
                  value={form.nik}
                  onChange={(e) => setField("nik", e.target.value)}
                  aria-describedby="nik-helper"
                />
              </div>
              <p className="font-label-sm text-label-sm text-outline flex items-center gap-1 mt-1" id="nik-helper">
                <Info aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
                Pastikan NIK terdaftar di wilayah Kelurahan Tiro Sompe.
              </p>
            </div>

            {/* Full name */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="fullname">
                Nama Lengkap
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User aria-hidden="true" className="w-5 h-5 text-outline-variant" />
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
                  id="fullname"
                  name="fullname"
                  placeholder="Sesuai KTP"
                  required
                  type="text"
                  value={form.fullname}
                  onChange={(e) => setField("fullname", e.target.value)}
                />
              </div>
            </div>

            {/* Contact */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="contact">
                Nomor Telepon / WhatsApp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Smartphone aria-hidden="true" className="w-5 h-5 text-outline-variant" />
                </div>
                <input
                  className="block w-full pl-11 pr-4 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
                  id="contact"
                  name="contact"
                  placeholder="Contoh: 08123456789"
                  required
                  type="tel"
                  value={form.contact}
                  onChange={(e) => setField("contact", e.target.value)}
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="block font-label-md text-label-md text-on-surface" htmlFor="password">
                Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock aria-hidden="true" className="w-5 h-5 text-outline-variant" />
                </div>
                <input
                  className="block w-full pl-11 pr-12 py-3 bg-surface border border-outline-variant rounded-lg text-on-surface font-body-md text-body-md placeholder:text-outline focus:border-primary focus:ring-1 focus:ring-primary transition-colors outline-none"
                  id="password"
                  minLength={8}
                  name="password"
                  placeholder="Minimal 8 karakter"
                  required
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setField("password", e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline-variant hover:text-on-surface transition-colors focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff aria-hidden="true" className="w-5 h-5" />
                  ) : (
                    <Eye aria-hidden="true" className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Terms & submit */}
            <div className="pt-4 space-y-6">
              <div className="flex items-start gap-3">
                <div className="flex items-center h-5 mt-0.5">
                  <input
                    className="w-4 h-4 text-primary bg-surface border-outline-variant rounded focus:ring-primary focus:ring-2"
                    id="terms"
                    name="terms"
                    required
                    type="checkbox"
                    checked={form.terms}
                    onChange={(e) => setField("terms", e.target.checked)}
                  />
                </div>
                <label className="font-body-sm text-body-sm text-on-surface-variant" htmlFor="terms">
                  Saya menyatakan bahwa data yang saya masukkan adalah benar dan saya menyetujui{" "}
                  <a className="text-primary hover:underline font-medium" href="#">
                    Syarat &amp; Ketentuan
                  </a>{" "}
                  serta{" "}
                  <a className="text-primary hover:underline font-medium" href="#">
                    Kebijakan Privasi
                  </a>{" "}
                  yang berlaku.
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center gap-2 py-3.5 px-4 rounded-lg h-auto disabled:opacity-60"
              >
                <span className="font-label-md text-label-md text-on-primary">
                  {loading ? "Mendaftarkan..." : "Buat Akun Sekarang"}
                </span>
                <ArrowRight aria-hidden="true" className="w-[18px] h-[18px]" />
              </Button>

              {error && (
                <div
                  role="alert"
                  className="bg-error-container text-on-error-container px-4 py-3 rounded-lg border border-error-container font-body-sm text-body-sm"
                >
                  {error}
                </div>
              )}
            </div>
          </form>

          {/* Alternative action */}
          <div className="mt-8 pt-6 border-t border-border-subtle text-center">
            <p className="font-body-md text-body-md text-on-surface-variant">
              Sudah memiliki akun?{" "}
              <Link
                href="/login"
                className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant hover:underline transition-colors ml-1"
              >
                Masuk di sini
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}