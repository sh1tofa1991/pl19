#!/usr/bin/env node
/**
 * Полная очистка данных синхронизации (матчи, рынки, сделки, кошельки) —
 * «начать свою историю с нуля». Импорт старых матчей отключён, поэтому после
 * очистки в базу попадут только события, отслеженные сайтом самостоятельно.
 *
 * Использование: npm run db:reset   (база должна работать: запусти `npm run dev`
 * в соседнем терминале либо задай DATABASE_URL)
 */
import "dotenv/config";
import pgpkg from "pg";

const { Client } = pgpkg;
const url = process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:5433/app_db";

const c = new Client({ connectionString: url });
try {
  await c.connect();
  await c.query("begin");
  for (const t of ["trades", "markets", "matches", "wallet_stats", "sync_state"]) {
    await c.query(`delete from ${t}`);
  }
  await c.query("commit");
  console.log("Готово: история очищена. Сайт начнёт вести запись заново с ближайшей синхронизации.");
} catch (e) {
  try {
    await c.query("rollback");
  } catch {
    // нет активной транзакции
  }
  console.error("Не удалось очистить историю:", e?.message ?? e);
  console.error("Запусти `npm run dev` в соседнем терминале (база должна работать) либо задай DATABASE_URL.");
  process.exitCode = 1;
} finally {
  await c.end();
}
