# Laporan Audit Fungsionalitas — SiTSOMP (19 Agu 2026)

Status dev server: jalan di http://localhost:3000 (Next 16.3, Turbopack).

## Ringkasan

Fitur "menu tidak berfungsi" — benar. Penyebab utama: hampir semua menu/navigasi
di-render sebagai `<a href="#">` dengan `onClick={(e) => e.preventDefault()}`,
jadi KLIK TIDAK MELAKUKAN APA-APA (ini "menu mati" yang dimaksud).
Selain itu ada bug nyata dan dependensi Opsional yang belum dikonfigurasi.

## Daftar temuan

### A. Kritis — menu/navigasi mati (semua halaman)

1. `/` (beranda)
   - Desktop nav: Beranda(#) aktif, Layanan → `href="#"`, Peta → `href="#"`,
     Profil → `href="#"` — semuanya preventDefault => mati.
   - Footer: Kontak Kami, Kebijakan Privasi, Portal Nasional, Peta Situs → `href="#"`.
   - Bento: kartu "Data Penduduk" → `href="#"`; kartu "Pengumuman" → `href="#"`.
   - Tombol Notifikasi (Bell) — tidak punya onClick.
2. `/layanan/surat`
   - Desktop nav + sidebar: semua `href="#"` preventDefault => mati.
   - Tombol aksi tiap kartu layanan ("Buat Pengajuan"/"Lihat Detail") — tidak punya
     onClick (mati).
   - Tombol Notifikasi — tidak punya onClick.
   - Footer links `href="#"`.
3. `/peta`
   - Sidebar 5 item semuanya `href="#"` preventDefault.
   - Tombol kategori fasilitas — tidak ada onClick (state `active` statis).
   - Tombol "Rute" (desktop panel + mobile card) — tidak ada onClick.
   - Tombol Notifikasi — tidak ada onClick.
4. `/dashboard`
   - Sidebar 5 item semua `href="#"`.
   - "Lihat Semua", tombol aksi baris (unduh/detail), "Lihat Semua Pengumuman",
     notifikasi — tidak ada onClick.
   - Konten 100% data statis (timeline, riwayat, pengumuman hardcode).

### B. Tinggi — kerusakan nyata

5. `/peta` — kategori filter salah: icon default `text-on-primary-container` (hampir
   putih di atas bg putih) untuk "Pendidikan", dan default `bg-primary-container`
   untuk item aktif tidak sesuai icon warna.
6. `/peta` — mobile drawer: `<nav>` punya `pt-16` + `SidebarContent` dengan header,
   hasilnya duplikasi header & konten tergeser. Juga `SidebarContent` tidak punya
   `mt-auto` footer saat desktop (footer "v1.0.2" menggantung di tengah).
7. `/dashboard` — blur/teks "AK" avatar statis; tidak menampilkan user asli login
   (padahal API /api/auth/me sudah ada).
8. `/layanan/surat` — setelah login, aksi masih mati; tidak ada alur pengajuan sama
   sekali (belum ada halaman `/layanan/surat/[id]` / form pengajuan).

### C. Sedang — auth / backend tidak berfungsi end-to-end

9. `SUPABASE_SERVICE_ROLE_KEY` KOSONG di `.env.local` => `/api/auth/register`
   selalu 500 "Registrasi belum tersedia". (Login anon juga belum bisa: tak ada akun
   terdaftar di Auth Supabase.)
10. Rate-limit email Supabase (429 over_email_send_rate_limit) menghalangi
    registrasi via API — perlu jeda atau konfigurasi.
11. `login` hanya menerima email — label "NIK atau Email" menyesatkan (register
    menggunakan email sintetis `<NIK>@sitsomp.id`, jadi login harus pakai email itu).

### D. Rendah — UX kecil

12. Footer link semua `href="#"`.
13. Notifikasi Bell di semua halaman tidak berfungsi (belum ada halaman notifikasi).
14. `/peta` kategori icon hover tidak ada transisi khusus; legenda "Jalan" tidak
    konsisten.
15. Belum ada halaman 404 khusus; Next default ok.

## Status dependensi eksternal

- Supabase project URL: `zimgdffmozscalbwtkcd.supabase.co` — reachable (401 =
  butuh auth, artinya endpoint hidup).
- `DATABASE_URL` pooler Tokyo: dipakai Prisma, /api/fasilitas jalan (data 5 fasilitas
  ada — seed OK).
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: terisi.
- `SUPABASE_SERVICE_ROLE_KEY`: KOSONG — blokir register.

## Rekomendasi prioritas

1. Isi SUPABASE_SERVICE_ROLE_KEY dari dashboard (Settings → API → service_role).
2. Aktifkan semua menu ke route nyata: `/`, `/layanan/surat`, `/peta`, `/dashboard`,
   `/data-penduduk`, `/pengaturan`, `/login`, `/register`.
3. Buat halaman minimal `/data-penduduk` & `/pengaturan` agar menu tidak dead-end.
4. Perbaiki filter kategori & tombol Rute di peta.
5. Wire tombol aksi layanan ke halaman detail/pengajuan (atau setidaknya beri umpan
   balik "sedang dikembangkan").
6. Tampilkan user asli di dashboard (via /api/auth/me) + tombol logout.