import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    // Use a fallback so `prisma generate` (run during `npm install` / build)
    // doesn't crash when DATABASE_URL isn't set yet. Commands that actually
    // touch the DB (migrate/deploy/studio) still require a real value.
    url: process.env.DATABASE_URL ?? "",
  },
});
