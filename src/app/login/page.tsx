"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Info, Lock, LogIn, ShieldCheck, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/back-button";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const id = identifier.trim();
    const pw = password;
    if (!id || !pw) {
      setError("NIK/Email dan kata sandi wajib diisi.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: id, password: pw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Gagal masuk. Coba lagi.");
        return;
      }
      const next = new URLSearchParams(window.location.search).get("next") ?? "/dashboard";
      router.push(next);
      router.refresh();
    } catch {
      setError("Terjadi kesalahan jaringan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col justify-center items-center relative overflow-hidden font-body-md">
      {/* Background decor: gradient brand + pola titik halus */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/40 via-surface to-secondary-fixed/20 z-0" />
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#003f87 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Main login card */}
      <main className="relative z-10 w-full max-w-md p-8 md:p-10 bg-surface-container-lowest rounded-xl shadow-lg border border-border-subtle flex flex-col mx-margin-mobile">
        <BackButton fallbackHref="/" className="self-start mb-2 -ml-1" />
        {/* Brand header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary-container rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck aria-hidden="true" className="w-8 h-8 text-primary" />
          </div>
          <Link href="/" className="font-headline-lg text-headline-lg text-primary tracking-tight">
            SiTSOMP
          </Link>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">
            Sistem Informasi Kelurahan Tiro Sompe
          </p>
        </div>

        {/* Login form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* NIK / Email */}
          <div className="space-y-2">
            <label
              className="block font-label-md text-label-md text-on-surface"
              htmlFor="identifier"
            >
              NIK atau Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User aria-hidden="true" className="w-5 h-5 text-outline" />
              </div>
              <input
                className="block w-full pl-10 pr-3 py-3 bg-surface-muted border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors outline-none"
                id="identifier"
                name="identifier"
                placeholder="Masukkan NIK (16 digit) atau email Anda"
                required
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label
                className="block font-label-md text-label-md text-on-surface"
                htmlFor="password"
              >
                Kata Sandi
              </label>
              {/* TODO: route lupa sandi saat tersedia */}
              <span
                className="font-label-sm text-label-sm text-outline cursor-not-allowed"
                title="Fitur belum tersedia"
              >
                Lupa Sandi?
              </span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock aria-hidden="true" className="w-5 h-5 text-outline" />
              </div>
              <input
                className="block w-full pl-10 pr-10 py-3 bg-surface-muted border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface focus:ring-1 focus:ring-primary focus:border-primary transition-colors outline-none"
                id="password"
                name="password"
                placeholder="Masukkan kata sandi Anda"
                required
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff aria-hidden="true" className="w-5 h-5" />
                ) : (
                  <Eye aria-hidden="true" className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit action */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-full shadow-sm h-auto disabled:opacity-60"
          >
            <span className="font-label-md text-label-md text-on-primary">
              {loading ? "Memproses..." : "Masuk ke Sistem"}
            </span>
            <LogIn aria-hidden="true" className="w-[18px] h-[18px]" />
          </Button>

          {error && (
            <div
              role="alert"
              className="bg-error-container text-on-error-container px-4 py-3 rounded-lg border border-error-container font-body-sm text-body-sm"
            >
              {error}
            </div>
          )}
        </form>

        {/* Alternative action */}
        <div className="mt-8 pt-6 border-t border-border-subtle text-center">
          <p className="font-body-md text-body-md text-on-surface-variant">
            Belum punya akun?{" "}
            <Link
              href="/register"
              className="font-label-md text-label-md text-primary hover:text-on-primary-fixed-variant hover:underline transition-colors ml-1"
            >
              Daftar di sini
            </Link>
          </p>
        </div>

        {/* Information / support */}
        <div className="mt-8 pt-6 border-t border-border-subtle">
          <div className="flex items-start gap-3 bg-surface-container-low p-3 rounded-lg border border-outline-variant/30">
            <Info aria-hidden="true" className="w-5 h-5 text-info mt-0.5" />
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Gunakan NIK (Nomor Induk Kependudukan) Anda untuk masuk — sama
              seperti saat mendaftar. Jika mengalami kendala, hubungi kantor
              kelurahan.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="absolute bottom-6 w-full text-center z-10 px-margin-mobile">
        <p className="font-label-sm text-label-sm text-on-surface-variant">
          © {new Date().getFullYear()} Pemerintah Kelurahan Tiro Sompe. Seluruh Hak Cipta Dilindungi.
        </p>
      </footer>
    </div>
  );
}
