import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { markets, matches, trades } from "@/db/schema";
import { analyze, type Analysis, type TradeRow } from "@/lib/analytics";

export type MatchRow = typeof matches.$inferSelect;

export const toRow = (t: typeof trades.$inferSelect): TradeRow => ({
  wallet: t.wallet,
  name: t.name,
  side: t.side,
  outcomeIdx: t.outcomeIdx,
  usd: t.usd,
  price: t.price,
  ts: t.ts.getTime(),
});

export function analyzeMatch(m: MatchRow, rows: TradeRow[], mode: "live" | "pre") {
  const prices: [number | null, number | null] = [m.price1, m.price2];
  if (mode === "pre") {
    return analyze(rows, {
      asOf: Math.min(Date.now(), m.startTime.getTime()),
      windowMin: 360,
      names: [m.team1, m.team2],
      prices,
    });
  }
  return analyze(rows, { asOf: Date.now(), windowMin: 30, names: [m.team1, m.team2], prices });
}

export function summary(a: Analysis) {
  return {
    score: a.score,
    level: a.level,
    moneySide: a.moneySide,
    moneyShare: a.moneyShare,
    moneyUsd: a.moneyUsd,
    topWalletShare: a.topWalletShare,
    trades: a.tradeCount,
    wallets: a.walletCount,
    lastTradeAgoSec: a.lastTradeAgoSec,
    switched: a.switched.length,
    w5: a.windows[1],
    reasons: a.reasons,
    totalUsd: a.totalUsd,
  };
}

export async function loadOpenMatches(game?: string | null) {
  const cond = [inArray(matches.status, ["live", "upcoming"])];
  if (game === "cs2" || game === "dota2") cond.push(eq(matches.game, game));
  const list = await db
    .select()
    .from(matches)
    .where(and(...cond));
  if (!list.length) return [];
  const slugs = list.map((m) => m.slug);
  const rows = await db
    .select({ t: trades })
    .from(trades)
    .innerJoin(markets, and(eq(markets.conditionId, trades.conditionId), eq(markets.kind, "match")))
    .where(inArray(trades.matchSlug, slugs));
  const by = new Map<string, TradeRow[]>();
  for (const { t } of rows) {
    const arr = by.get(t.matchSlug) ?? [];
    arr.push(toRow(t));
    by.set(t.matchSlug, arr);
  }
  return list.map((m) => {
    const tr = by.get(m.slug) ?? [];
    const mode = m.status === "live" ? "live" : "pre";
    const a = analyzeMatch(m, tr, mode);
    return { m, a, mode };
  });
}

export async function sqlCount(table: "matches") {
  const r = await db.execute(sql`select count(*)::int as c from ${sql.raw(table)}`);
  return Number((r.rows[0] as { c: number }).c);
}
