// Bandingkan host/database antara .env dan .env.local tanpa mencetak password.
import fs from "fs";

function parseUrl(u) {
  try {
    const x = new URL(u);
    return `${x.protocol}//${x.hostname}:${x.port}${x.pathname}`;
  } catch { return "(invalid)"; }
}

for (const f of [".env", ".env.local"]) {
  const txt = fs.readFileSync(new URL(`../${f}`, import.meta.url), "utf8");
  const lines = txt.split("\n").filter((l) => l.trim() && !l.trim().startsWith("#"));
  console.log(`=== ${f} ===`);
  for (const l of lines) {
    const mm = l.match(/^([A-Z_]+)="([^"]*)"/);
    if (!mm) continue;
    const [, key, val] = mm;
    if (key === "DATABASE_URL") console.log(`${key} -> ${parseUrl(val)}`);
    else if (/KEY|SECRET|TOKEN|PASSWORD/.test(key)) console.log(`${key} -> <terisi:${val.length} char>`);
    else console.log(`${key} -> ${val}`);
  }
}
