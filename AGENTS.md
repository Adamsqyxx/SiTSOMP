# SiTSOMP — Next.js 16 + Supabase + Prisma

Sistem Informasi Terpadu Kelurahan Tiro Sompe (Kota Parepare, Sulawesi Selatan). Fullstack Next.js App Router: frontend + API routes dalam satu app.

## Stack (Verified & Running)

- **Frontend:** Next.js 16.3 (App Router, Turbopack) + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui
- **Mapping:** Leaflet.js 1.9.4 (`src/components/map/leaflet-map.tsx`, diakses via `next/dynamic` ssr:false)
- **Backend:** Next.js API Routes (fullstack, no separate server)
- **ORM:** Prisma 7.9.1 (ESM) + `@prisma/adapter-pg`; generated client di `src/generated/prisma`
- **Database:** Supabase PostgreSQL + PostGIS (live)
- **Auth:** NextAuth (Auth.js) v5 beta (Credentials + JWT session) + bcryptjs — **menggantikan Supabase Auth** (register/login/logout/me/middleware)
- **Supabase:** HANYA untuk realtime peta (`supabase-realtime` subscribe di `leaflet-map.tsx`) + DB Postgres (Prisma). `@supabase/ssr` TIDAK dipakai lagi.
- **UI:** shadcn/ui + Lucide React + sonner (toast)

## Commands

```bash
npm run dev              # Dev server (localhost:3000)
npm run build            # Production build
npm start                # Run production server
npm run lint             # ESLint (flat config)
npx tsc --noEmit         # TypeScript check
npm run postinstall      # = prisma generate (jalan otomatis saat npm i)
npx prisma db push       # Sync schema ke DB (baca prisma.config.ts)
npx prisma studio        # GUI database (localhost:5555)
npx shadcn@latest add <name>
```

**Pre-commit check:**
```bash
npm run lint && npx tsc --noEmit && npm run build
```

## Project Layout

```
src/
  app/
    page.tsx              # Beranda
    login/ register/ profil/ dashboard/ data-penduduk/ pengaturan/
    layanan/surat/        # Daftar layanan + [slug] form pengajuan
    peta/ pengumuman/ pengaduan/
    kontak/ kebijakan-privasi/ peta-situs/
    api/
      auth/{login,logout,me,register}/route.ts
      fasilitas/ penduduk/ peta/batas/ layanan/ pengaduan/route.ts
  components/
    auth-buttons.tsx      # Tombol Masuk/Daftar (dipakai semua header)
    back-button.tsx       # Tombol Kembali (khusus halaman /profil)
    complaint-form.tsx, map/leaflet-map.tsx
    ui/                   # shadcn: button, input, label
  lib/
    prisma.ts             # PrismaClient singleton + pg.Pool (adapter)
    supabase-client.ts    # Browser client (realtime peta saja — ANON_KEY)
  auth.ts                 # NextAuth v5 config (Credentials + JWT)
  middleware.ts           # Proteksi route via auth()
  types/next-auth.d.ts    # Module augmentation Session/User/JWT
prisma/
  schema.prisma           # 15 models, 10 enums; output → src/generated/prisma
  config.ts → prisma.config.ts  # Config CLI (root), baca .env
```

**Import alias:** `@/*` → `src/*`

## Setup (Env)

Runtime Next.js membaca **`.env.local`**; **Prisma CLI (db push/generate) membaca `.env`** via `prisma.config.ts`. Kedua file harus sinkron.

```env
DATABASE_URL="postgresql://..."            # .env + .env.local
NEXT_PUBLIC_SUPABASE_URL="https://..."     # .env.local — realtime peta saja
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."     # .env.local — realtime peta saja
AUTH_SECRET="..."                          # .env.local — NextAuth JWT secret (openssl rand -base64 32)
```

## Conventions

- **ESLint:** Flat config (eslint.config.mjs); next/core-web-vitals + next/typescript
- **TypeScript strict:** semua file harus lolos `npx tsc --noEmit`
- **Imports:** `@/` aliases; hindari relative path antar direktori
- **Komponen:** `"use client"` hanya bila butuh interaktivitas; sertakan sintaks tsx yang valid untuk ikon dinamis (`{icon && <icon />}`)
- **Tailwind 4:** `@import "tailwindcss"` di globals.css
- **Header:** pola publik seragam (brand + nav Beranda/Layanan/Peta/Profil + AuthButtons); login/register full-screen tanpa header; halaman app (dashboard/data-penduduk/peta/pengaturan) pakai header publik, tanpa sidebar
- **Bahasa UI:** Indonesia; brand = **SiTSOMP**

## Auth & Protected Routes

- Auth: **NextAuth (Auth.js) v5 beta** — `src/auth.ts` (Credentials Provider + JWT session), route handler di `src/app/api/auth/[...nextauth]/route.ts`, secret `AUTH_SECRET`.
- Credentials: identifier bisa **NIK (16 digit), email, atau nomor HP** + password. Password di-hash `bcryptjs` di tabel `users.password_hash`. Akun lama (email sintetis `<NIK>@sitsomp.id`) tetap login via NIK-nya.
- Route API custom (tetap dipakai client): `/api/auth/me` (session), `/api/auth/login`, `/api/auth/logout`, `/api/auth/register` (buat user + hash).
- Middleware (`src/middleware.ts`) proteksi via `auth()`: `/dashboard`, `/peta`, `/layanan` tanpa session → redirect `/login?next=...`. Sudah login → `/login`/`/register` dialihkan ke `/dashboard`.
- Registrasi: NIK wajib, **email opsional** (nullable + unique), No HP unique. Login bisa NIK/email/No HP — lihat `authorize()` di `src/auth.ts`.
- `/profil` publik (tanpa proteksi); ambil data user dari `/api/auth/me`.

## Pitfalls

- **Jangan edit file di `src/generated/prisma`** — hasil generate; jalankan `npx prisma generate` untuk regenerasi.
- **Prisma CLI tidak membaca `.env.local`** — kalau `db push` gagal, pastikan `DATABASE_URL` ada di `.env`.
- **Supabase pooler:** pakai host `aws-0-ap-northeast-1` (Tokyo) **port 5432**; port 6543 membuat `db push` menggantung. Runtime butuh `pg.Pool` eksplisit + `ssl: { rejectUnauthorized: false }` (lihat `src/lib/prisma.ts`) — connection string saja → error SASL.
- **Realtime:** untuk tabel tertentu, `alter publication supabase_realtime add table <tbl>;` di Supabase SQL.
- Leaflet butuh `window` → komponen wajib `next/dynamic(..., { ssr: false })`.
- Middleware Next 16: konvensi `middleware` deprecated → migrasi `npx @next/codemod@canary middleware-to-proxy .` (belum dilakukan).

## Troubleshooting

**Port 3000 in use:**
```bash
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Changes not reflecting:**
```bash
rm -r .next
npm run dev
```

**Prisma out of sync:**
```bash
npx prisma generate
npx prisma db push
```

## Documentation

- `prd2.md` — Product requirements · `DESIGN.md` — Design system
- `README.md` · `QA_REPORT.md` · `SUPABASE_SETUP.md` · `SESSION_COMPLETE.md`

## Deployment

**Primary:** Vercel (`vercel-build` script = `prisma generate && next build`).
Required production env vars: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (realtime peta), `AUTH_SECRET`, `RESEND_API_KEY` + `FONNTE_API_KEY` (saat diimplementasikan).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->