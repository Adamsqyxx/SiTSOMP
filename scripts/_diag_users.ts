import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const users = await prisma.user.findMany({
    orderBy: { created_at: "asc" },
    select: {
      id: true,
      email: true,
      nik: true,
      nama_lengkap: true,
      role: true,
      is_active: true,
      created_at: true,
      password_hash: true,
    },
  });

  console.log(`Total users: ${users.length}`);
  for (const u of users) {
    const h = u.password_hash ?? "";
    const hashInfo = h
      ? `bcrypt(${h.slice(0, 7)}…) len=${h.length}`
      : "NULL ← penyebab login gagal jika dipakai";
    console.log(JSON.stringify({
      id: u.id,
      email: u.email,
      nik: u.nik,
      nama: u.nama_lengkap,
      role: u.role,
      is_active: u.is_active,
      created_at: u.created_at,
      hash: hashInfo,
    }));
  }

  // Cek data referensial yang mungkin "yatim" jika user dihapus
  const counts = {
    penduduk: await prisma.penduduk.count({ where: { user_id: { not: null } } }),
    serviceRequests: await prisma.serviceRequest.count(),
    complaints: await prisma.complaint.count(),
    informasi: await prisma.informasiPublik.count(),
    notifikasi: await prisma.notifikasi.count(),
  };
  console.log("Referential rows:", JSON.stringify(counts));

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
