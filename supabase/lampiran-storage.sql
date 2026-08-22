-- Setup Storage untuk lampiran pengajuan surat.
-- Referensi: src/lib/lampiran.ts (LAMPIRAN_BUCKET = "lampiran-surat")
--
-- Cara pakai:
-- 1. Dashboard Supabase → Storage → New bucket
--    Nama: lampiran-surat  |  Public bucket: YES
--    (atau jalankan SQL di bawah via SQL Editor)
-- 2. Jalankan policy INSERT + SELECT di bawah.
--
-- Catatan: insert ke storage.buckets hanya bisa oleh service_role /
-- dashboard owner — kalau SQL Editor menolak, buat bucket manual lewat UI.

insert into storage.buckets (id, name, public)
values ('lampiran-surat', 'lampiran-surat', true)
on conflict (id) do update set public = true;

-- Siapa pun boleh upload lampiran (form pengajuan dipakai warga login
-- via NextAuth, TAPI upload dari browser pakai anon key — bukan Supabase Auth).
create policy "anon dapat upload lampiran"
on storage.objects for insert
to anon
with check (bucket_id = 'lampiran-surat');

-- URL publik bisa dibaca staf kelurahan saat verifikasi berkas.
create policy "publik dapat baca lampiran"
on storage.objects for select
to anon
using (bucket_id = 'lampiran-surat');
