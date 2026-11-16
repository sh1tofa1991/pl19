import "dotenv/config";
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    // Локальный Postgres, который поднимает `npm run dev` (scripts/db.mjs).
    url: process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5433/app_db",
  },
});
