// Buat 2 user SEMENTARA untuk uji E2E (dihapus lagi di cleanup).
import pg from "pg";
import fs from "fs";
import bcrypt from "bcryptjs";

const env = fs.readFileSync(new URL("../.env", import.meta.url), "utf8");
const m = env.match(/DATABASE_URL="([^"]+)"/);
const pool = new pg.Pool({ connectionString: m[1], ssl: { rejectUnauthorized: false } });

const pass = await bcrypt.hash("UjiCoba-E2E-2026", 10);

await pool.query(
  `INSERT INTO users (id, nik, nama_lengkap, email, password_hash, role, updated_at)
   VALUES ('user-uji-admin', '9999999999999999', 'Admin Uji E2E', '9999999999999999@sitsomp.id', $1, 'super_admin', now())
   ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'super_admin'`,
  [pass]
);
await pool.query(
  `INSERT INTO users (id, nik, nama_lengkap, email, password_hash, role, updated_at)
   VALUES ('user-uji-warga', '8888888888888888', 'Warga Uji E2E', '8888888888888888@sitsomp.id', $1, 'warga', now())
   ON CONFLICT (email) DO UPDATE SET password_hash = $1, role = 'warga'`,
  [pass]
);
console.log("User uji siap.");
await pool.end();
