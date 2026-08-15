'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Eye, EyeOff, Lock, Mail, LogIn, Building2 } from 'lucide-react';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: '',
    password: '',
  });
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // TODO: Integrate with Supabase Auth
      // const { data, error } = await supabase.auth.signInWithPassword({
      //   email: formData.identifier,
      //   password: formData.password,
      // });

      // if (error) throw error;

      console.log('Login attempt:', formData);
      // router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal. Silakan coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="bg-surface min-h-screen flex flex-col">
      {/* TopAppBar */}
      <header className="bg-surface border-b border-outline-variant w-full sticky top-0 z-50">
        <div className="flex items-center justify-between px-margin-mobile md:px-margin-desktop h-16 w-full max-w-max-width mx-auto">
          <div className="flex items-center gap-2">
            <Building2 className="w-6 h-6 text-primary" />
            <h1 className="font-headline-md text-headline-md font-bold text-primary">
              SiTSOMP
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="grow flex items-center justify-center p-margin-mobile md:p-margin-desktop w-full">
        <div className="w-full max-w-md bg-surface-container-lowest rounded-xl border border-border-subtle p-6 md:p-8 shadow-sm">
          {/* Header */}
          <div className="mb-8 text-center">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-2">
              Selamat Datang
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Silakan masuk ke akun SiTSOMP Anda.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-error-container rounded-lg border border-error">
              <p className="text-error font-body-sm text-body-sm">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* NIK/Email Input */}
            <div className="space-y-2">
              <Label htmlFor="identifier" className="font-label-md text-label-md text-on-surface">
                NIK / Email
              </Label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <Input
                  id="identifier"
                  name="identifier"
                  type="text"
                  placeholder="Masukkan NIK atau Email"
                  value={formData.identifier}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="pl-10 pr-4 py-3 font-body-md text-body-md border-border-subtle bg-surface focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="font-label-md text-label-md text-on-surface">
                Kata Sandi
              </Label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan Kata Sandi"
                  value={formData.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  required
                  className="pl-10 pr-10 py-3 font-body-md text-body-md border-border-subtle bg-surface focus:border-primary focus:ring-1 focus:ring-primary"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors disabled:opacity-50"
                  aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="flex justify-end">
              <Link
                href="/forgot-password"
                className="font-label-sm text-label-sm text-primary hover:text-primary-container transition-colors"
              >
                Lupa Kata Sandi?
              </Link>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-on-primary font-label-md text-label-md py-3 rounded-lg hover:bg-primary-container active:bg-primary-fixed-variant transition-colors flex justify-center items-center gap-2"
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
              <LogIn className="w-5 h-5" />
            </Button>
          </form>

          {/* Registration Link */}
          <div className="mt-6 text-center">
            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Belum punya akun?{' '}
              <Link
                href="/register"
                className="font-label-md text-label-md text-primary hover:text-primary-container transition-colors"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
