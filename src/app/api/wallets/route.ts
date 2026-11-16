import { NextResponse } from "next/server";
import { and, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { markets, matches, trades, walletStats } from "@/db/schema";
import { kickSync, syncInfo } from "@/lib/sync";

export const dynamic = "force-dynamic";

const ACTIVE_MS = 24 * 3600_000;

export async function GET() {
  kickSync();
  const all = await db.select().from(walletStats);
  const now = Date.now();
  const list = all
    .filter((w) => w.matches >= 3)
    .map((w) => ({
      address: w.address,
      name: w.name,
      matches: w.matches,
      wins: w.wins,
      winRate: w.matches ? w.wins / w.matches : 0,
      staked: w.staked,
      profit: w.profit,
      roi: w.staked ? w.profit / w.staked : 0,
      cs2: w.cs2,
      dota2: w.dota2,
      bigBets: w.bigBets,
      bigWins: w.bigWins,
      openUsd: w.openUsd,
      tag: w.tag,
      lastBetAt: w.lastBetAt ? w.lastBetAt.getTime() : null,
      active: w.lastBetAt ? now - w.lastBetAt.getTime() < ACTIVE_MS : false,
    }));
  const byAddr = new Map(all.map((w) => [w.address, w]));

  // elite wallets betting right now on open matches
  const open = await db
    .select()
    .from(matches)
    .where(inArray(matches.status, ["live", "upcoming"]));
  const bettingNow: {
    slug: string;
    title: string;
    status: string;
    game: string;
    wallets: { address: string; name: string; tag: string; side: number; team: string; usd: number; winRate: number; matches: number }[];
  }[] = [];
  if (open.length) {
    const rows = await db
      .select({ t: trades })
      .from(trades)
      .innerJoin(markets, and(eq(markets.conditionId, trades.conditionId), eq(markets.kind, "match")))
      .where(
        inArray(
          trades.matchSlug,
          open.map((m) => m.slug),
        ),
      );
    const per = new Map<string, Map<string, [number, number]>>();
    for (const { t } of rows) {
      if (t.side !== "BUY") continue;
      const ws = byAddr.get(t.wallet);
      if (!ws || !(ws.tag || (ws.matches >= 4 && ws.wins / ws.matches >= 0.75 && ws.profit > 0))) continue;
      const mm = per.get(t.matchSlug) ?? new Map<string, [number, number]>();
      const cur = mm.get(t.wallet) ?? [0, 0];
      cur[t.outcomeIdx] += t.usd;
      mm.set(t.wallet, cur);
      per.set(t.matchSlug, mm);
    }
    for (const m of open) {
      const mm = per.get(m.slug);
      if (!mm) continue;
      const wallets = [...mm.entries()]
        .map(([address, u]) => {
          const side = u[0] >= u[1] ? 0 : 1;
          const ws = byAddr.get(address)!;
          return {
            address,
            name: ws.name,
            tag: ws.tag,
            side,
            team: side === 0 ? m.team1 : m.team2,
            usd: u[side],
            winRate: ws.matches ? ws.wins / ws.matches : 0,
            matches: ws.matches,
          };
        })
        .filter((w) => w.usd >= 200)
        .sort((a, b) => b.usd - a.usd);
      if (wallets.length) bettingNow.push({ slug: m.slug, title: m.title, status: m.status, game: m.game, wallets });
    }
  }

  const top10 = [...list]
    .filter((w) => w.active)
    .sort((a, b) => b.profit - a.profit)
    .slice(0, 10);

  return NextResponse.json({
    items: list,
    top10,
    bettingNow,
    kpi: {
      total: list.length,
      strong: list.filter((w) => w.tag === "strong").length,
      suspect: list.filter((w) => w.tag === "suspect").length,
      active: list.filter((w) => w.active).length,
      stopped: list.filter((w) => !w.active).length,
      matchesWithElite: bettingNow.length,
    },
    sync: syncInfo(),
  });
}
