import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Singleton PrismaClient (pola standar untuk Next.js dev/HMR agar tidak
// membuat koneksi DB baru setiap hot-reload).
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrisma() {
  // PrismaPg runtime butuh pg.Pool eksplisit agar password/SSL diteruskan
  // dengan benar (khususnya via Supabase pooler).
  const pool = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    // Hardening untuk Supabase pooler: gagal cepat saat koneksi mati diam-diam
    // (jangan biarkan request menggantung selamanya), dan jaga koneksi tetap
    // hidup lewat NAT/firewall.
    connectionTimeoutMillis: 10_000,
    idleTimeoutMillis: 30_000,
    keepAlive: true,
  });
  // Error pada koneksi idle (mis. diputus pooler) tidak boleh menjatuhkan
  // proses — pool akan membuat koneksi baru pada query berikutnya.
  pool.on("error", (err) => {
    console.error("[prisma] pg pool idle-client error:", err.message);
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;