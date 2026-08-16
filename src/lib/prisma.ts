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
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;