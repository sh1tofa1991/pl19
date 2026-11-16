import { NextResponse } from "next/server";
import { guard } from "@/lib/api";
import { and, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { kickSync, syncInfo } from "@/lib/sync";
import { loadOpenMatches, summary } from "@/lib/queries";

export const dynamic = "force-dynamic";

async function handler(req: Request) {
  kickSync();
  const game = new URL(req.url).searchParams.get("game");
  const open = await loadOpenMatches(game);
  const items = open
    .map(({ m, a, mode }) => ({
      slug: m.slug,
      game: m.game,
      title: m.title,
      team1: m.team1,
      team2: m.team2,
      bestOf: m.bestOf,
      tournament: m.tournament,
      start: m.startTime.getTime(),
      status: m.status,
      fixLabel: m.fixLabel,
      scoreText: m.scoreText,
      price1: m.price1,
      price2: m.price2,
      openPrice1: m.openPrice1,
      volume: m.volume,
      mode,
      a: summary(a),
    }))
    .sort((x, y) => {
      if (x.status !== y.status) return x.status === "live" ? -1 : 1;
      if (y.a.score !== x.a.score) return y.a.score - x.a.score;
      return x.start - y.start;
    });

  const cond = [eq(matches.status, "finished"), isNotNull(matches.signalScore)];
  if (game === "cs2" || game === "dota2") cond.push(eq(matches.game, game));
  const fin = await db
    .select({ s: matches.signalScore, w: matches.signalWon, p: matches.signalPrice })
    .from(matches)
    .where(and(...cond));
  const alerts = fin.filter((f) => (f.s ?? 0) >= 60);
  const hits = alerts.filter((f) => f.w).length;
  const now = Date.now();

  return NextResponse.json({
    items,
    kpi: {
      high: items.filter((i) => i.a.score >= 60).length,
      medium: items.filter((i) => i.a.score >= 30 && i.a.score < 60).length,
      live: items.filter((i) => i.status === "live").length,
      total: items.length,
      withFlow: items.filter((i) => i.a.lastTradeAgoSec !== null && i.a.lastTradeAgoSec < 1800).length,
      alertsResolved: alerts.length,
      alertHits: hits,
      resolved: fin.length,
    },
    sync: syncInfo(),
    now,
  });
}

export const GET = guard(handler);
