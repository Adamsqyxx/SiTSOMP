import "dotenv/config";
import bcrypt from "bcryptjs";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const NIK = "1234567890123456";
const PASSWORD = "12345678";
const NAMA = "Administrator";

async function main() {
  // 1) Reset: hapus SEMUA user
  const before = await prisma.user.count();
  const del = await prisma.user.deleteMany({});
  console.log(`DELETE: ${del.count} dari ${before} user dihapus`);

  // 2) Buat user baru (hash bcrypt 10 rounds, email sintetis <NIK>@sitsomp.id)
  const hash = await bcrypt.hash(PASSWORD, 10);
  const email = `${NIK}@sitsomp.id`;
  const user = await prisma.user.create({
    data: {
      email,
      nik: NIK,
      nama_lengkap: NAMA,
      password_hash: hash,
      role: "super_admin",
      is_active: true,
    },
    select: { id: true, email: true, nik: true, nama_lengkap: true, role: true, is_active: true },
  });
  console.log("CREATE:", JSON.stringify(user));

  // 3) Verifikasi ulang persis seperti logika authorize() di src/auth.ts
  const found = await prisma.user.findUnique({ where: { email } });
  const match = found?.password_hash ? await bcrypt.compare(PASSWORD, found.password_hash) : false;
  console.log("VERIFY: user ditemukan =", !!found,
    "| is_active =", found?.is_active,
    "| bcrypt match =", match,
    "| login NIK+pw =>", match && found?.is_active ? "BERHASIL" : "GAGAL");

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});