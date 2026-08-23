import { readFileSync } from "fs";
import pg from "pg";

const env = readFileSync(".env", "utf8");
const m = env.match(/DATABASE_URL="([^"]+)"/);
if (!m) { console.error("no DATABASE_URL"); process.exit(1); }
const pool = new pg.Pool({ connectionString: m[1], ssl: { rejectUnauthorized: false } });
try {
  const r = await pool.query("select id, nama_lengkap, email, nomor_hp, nik, role, is_active from users order by created_at");
  console.log(JSON.stringify(r.rows, null, 1));
} catch (e) { console.error("ERR:", e.message); }
finally { await pool.end(); }
