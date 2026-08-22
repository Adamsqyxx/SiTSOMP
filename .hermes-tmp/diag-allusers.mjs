// Daftar semua user (tanpa hash) untuk melihat isi DB saat ini.
import pg from "pg";
import fs from "fs";

const env = fs.readFileSync(new URL("../.env", import.meta.url), "utf8");
const m = env.match(/DATABASE_URL="([^"]+)"/);
const pool = new pg.Pool({ connectionString: m[1], ssl: { rejectUnauthorized: false } });

const { rows } = await pool.query(
  `SELECT id, nik, email, nama_lengkap, role, is_active, password_hash IS NOT NULL AS has_pw, created_at, updated_at
   FROM users ORDER BY created_at`
);
for (const r of rows) {
  console.log(`${r.email} | role=${r.role} | active=${r.is_active} | has_pw=${r.has_pw} | created=${r.created_at?.toISOString?.() ?? r.created_at}`);
}
await pool.end();
