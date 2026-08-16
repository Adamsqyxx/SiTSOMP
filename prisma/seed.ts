import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Seed data awal fasilitas/wilayah Kel. Tiro Sompe untuk tabel `lokasi`.
// Jalankan: npx tsx prisma/seed.ts
//
// PrismaPg runtime butuh pg.Pool eksplisit (password diteruskan benar),
// maka kita buat Pool dari DATABASE_URL lalu serahkan sebagai adapter.

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL tidak diset");
}

const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const LOKASI = [
  {
    nama: "Kantor Kelurahan Tiro Sompe",
    jenis: "kantor_kelurahan",
    alamat: "Jl. Poros Parepare, Kel. Tiro Sompe, Kec. Bacukiki Barat",
    deskripsi: "Kantor pelayanan administrasi kelurahan",
    latitude: -4.0270793,
    longitude: 119.6327389,
  },
  {
    nama: "SDN 1 Tiro Sompe",
    jenis: "fasilitas_umum",
    alamat: "Jl. Pendidikan, Kel. Tiro Sompe",
    deskripsi: "Sekolah Dasar Negeri 1 Tiro Sompe",
    latitude: -4.025,
    longitude: 119.629,
  },
  {
    nama: "SDN 2 Tiro Sompe",
    jenis: "fasilitas_umum",
    alamat: "Jl. Pendidikan, Kel. Tiro Sompe",
    deskripsi: "Sekolah Dasar Negeri 2 Tiro Sompe",
    latitude: -4.023,
    longitude: 119.631,
  },
  {
    nama: "Puskesmas Pembantu Tiro Sompe",
    jenis: "fasilitas_umum",
    alamat: "Jl. Kesehatan, Kel. Tiro Sompe",
    deskripsi: "Puskesmas pembantu (pustu) pelayanan kesehatan dasar",
    latitude: -4.026,
    longitude: 119.63,
  },
  {
    nama: "Masjid Nurul Iman Tiro Sompe",
    jenis: "fasilitas_umum",
    alamat: "Jl. Ibadah, Kel. Tiro Sompe",
    deskripsi: "Tempat ibadah utama warga",
    latitude: -4.024,
    longitude: 119.628,
  },
] as const;

async function main() {
  for (const l of LOKASI) {
    await prisma.lokasi.upsert({
      where: { id: `${l.nama}` },
      update: {},
      create: {
        id: `${l.nama}`,
        nama: l.nama,
        jenis: l.jenis as never,
        alamat: l.alamat,
        deskripsi: l.deskripsi,
        latitude: l.latitude,
        longitude: l.longitude,
      },
    });
    console.log(`✔ ${l.nama}`);
  }
  console.log("Seed lokasi selesai.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });