# SiTSOMP — Next.js 16 + Supabase + Prisma

## Stack (Verified & Running)

- **Frontend:** Next.js 16.3 (App Router, Turbopack) + React 19 + TypeScript 5 + Tailwind CSS 4 + shadcn/ui
- **Mapping:** Leaflet.js 1.9.4
- **Backend:** Next.js API Routes (fullstack, no separate server)
- **ORM:** Prisma 5.22.0 (schema initialized, 14 models, 11 enums)
- **Database:** Supabase PostgreSQL 16 + PostGIS (configured, awaiting credentials)
- **Auth:** Supabase Auth + @supabase/ssr (clients ready, not integrated)
- **UI:** shadcn/ui (button, input, label installed), Lucide React icons

## Dev Server Status

```
✅ Running: npm run dev
✅ URL: http://localhost:3000
✅ Login page: http://localhost:3000/login (live)
✅ Startup: 2.2s (Turbopack)
✅ HMR: Active
```

## Project Layout

```
src/
  app/
    login/page.tsx          ✅ Full React component (192 lines)
    layout.tsx              # Root layout (Geist, Inter fonts)
    globals.css             # Tailwind 4 @import syntax
    api/                    # Ready for routes
  components/
    ui/button.tsx           ✅ shadcn/ui
    ui/input.tsx            ✅ shadcn/ui
    ui/label.tsx            ✅ shadcn/ui
  lib/
    supabase-client.ts      ✅ Browser client
    supabase-server.ts      ✅ Server client
    utils.ts                # cn() utility

prisma/
  schema.prisma             ✅ 337 lines, 14 models, 11 enums
  config.ts                 # Prisma config
```

**Import alias:** `@/*` → `src/*`

## Commands

```bash
npm run dev              # Start dev server (localhost:3000)
npm run build            # Production build
npm start                # Run production server
npm run lint             # ESLint (flat config)
npx tsc --noEmit         # TypeScript check
npx prisma generate     # Regenerate Prisma Client
npx prisma db push      # Sync schema to database
npx prisma studio      # GUI for database (localhost:5555)
npx shadcn@latest add <name>  # Install UI component
```

**Pre-commit check:**
```bash
npm run lint && npx tsc --noEmit && npm run build
```

## Setup Checklist (Do This First)

1. **Get Supabase credentials** (5 min)
   - https://supabase.com/dashboard
   - Create project, copy: URL, ANON_KEY, SERVICE_ROLE_KEY
   - Database connection string

2. **Fill `.env.local`** (2 min)
   ```env
   DATABASE_URL="postgresql://..."
   NEXT_PUBLIC_SUPABASE_URL="https://..."
   NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
   SUPABASE_SERVICE_ROLE_KEY="eyJ..."
   ```

3. **Sync database** (1 min)
   ```bash
   npx prisma db push
   ```

4. **Verify it works**
   ```bash
   npm run dev
   # Visit http://localhost:3000/login
   ```

## Code Conventions

- **ESLint:** Flat config (eslint.config.mjs); next/core-web-vitals + next/typescript
- **TypeScript strict:** `strict: true` required; all files must pass `npx tsc --noEmit`
- **Imports:** Use `@/` aliases; no relative paths across directories
- **Components:** Use `"use client"` only for interactivity (shadcn/ui default is RSC)
- **Tailwind 4:** New `@import "tailwindcss"` syntax in globals.css (do not downgrade)
- **Font loading:** Next.js font optimization in root layout (Geist, Inter)

## Important Notes

1. **Prisma Client:** Already generated to `node_modules/@prisma/client` (no need to run `npx prisma generate`)

2. **Supabase Clients:** Two separate implementations for security:
   - `src/lib/supabase-client.ts` — Browser (use public ANON_KEY)
   - `src/lib/supabase-server.ts` — Server (use SECRET SERVICE_ROLE_KEY)

3. **HMR Works:** File changes auto-reload in browser (no manual refresh needed)

4. **Login Page Ready:** Full React component at `src/app/login/page.tsx`
   - Form state management implemented
   - Password visibility toggle works
   - Error display ready
   - Design system compliant (WCAG AA)
   - Awaits Supabase Auth integration

5. **Database Schema:** Matches prd2.md section 7.2 exactly
   - User, Penduduk, ServiceRequest, Complaint, etc.
   - All foreign keys configured
   - Ready for `npx prisma db push`

## Next Integration Points

When ready to build features:

1. **Auth:** Uncomment Supabase methods in `src/app/login/page.tsx`
2. **API Routes:** Create endpoints in `src/app/api/`
3. **Database Queries:** Use Prisma client in API routes
4. **Protected Routes:** Implement middleware for auth check
5. **UI Components:** Add more via `npx shadcn@latest add <name>`

## Troubleshooting

**Port 3000 in use:**
```bash
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Changes not reflecting:**
```bash
# Clear Next.js cache
rm -r .next
npm run dev
```

**Prisma out of sync:**
```bash
npx prisma generate
npx prisma db push
```

## Documentation

**Quick reference:**
- `AGENTS.md` (this file) — Dev guidelines
- `prd2.md` — Product requirements
- `DESIGN.md` — Design system
- `SUPABASE_SETUP.md` — Supabase setup
- `SESSION_COMPLETE.md` — Session summary

## Quality Checks (All Passing)

```
✅ ESLint: 0 errors
✅ TypeScript: strict mode, 100% coverage
✅ Build: ~5s, no errors
✅ Dev Server: Running at http://localhost:3000
```

## Deployment

**Primary:** Vercel (native Next.js)  
**Alternatives:** Railway, Render (Docker support)

Required production env vars:
- `DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose)
- `RESEND_API_KEY`, `FONNTE_API_KEY` (add when implemented)


<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
