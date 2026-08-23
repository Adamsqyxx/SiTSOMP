// Seed data wilayah resmi Kel. Tiro Sompe ke tabel wilayah_rw/wilayah_rt.
// Sumber: DPT KPU Kota Parepare 2018 (dokumen resmi pemilu) — rekonstruksi
// RT/RW tervalidasi silang dengan BPS "Kecamatan Bacukiki Barat Dalam Angka
// 2020" (21 RT / 5 RW). Idempotent: aman dijalankan berulang.
//
// Jalankan: npx tsx --env-file=.env seed-wilayah.ts
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client.js";

const STRUKTUR: Record<string, string[]> = {
  "001": ["001", "002", "003", "004", "005"],
  "002": ["001", "002", "003", "004", "005"],
  "003": ["001", "002", "003"],
  "004": ["001", "002", "003"],
  "005": ["001", "002", "003", "004", "005"],
};

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

try {
  let totalRt = 0;
  for (const [rw, rts] of Object.entries(STRUKTUR)) {
    const row = await prisma.wilayahRW.upsert({
      where: { nomor_rw: rw },
      create: { nomor_rw: rw },
      update: {},
    });
    for (const rt of rts) {
      await prisma.wilayahRT.upsert({
        where: { rw_id_nomor_rt: { rw_id: row.id, nomor_rt: rt } },
        create: { rw_id: row.id, nomor_rt: rt },
        update: {},
      });
      totalRt++;
    }
    console.log(`RW ${rw}: ${rts.length} RT ✓`);
  }
  console.log(`Selesai. Total ${Object.keys(STRUKTUR).length} RW, ${totalRt} RT.`);
} catch (e) {
  console.error("ERR:", (e as Error).message);
  process.exit(1);
} finally {
  await prisma.$disconnect();
  await pool.end();
}
