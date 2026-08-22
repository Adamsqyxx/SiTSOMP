-- ============================================================
-- SiTSOMP — Bucket lampiran pengajuan surat (Supabase Storage)
-- ============================================================
-- Jalankan di Supabase SQL Editor (Dashboard > SQL > New query).
-- Bucket dibuat PUBLIC agar URL bisa dibuka staf kelurahan tanpa auth.
-- RLS mengizinkan ANON upload (insert) — wajib karena frontend pakai
-- anon key (tidak ada service-role key di env). Siapa pun bisa upload,
-- tapi TIDAK bisa list/delete/update (policy cuma INSERT).
-- Path file: <userId>/<slug>/<timestamp>-<random>-<namaFile> (unik, tidak
-- bisa ditebak), sehingga tabrakan/overwrite antar warga kecil kemungkinannya.

-- 1) Buat bucket (abaikan error kalau sudah ada)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lampiran-surat',
  'lampiran-surat',
  true,
  5242880, -- 5 MB
  array['image/jpeg','image/png','image/webp','application/pdf']
)
on conflict (id) do update
  set public = true,
      file_size_limit = 5242880,
      allowed_mime_types = array['image/jpeg','image/png','image/webp','application/pdf'];

-- 2) Pastikan RLS aktif di storage.objects
alter table storage.objects enable row level security;

-- 3) Izinkan ANON (dan user login) INSERT ke bucket ini.
--    Path diawali userId agar warga cuma bisa tulis ke foldernya sendiri.
drop policy if exists "lampiran_anon_insert" on storage.objects;
create policy "lampiran_anon_insert" on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'lampiran-surat'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- 4) Izinkan publik (termasuk staf) SELECT/READ file (bucket public).
drop policy if exists "lampiran_public_read" on storage.objects;
create policy "lampiran_public_read" on storage.objects
  for select
  to anon, authenticated
  using ( bucket_id = 'lampiran-surat' );

-- Catatan: tidak ada policy UPDATE/DELETE → warga tidak bisa ubah/hapus
-- file orang lain maupun miliknya sendiri setelah terunggah.
