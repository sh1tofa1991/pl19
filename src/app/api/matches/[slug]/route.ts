import { NextResponse } from "next/server";
import { guard } from "@/lib/api";
import { and, eq, gt, sql } from "drizzle-orm";
import { db } from "@/db";
import { markets, matches, trades } from "@/db/schema";
import { kickSync } from "@/lib/sync";
import { analyzeMatch, toRow } from "@/lib/queries";
import { label } from "@/lib/analytics";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
const holdersCache = new Map<string, { at: number; data: any }>();

async function loadHolders(cond: string, p1: number, names: [string, string]) {
  const hit = holdersCache.get(cond);
  if (hit && Date.now() - hit.at < 60_000) return hit.data;
  try {
    const res = await fetch(`https://data-api.polymarket.com/v2/holders?condition=${cond}&limit=8`, {
      signal: AbortSignal.timeout(10000),
      cache: "no-store",
    });
    const j: any = await res.json();
    const sides: any[][] = [[], []];
    for (const tok of j.data ?? []) {
      for (const h of tok.holders ?? []) {
        const idx = Number(h.outcome_index) === 1 ? 1 : 0;
        const price = idx === 0 ? p1 : 1 - p1;
        const nm = h.name && !/^0x[0-9a-f]{20,}/i.test(h.name) ? h.name : h.pseudonym;
        sides[idx].push({
          wallet: h.proxy_wallet,
          name: label(nm ?? "", h.proxy_wallet),
          shares: Number(h.amount),
          value: Number(h.amount) * price,
        });
      }
    }
    sides.forEach((s) => s.sort((a, b) => b.shares - a.shares));
    const data = { names, sides: [sides[0].slice(0, 5), sides[1].slice(0, 5)] };
    holdersCache.set(cond, { at: Date.now(), data });
    return data;
  } catch {
    return hit?.data ?? { names, sides: [[], []] };
  }
}

async function handler(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  kickSync();
  const { slug } = await ctx.params;
  const [m] = await db.select().from(matches).where(eq(matches.slug, slug));
  if (!m) return NextResponse.json({ error: "not found" }, { status: 404 });

  const mks = await db.select().from(markets).where(eq(markets.matchSlug, slug));
  mks.sort((a, b) => a.mapNo - b.mapNo);
  const wanted = new URL(req.url).searchParams.get("market");
  const sel = mks.find((x) => x.conditionId === wanted) ?? mks.find((x) => x.kind === "match") ?? mks[0];

  const recent = await db
    .select({
      cond: trades.conditionId,
      usd: sql<number>`sum(${trades.usd})::float`,
    })
    .from(trades)
    .where(and(eq(trades.matchSlug, slug), eq(trades.side, "BUY"), gt(trades.ts, new Date(Date.now() - 5 * 60_000))))
    .groupBy(trades.conditionId);
  const rmap = new Map(recent.map((r) => [r.cond, r.usd]));

  let live = null;
  let pre = null;
  let holders = null;
  let selP1: number | null = m.price1;
  let rows: ReturnType<typeof toRow>[] = [];
  if (sel) {
    const t = await db.select().from(trades).where(eq(trades.conditionId, sel.conditionId));
    rows = t.map(toRow);
    const mm = { ...m, price1: sel.kind === "match" ? m.price1 : (rows.length ? null : sel.price1) };
    // for map markets use last trade price
    if (sel.kind === "map" && rows.length) {
      const last = [...rows].sort((a, b) => b.ts - a.ts)[0];
      const p = last.outcomeIdx === 0 ? last.price : 1 - last.price;
      mm.price1 = p;
      (mm as any).price2 = 1 - p;
    } else if (sel.kind === "map") {
      mm.price1 = sel.price1;
    }
    selP1 = mm.price1 ?? m.price1;
    live = analyzeMatch(mm as any, rows, "live");
    pre = analyzeMatch(mm as any, rows, "pre");
    if (m.status !== "finished") holders = await loadHolders(sel.conditionId, mm.price1 ?? 0.5, [m.team1, m.team2]);
  }

  return NextResponse.json({
    match: {
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
      winnerIdx: m.winnerIdx,
      price1: m.price1,
      price2: m.price2,
      openPrice1: m.openPrice1,
      volume: m.volume,
    },
    markets: mks.map((x) => ({
      conditionId: x.conditionId,
      kind: x.kind,
      mapNo: x.mapNo,
      volume: x.volume,
      recent5: rmap.get(x.conditionId) ?? 0,
    })),
    selected: sel?.conditionId ?? null,
    selectedKind: sel?.kind ?? null,
    selP1,
    live,
    pre,
    holders,
    now: Date.now(),
  });
}

export const GET = guard(handler);

/** Разметка матча вручную: { fix: "fixed" | "normal" | "" } — «слив» / «норма» / сброс. */
async function postHandler(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const body = (await req.json().catch(() => ({}))) as { fix?: string };
  const fix = body.fix === "fixed" || body.fix === "normal" ? body.fix : "";
  const r = await db
    .update(matches)
    .set({ fixLabel: fix, updatedAt: new Date() })
    .where(eq(matches.slug, slug))
    .returning({ slug: matches.slug });
  if (!r.length) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ ok: true, fixLabel: fix });
}

export const POST = guard(postHandler);
