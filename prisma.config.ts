// Prisma ORM v7: prisma.config.ts adalah pusat konfigurasi CLI.
// (Datasource URL & ekstensi PostGIS dipindah dari schema ke sini.)
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
