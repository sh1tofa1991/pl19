import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

/** Локальный Postgres, который `npm run dev` поднимает автоматически (scripts/db.mjs). */
const DEFAULT_URL = "postgresql://postgres:postgres@127.0.0.1:5433/app_db";

const databaseUrl = process.env.DATABASE_URL ?? DEFAULT_URL;

if (!process.env.DATABASE_URL) {
  console.warn("[db] DATABASE_URL не задан — используем локальный Postgres (127.0.0.1:5433/app_db)");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
    max: 10,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
