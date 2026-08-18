import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Kebijakan Privasi",
};

export default function KebijakanPrivasiPage() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex flex-col">
      <header className="bg-surface fixed top-0 w-full z-50 border-b border-outline-variant">
        <div className="flex justify-between items-center h-16 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
          <Link href="/" className="font-headline-md text-headline-md font-bold text-primary">
            SiTSOMP
          </Link>
          <Link href="/" className="font-label-md text-label-md text-primary hover:underline">
            ← Kembali ke Beranda
          </Link>
        </div>
      </header>

      <main className="flex-grow pt-24 pb-16 px-margin-mobile md:px-margin-desktop max-w-3xl mx-auto w-full">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-full bg-primary-container text-primary flex items-center justify-center">
            <ShieldCheck aria-hidden="true" className="w-6 h-6" />
          </div>
          <h1 className="font-headline-lg text-headline-lg font-bold text-on-surface">
            Kebijakan Privasi
          </h1>
        </div>

        <div className="space-y-6 text-on-surface-variant font-body-md text-body-md leading-relaxed">
          <section>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">1. Data yang Dikumpulkan</h2>
            <p>
              Sistem Informasi Kelurahan Tiro Sompe (SiTSOMP) mengumpulkan data pribadi yang Anda
              berikan saat mendaftar dan mengajukan layanan, antara lain NIK, nama lengkap, nomor
              telepon, dan data pendukung lainnya yang diperlukan untuk pemrosesan surat.
            </p>
          </section>
          <section>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">2. Penggunaan Data</h2>
            <p>
              Data digunakan untuk memverifikasi identitas, memproses permohonan surat, memberikan
              notifikasi, dan meningkatkan layanan administrasi kelurahan. Data tidak akan
              diperjualbelikan atau digunakan di luar kepentingan pelayanan publik.
            </p>
          </section>
          <section>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">3. Keamanan</h2>
            <p>
              Kami menerapkan langkah keamanan teknis dan organisasi yang wajar, termasuk enkripsi
              saat transmisi data, untuk melindungi informasi Anda dari akses yang tidak sah.
            </p>
          </section>
          <section>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">4. Hak Anda</h2>
            <p>
              Anda berhak mengakses, memperbaiki, atau menghapus data pribadi Anda dengan menghubungi
              kantor kelurahan melalui halaman <Link href="/kontak" className="text-primary hover:underline">Kontak Kami</Link>.
            </p>
          </section>
          <section>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2">5. Perubahan Kebijakan</h2>
            <p>
              Kebijakan ini dapat diperbarui sewaktu-waktu. Perubahan akan diumumkan melalui halaman
              pengumuman resmi kelurahan.
            </p>
          </section>
        </div>
      </main>

      <footer className="bg-surface-container-lowest w-full mt-auto border-t border-outline-variant">
        <div className="py-8 px-margin-mobile md:px-margin-desktop max-w-max-width mx-auto">
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            © 2024 Pemerintah Kelurahan Tiro Sompe. Seluruh Hak Cipta Dilindungi.
          </p>
        </div>
      </footer>
    </div>
  );
}