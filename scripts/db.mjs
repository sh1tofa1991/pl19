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
import pgpkg from "pg";
import EmbeddedPostgres from "embedded-postgres";

const { Client } = pgpkg;

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataDir = path.join(root, ".pgdata");
const PORT = 5433;
const USER = "postgres";
const PASSWORD = "postgres";
const DB_NAME = "app_db";
// Явная кодировка обязательна: без неё initdb на Windows берёт кодировку из
// локали системы (например WIN1251 для русской) и вставка имён вроде
// «DISFARÇADOS» падает. locale=C разрешает любую кодировку на любой платформе.
const INITDB_FLAGS = ["--locale=C", "--encoding=UTF8"];

const cmd = process.argv.slice(2).join(" ");
if (!cmd) {
  console.error("Использование: node scripts/db.mjs <команда…>  (например: node scripts/db.mjs next dev)");
  process.exit(1);
}

let pg = null;
let url = process.env.DATABASE_URL;

function makePg() {
  return new EmbeddedPostgres({
    databaseDir: dataDir,
    user: USER,
    password: PASSWORD,
    port: PORT,
    persistent: true,
    autoRehydrateSymlinks: true,
    initdbFlags: INITDB_FLAGS,
    onLog: () => {},
    onError: () => {},
  });
}

/** Кодировки баз postgres/app_db — должны быть UTF8. */
async function badEncodings() {
  const c = new Client({ connectionString: `postgresql://${USER}:${PASSWORD}@127.0.0.1:${PORT}/postgres` });
  await c.connect();
  try {
    const r = await c.query("select datname, pg_encoding_to_char(encoding) as enc from pg_database where datname in ('postgres', $1)", [
      DB_NAME,
    ]);
    return r.rows.filter((row) => row.enc !== "UTF8");
  } finally {
    await c.end();
  }
}

async function startEmbedded() {
  pg = makePg();
  if (!fs.existsSync(path.join(dataDir, "PG_VERSION"))) {
    console.log("[db] создаю локальный Postgres в .pgdata (UTF8)…");
    await pg.initialise();
  }
  await pg.start();

  // Кластер мог быть создан в не-UTF8 кодировке (старые версии скрипта на
  // Windows с русской локалью). Данные в .pgdata — пересинхронизируемый кэш,
  // поэтому смело пересоздаём кластер с UTF8.
  try {
    const bad = await badEncodings();
    if (bad.length) {
      console.warn(
        `[db] кодировка базы — ${bad.map((r) => `${r.datname}: ${r.enc}`).join(", ")}, а нужна UTF8 (иначе ломаются имена вроде «DISFARÇADOS»).`,
      );
      console.warn("[db] пересоздаю .pgdata с UTF8 — данные синхронизируются заново…");
      await pg.stop();
      pg = null;
      fs.rmSync(dataDir, { recursive: true, force: true });
      pg = makePg();
      await pg.initialise();
      await pg.start();
    }
  } catch (e) {
    console.warn("[db] не удалось проверить кодировку базы:", e?.message ?? e);
  }

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
