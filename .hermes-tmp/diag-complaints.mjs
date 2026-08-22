// Inspeksi 1 baris complaints yang tersisa (baca-only).
import pg from "pg";
import fs from "fs";

const env = fs.readFileSync(new URL("../.env", import.meta.url), "utf8");
const m = env.match(/DATABASE_URL="([^"]+)"/);
const pool = new pg.Pool({ connectionString: m[1], ssl: { rejectUnauthorized: false } });

const { rows } = await pool.query(
  `SELECT c.id, c.nomor_tiket, c.kategori, c.judul, c.status, c.created_at,
          u.email AS pelapor_email, u.nama_lengkap
   FROM complaints c LEFT JOIN users u ON u.id = c.pelapor_id
   ORDER BY c.created_at DESC LIMIT 5`
);
for (const r of rows) {
  console.log(`${r.nomor_tiket} | ${r.kategori} | ${r.status} | pelapor=${r.pelapor_email ?? "(user hilang)"} | "${r.judul}" | ${r.created_at?.toISOString?.()}`);
}
await pool.end();
