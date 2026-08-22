import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // Resolusi alias @/* dari tsconfig.json (native Vite, tanpa plugin) ...
    tsconfigPaths: true,
    // ... plus next-auth meng-import "next/server" tanpa ekstensi .js —
    // Node ESM menolak, jadi arahkan eksplisit ke next/server.js.
    alias: { "next/server": "next/server.js" },
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
    // Inline next-auth agar di-bundle Vite sehingga alias di atas diterapkan
    // (modul externalized diresolusi Node native dan mengabaikan alias).
    server: { deps: { inline: [/next-auth/] } },
  },
});
