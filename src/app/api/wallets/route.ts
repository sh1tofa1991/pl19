import { NextResponse } from "next/server";
import { guard } from "@/lib/api";
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { markets, matches, trades, walletStats } from "@/db/schema";
import { computeClusters, computePairs } from "@/lib/clusters";
import { moveOf } from "@/lib/moves";
import { kickSync, syncInfo } from "@/lib/sync";

export const dynamic = "force-dynamic";

const ACTIVE_MS = 24 * 3600_000;

async function handler() {
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
      fixMatches: w.fixMatches,
      fixWins: w.fixWins,
      openUsd: w.openUsd,
      tag: w.tag,
      lastBetAt: w.lastBetAt ? w.lastBetAt.getTime() : null,
      active: w.lastBetAt ? now - w.lastBetAt.getTime() < ACTIVE_MS : false,
    }));
  const byAddr = new Map(all.map((w) => [w.address, w]));

  // совместные ставки по матчам — кластеры кошельков («один человек, несколько аккаунтов»)
  const coRows = await db
    .select({
      matchSlug: trades.matchSlug,
      wallet: trades.wallet,
      outcomeIdx: trades.outcomeIdx,
      usd: sql<number>`sum(${trades.usd})::float`,
    })
    .from(trades)
    .innerJoin(markets, and(eq(markets.conditionId, trades.conditionId), eq(markets.kind, "match")))
    .where(eq(trades.side, "BUY"))
    .groupBy(trades.matchSlug, trades.wallet, trades.outcomeIdx);
  const clusters = computeClusters(
    coRows.map((r) => ({ matchSlug: r.matchSlug, wallet: r.wallet, outcomeIdx: r.outcomeIdx, usd: Number(r.usd) })),
    all.map((w) => ({ address: w.address, name: w.name, matches: w.matches, wins: w.wins, staked: w.staked, profit: w.profit, tag: w.tag })),
  );
  const clusterOf = new Map<string, number>();
  clusters.forEach((c, i) => c.members.forEach((m) => clusterOf.set(m.address, i)));

  // пары кошельков: same / mixed / against + «шанс один владелец»
  const pairs = computePairs(
    coRows.map((r) => ({ matchSlug: r.matchSlug, wallet: r.wallet, outcomeIdx: r.outcomeIdx, usd: Number(r.usd) })),
  )
    .slice(0, 25)
    .map((p) => {
      const rate = p.together ? p.same / p.together : 0;
      return {
        a: p.a,
        aName: byAddr.get(p.a)?.name ?? "",
        b: p.b,
        bName: byAddr.get(p.b)?.name ?? "",
        together: p.together,
        sameRate: rate,
        rel: rate >= 0.8 ? "same" : rate <= 0.2 ? "against" : "mixed",
        usd: Math.round(p.usd),
      };
    });

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
    wallets: { address: string; name: string; tag: string; side: number; team: string; usd: number; winRate: number; matches: number; move: string }[];
    groups: { members: string[]; side: number; team: string; usd: number }[];
    fixers: { members: string[]; side: number; team: string; usd: number }[];
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
    const mvPer = new Map<string, Map<string, { buy: [number, number]; sell: [number, number] }>>();
    const grpPer = new Map<string, Map<number, [number, number]>>();
    // кошельки-фиксеры: стабильно угадывают сторону в матчах, помеченных «слив»
    const fixerSet = new Set(
      all.filter((w) => w.fixMatches >= 2 && w.fixWins / Math.max(1, w.fixMatches) >= 0.75).map((w) => w.address),
    );
    const fixPer = new Map<string, { u: [number, number]; names: [string[], string[]] }>();
    for (const { t } of rows) {
      // ходы кошелька (включая продажи): FLIPPED / ONLY EXITED
      const mv = mvPer.get(t.matchSlug) ?? new Map<string, { buy: [number, number]; sell: [number, number] }>();
      const mvw = mv.get(t.wallet) ?? { buy: [0, 0], sell: [0, 0] };
      const mvi = t.outcomeIdx === 1 ? 1 : 0;
      if (t.side === "BUY") mvw.buy[mvi] += t.usd;
      else mvw.sell[mvi] += t.usd;
      mv.set(t.wallet, mvw);
      mvPer.set(t.matchSlug, mv);
      if (t.side !== "BUY") continue;
      if (fixerSet.has(t.wallet)) {
        const fm = fixPer.get(t.matchSlug) ?? { u: [0, 0], names: [[], []] as [string[], string[]] };
        fm.u[t.outcomeIdx] += t.usd;
        fm.names[t.outcomeIdx].push(t.name || `${t.wallet.slice(0, 6)}…${t.wallet.slice(-4)}`);
        fixPer.set(t.matchSlug, fm);
      }
      const ci = clusterOf.get(t.wallet);
      if (ci !== undefined) {
        const gm = grpPer.get(t.matchSlug) ?? new Map<number, [number, number]>();
        const gu = gm.get(ci) ?? [0, 0];
        gu[t.outcomeIdx] += t.usd;
        gm.set(ci, gu);
        grpPer.set(t.matchSlug, gm);
      }
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
      const wallets = mm
        ? [...mm.entries()]
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
                move: (() => {
                  const f = mvPer.get(m.slug)?.get(address);
                  return f ? moveOf(f.buy, f.sell) : "";
                })(),
              };
            })
            .filter((w) => w.usd >= 200)
            .sort((a, b) => b.usd - a.usd)
        : [];
      // групповые ставки кластеров: сколько группа кладёт на одну сторону сейчас
      const gm = grpPer.get(m.slug);
      const groups = gm
        ? [...gm.entries()]
            .map(([ci, u]) => {
              const side = u[0] >= u[1] ? 0 : 1;
              return {
                members: clusters[ci].members.map((x) => x.name || `${x.address.slice(0, 6)}…${x.address.slice(-4)}`),
                side,
                team: side === 0 ? m.team1 : m.team2,
                usd: u[side],
              };
            })
            .filter((g) => g.usd >= 300)
            .sort((a, b) => b.usd - a.usd)
        : [];
      // ставки кошельков-фиксеров на этот матч
      const fp = fixPer.get(m.slug);
      const fixers = fp
        ? ([0, 1] as const)
            .map((side) => ({
              side,
              team: side === 0 ? m.team1 : m.team2,
              usd: fp.u[side],
              members: [...new Set(fp.names[side])],
            }))
            .filter((f) => f.usd >= 200)
            .sort((a, b) => b.usd - a.usd)
        : [];
      if (wallets.length || groups.length || fixers.length)
        bettingNow.push({ slug: m.slug, title: m.title, status: m.status, game: m.game, wallets, groups, fixers });
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
    clusters,
    pairs,
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

export const GET = guard(handler);
