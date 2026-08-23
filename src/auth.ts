import NextAuth from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import Credentials from "next-auth/providers/credentials";

// Konfigurasi NextAuth (Auth.js) v5 — Credentials Provider + JWT session.
// authConfig (tanpa Prisma) dipakai proxy di Edge Runtime; di sini
// ditambah authorize yang butuh DB (bcrypt + Prisma).
const ROLE_REFRESH_MS = 5 * 60 * 1000;

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "NIK, Email, atau No. HP", type: "text" },
        password: { label: "Kata Sandi", type: "password" },
      },
      async authorize(credentials) {
        const identifier = String(credentials?.identifier ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!identifier) return null;

        // Identifier bisa: NIK (16 digit), No HP, atau email.
        // Akun lama (email sintetis <NIK>@sitsomp.id) tetap bisa login via NIK.
        let user = null;
        if (/^\d{16}$/.test(identifier)) {
          // NIK persis, atau fallback email sintetis akun lama.
          user =
            (await prisma.user.findUnique({ where: { nik: identifier } })) ??
            (await prisma.user.findUnique({ where: { email: `${identifier}@sitsomp.id` } }));
        } else if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
          user = await prisma.user.findUnique({ where: { email: identifier } });
        } else {
          // Anggap nomor telepon: cocokkan setelah buang spasi/strip.
          const digits = identifier.replace(/[^0-9+]/g, "");
          if (digits) {
            const all = await prisma.user.findMany({ where: { nomor_hp: { not: null } } });
            user =
              all.find((u) => (u.nomor_hp ?? "").replace(/[^0-9+]/g, "") === digits) ?? null;
          }
        }

        if (!user || !user.password_hash || !user.is_active) return null;

        const valid = await bcrypt.compare(password, user.password_hash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.nama_lengkap,
          role: user.role,
          nik: user.nik ?? null,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Saat login, salin data user (dari authorize) ke token.
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "warga";
        token.nik = (user as { nik?: string | null }).nik ?? null;
        token.nama_lengkap = (user as { name?: string | null }).name ?? null;
        token.roleRefreshedAt = Date.now();
      } else if (token.id) {
        // Refresh role dari DB maks. sekali per ROLE_REFRESH_MS —
        // kalau akun dipromosikan/demosikan saat sesi aktif,
        // emblem peran di /profil ikut berubah tanpa login ulang.
        const last = (token.roleRefreshedAt as number | undefined) ?? 0;
        if (Date.now() - last > ROLE_REFRESH_MS) {
          try {
            const dbUser = await prisma.user.findUnique({
              where: { id: token.id as string },
              select: { role: true, is_active: true },
            });
            if (dbUser && dbUser.is_active) {
              token.role = dbUser.role;
            }
            token.roleRefreshedAt = Date.now();
          } catch {
            // DB gagal → pakai role lama di token.
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      // Session dipakai server-side: auth() di API routes.
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as string) ?? "warga";
        session.user.nik = (token.nik as string | null) ?? null;
        session.user.nama_lengkap = (token.nama_lengkap as string | null) ?? null;
      }
      return session;
    },
  },
});