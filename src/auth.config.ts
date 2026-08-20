import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Konfigurasi NextAuth TANPA Prisma — aman untuk Edge Runtime (middleware).
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
  },
} satisfies NextAuthConfig;