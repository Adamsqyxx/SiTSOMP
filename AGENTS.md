# SiTSOMP — Next.js 16 + Supabase + Prisma

Sistem Informasi Terpadu Kelurahan Tiro Sompe (Kota Parepare, Sulawesi Selatan). Fullstack Next.js App Router: frontend + API routes dalam satu app.

## Stack (Verified & Running)

- **Frontend:** Next.js 16.3 (App Router, Turbopack) + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui
- **Mapping:** Leaflet.js 1.9.4 (`src/components/map/leaflet-map.tsx`, diakses via `next/dynamic` ssr:false)
- **Backend:** Next.js API Routes (fullstack, no separate server)
- **ORM:** Prisma 7.9.1 (ESM) + `@prisma/adapter-pg`; generated client di `src/generated/prisma`
- **Database:** Supabase PostgreSQL + PostGIS (live)
- **Auth:** Supabase Auth + @supabase/ssr — **terintegrasi** (login/logout/me/register + middleware)
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
    supabase-client.ts    # Browser client (ANON_KEY)
    supabase-server.ts    # Server client + updateSession (middleware)
    supabase-admin.ts     # Admin client (SERVICE_ROLE_KEY)
  middleware.ts           # Session refresh + proteksi route
prisma/
  schema.prisma           # 15 models, 10 enums; output → src/generated/prisma
  config.ts → prisma.config.ts  # Config CLI (root), baca .env
```

**Import alias:** `@/*` → `src/*`

## Setup (Env)

Runtime Next.js membaca **`.env.local`**; **Prisma CLI (db push/generate) membaca `.env`** via `prisma.config.ts`. Kedua file harus sinkron.

```env
DATABASE_URL="postgresql://..."            # .env + .env.local
NEXT_PUBLIC_SUPABASE_URL="https://..."     # .env.local
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."     # .env.local
SUPABASE_SERVICE_ROLE_KEY="eyJ..."         # .env.local (server-only)
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

- Middleware (`src/middleware.ts`) refresh session tiap request via `updateSession`.
- Path terproteksi (redirect ke `/login?next=...`): `/dashboard`, `/peta`, `/layanan`.
- Sudah login → akses `/login`/`/register` diarahkan ke `/dashboard`.
- Registrasi memakai **email sintetis `<NIK>@sitsomp.id`** (form register tidak punya field email) — login pakai NIK tersebut sebagai identifier.
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
Required production env vars: `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server-only), `RESEND_API_KEY` + `FONNTE_API_KEY` (saat diimplementasikan).

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->