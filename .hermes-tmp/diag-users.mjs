// Diagnostik baca-only: cek user admin di DB + verifikasi hash bcrypt.
import pg from "pg";
import fs from "fs";
import bcrypt from "bcryptjs";

const env = fs.readFileSync(new URL("../.env", import.meta.url), "utf8");
const m = env.match(/DATABASE_URL="([^"]+)"/);
if (!m) { console.log("DATABASE_URL tidak ditemukan di .env"); process.exit(1); }
const pool = new pg.Pool({ connectionString: m[1], ssl: { rejectUnauthorized: false } });

const { rows } = await pool.query(
  `SELECT id, nik, email, role, is_active, password_hash IS NOT NULL AS has_pw, length(password_hash) AS pw_len,
          left(password_hash, 7) AS pw_prefix, nama_lengkap
   FROM users
   WHERE email IN ('7371054287073486@sitsomp.id', '9999999999999999@sitsomp.id', '8888888888888888@sitsomp.id')
   ORDER BY email`
);
for (const r of rows) {
  console.log(`${r.email} | nik=${r.nik} | role=${r.role} | active=${r.is_active} | pw_len=${r.pw_len} | prefix=${r.pw_prefix} | nama=${r.nama_lengkap}`);
  if (r.email === "7371054287073486@sitsomp.id") {
    const ok = await bcrypt.compare("C1g2cZ8ZT-Td", r.password_hash);
    console.log(`  -> bcrypt.compare("C1g2cZ8ZT-Td") = ${ok}`);
    const ok2 = await bcrypt.compare("UjiCoba-E2E-2026", r.password_hash);
    console.log(`  -> bcrypt.compare("UjiCoba-E2E-2026") = ${ok2}`);
  }
}
console.log(`total rows: ${rows.length}`);
const cnt = await pool.query(`SELECT count(*)::int AS n FROM users`);
console.log(`total users di DB: ${cnt.rows[0].n}`);
await pool.end();
