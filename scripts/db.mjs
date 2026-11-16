#!/usr/bin/env node
/**
 * Запускает команду (например `next dev`), автоматически поднимая локальный
 * Postgres, если DATABASE_URL не задан:
 *
 *   - DATABASE_URL задан (env или .env)  → используется внешняя база;
 *   - не задан → поднимается встроенный Postgres в ./.pgdata (порт 5433),
 *     создаётся база app_db и накатывается схема (drizzle-kit push).
 *
 * Использование: node scripts/db.mjs next dev
 */
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import "dotenv/config";
import EmbeddedPostgres from "embedded-postgres";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataDir = path.join(root, ".pgdata");
const PORT = 5433;
const USER = "postgres";
const PASSWORD = "postgres";
const DB_NAME = "app_db";

const cmd = process.argv.slice(2).join(" ");
if (!cmd) {
  console.error("Использование: node scripts/db.mjs <команда…>  (например: node scripts/db.mjs next dev)");
  process.exit(1);
}

let pg = null;
let url = process.env.DATABASE_URL;

async function startEmbedded() {
  pg = new EmbeddedPostgres({
    databaseDir: dataDir,
    user: USER,
    password: PASSWORD,
    port: PORT,
    persistent: true,
    autoRehydrateSymlinks: true,
    onLog: () => {},
    onError: () => {},
  });
  const fresh = !fs.existsSync(path.join(dataDir, "PG_VERSION"));
  if (fresh) {
    console.log("[db] создаю локальный Postgres в .pgdata…");
    await pg.initialise();
  }
  await pg.start();
  try {
    await pg.createDatabase(DB_NAME);
  } catch {
    // база уже существует
  }
  url = `postgresql://${USER}:${PASSWORD}@127.0.0.1:${PORT}/${DB_NAME}`;
  console.log(`[db] Postgres запущен: ${url}`);
}

function pushSchema() {
  const bin = path.join(root, "node_modules", ".bin", process.platform === "win32" ? "drizzle-kit.cmd" : "drizzle-kit");
  const r = spawnSync(bin, ["push"], {
    stdio: "inherit",
    shell: true,
    cwd: root,
    env: { ...process.env, DATABASE_URL: url, PATH: `${path.join(root, "node_modules", ".bin")}${path.delimiter}${process.env.PATH ?? ""}` },
  });
  if (r.status !== 0) {
    console.warn("[db] drizzle-kit push не прошёл — проверь доступность Postgres и DATABASE_URL.");
  }
}

async function shutdown() {
  if (pg) {
    try {
      await pg.stop();
    } catch {
      // уже остановлен
    }
    pg = null;
  }
}

async function main() {
  if (!url) {
    await startEmbedded();
  } else {
    console.log(`[db] использую DATABASE_URL из окружения: ${url.replace(/:[^:@/]*@/, ":***@")}`);
  }
  pushSchema();

  const child = spawn(cmd, {
    shell: true,
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: url, PATH: `${path.join(root, "node_modules", ".bin")}${path.delimiter}${process.env.PATH ?? ""}` },
  });
  child.on("exit", async (code) => {
    await shutdown();
    process.exit(code ?? 0);
  });
  for (const sig of ["SIGINT", "SIGTERM"]) {
    process.on(sig, () => child.kill(sig));
  }
}

main().catch(async (e) => {
  console.error("[db] не удалось подготовить базу данных:", e?.message ?? e);
  await shutdown();
  process.exit(1);
});
