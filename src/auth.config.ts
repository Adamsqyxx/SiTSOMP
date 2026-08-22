import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Konfigurasi NextAuth TANPA Prisma — aman untuk Edge Runtime (proxy).
// Provider credentials di sini tidak dipakai untuk authorize (hanya agar
// NextAuth tahu bentuk login); authorize sebenarnya ada di auth.ts.
export const authConfig = {
  session: { strategy: "jwt" },
  // Wajib di next start / self-host: tanpa ini NextAuth tolak request
  // (UntrustedHost). Saat deploy Vercel otomatis terdeteksi; ini aman untuk dev.
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        identifier: { label: "NIK atau Email", type: "text" },
        password: { label: "Kata Sandi", type: "password" },
      },
      // authorize TIDAK didefinisikan di sini — di-override di auth.ts.
      authorize: async () => null,
    }),
  ],
  callbacks: {
    // Middleware cuma perlu tahu "ada user?" → cukup cek token.
    authorized() {
      return true;
    },
    // Salin data user ke token saat login — dipakai juga oleh proxy
    // (Edge) agar session.user.role tersedia untuk proteksi route /admin.
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "warga";
        token.nik = (user as { nik?: string | null }).nik ?? null;
        token.nama_lengkap = (user as { name?: string | null }).name ?? null;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string) ?? "";
        session.user.role = (token.role as string) ?? "warga";
        session.user.nik = (token.nik as string | null) ?? null;
        session.user.nama_lengkap = (token.nama_lengkap as string | null) ?? null;
      }
      return session;
    },
  },
} satisfies NextAuthConfig;