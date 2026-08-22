// Cleanup: hapus user & pengaduan uji sekali pakai.
import pg from "pg";
import fs from "fs";

const env = fs.readFileSync(new URL("../.env", import.meta.url), "utf8");
const m = env.match(/DATABASE_URL="([^"]+)"/);
const pool = new pg.Pool({ connectionString: m[1], ssl: { rejectUnauthorized: false } });

const email = "0000000000000099@sitsomp.id";
const u = await pool.query(`SELECT id FROM users WHERE email = $1`, [email]);
if (u.rows.length) {
  const id = u.rows[0].id;
  const d1 = await pool.query(`DELETE FROM complaints WHERE pelapor_id = $1`, [id]);
  console.log(`pengaduan dihapus: ${d1.rowCount}`);
  await pool.query(`DELETE FROM users WHERE id = $1`, [id]);
  console.log(`user dihapus: ${email}`);
} else {
  console.log("user uji tidak ditemukan (sudah bersih)");
}
const cnt = await pool.query(`SELECT count(*)::int AS n FROM users`);
console.log(`total users sekarang: ${cnt.rows[0].n}`);
await pool.end();
