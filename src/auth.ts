import NextAuth from "next-auth";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "@/auth.config";
import Credentials from "next-auth/providers/credentials";

// Konfigurasi NextAuth (Auth.js) v5 — Credentials Provider + JWT session.
// authConfig (tanpa Prisma) dipakai proxy di Edge Runtime; di sini
// ditambah authorize yang butuh DB (bcrypt + Prisma).
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "NIK atau Email", type: "text" },
        password: { label: "Kata Sandi", type: "password" },
      },
      async authorize(credentials) {
        const identifier = String(credentials?.identifier ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");

        // NIK saja → email sintetis <NIK>@sitsomp.id (konsisten dengan register).
        let email = identifier;
        if (/^\d{16}$/.test(identifier)) {
          email = `${identifier}@sitsomp.id`;
        }

        const user = await prisma.user.findUnique({
          where: { email },
        });
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