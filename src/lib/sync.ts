import { and, asc, desc, eq, inArray, lt, sql } from "drizzle-orm";
import { db } from "@/db";
import { markets, matches, syncState, trades, walletStats } from "@/db/schema";
import { analyze, type TradeRow } from "@/lib/analytics";

const GAMMA = "https://gamma-api.polymarket.com";
const DATA = "https://data-api.polymarket.com/v2";
const SERIES: Record<string, string> = { cs2: "10310", dota2: "10309" };

/* eslint-disable @typescript-eslint/no-explicit-any */

async function getJson(url: string, tries = 3): Promise<any> {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, {
        headers: { "Accept-Encoding": "gzip", Accept: "application/json" },
        signal: AbortSignal.timeout(15000),
        cache: "no-store",
      });
      if (res.status === 429) {
        const wait = Number(res.headers.get("retry-after") ?? "1");
        await new Promise((r) => setTimeout(r, Math.min(5, wait) * 1000));
        continue;
      }
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return await res.json();
    } catch (e) {
      if (i === tries - 1) throw e;
      await new Promise((r) => setTimeout(r, 500 * (i + 1)));
    }
  }
}

async function pmap<T>(items: T[], limit: number, fn: (x: T) => Promise<void>) {
  let i = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (i < items.length) {
      const item = items[i++];
      try {
        await fn(item);
      } catch (e) {
        state.lastError = String((e as Error).message ?? e);
      }
    }
  });
  await Promise.all(workers);
}

type SyncMem = {
  running: boolean;
  lastFull: number;
  lastLive: number;
  lastBackfill: number;
  lastError: string;
  lastErrorAt: number;
  failures: number;
  phase: string;
  startedAt: number;
};
const g = globalThis as typeof globalThis & { __pmSync?: SyncMem };
g.__pmSync ??= {
  running: false,
  lastFull: 0,
  lastLive: 0,
  lastBackfill: 0,
  lastError: "",
  lastErrorAt: 0,
  failures: 0,
  phase: "idle",
  startedAt: Date.now(),
};
const state = g.__pmSync;

export function syncInfo() {
  return {
    running: state.running,
    phase: state.phase,
    lastFull: state.lastFull,
    lastLive: state.lastLive,
    lastError: state.lastError,
  };
}

/* ----------------------------- parsing events ----------------------------- */

const parseArr = (s: unknown): any[] => {
  if (Array.isArray(s)) return s;
  try {
    return JSON.parse(String(s));
  } catch {
    return [];
  }
};

function gameOf(slug: string) {
  return slug.startsWith("dota2") ? "dota2" : "cs2";
}

async function upsertEvent(e: any): Promise<string | null> {
  const ml = (e.markets ?? []).find((m: any) => m.sportsMarketType === "moneyline");
  if (!ml) return null;
  const outcomes = parseArr(ml.outcomes);
  if (outcomes.length !== 2) return null;
  const prices = parseArr(ml.outcomePrices).map(Number);
  const startIso = e.startTime ?? (ml.gameStartTime ? String(ml.gameStartTime).replace(" ", "T").replace("+00", "Z") : e.startDate);
  const start = new Date(startIso);
  if (isNaN(start.getTime())) return null;

  const title: string = e.title ?? "";
  const bo = /\((BO\d)\)/i.exec(title)?.[1]?.toUpperCase() ?? (/bo(\d)/i.exec(e.score ?? "")?.[0]?.toUpperCase() ?? "BO3");
  const tournament = title.includes(" - ") ? title.split(" - ").slice(1).join(" - ").trim() : "";
  const cleanTitle = title.replace(/^[^:]+:\s*/, "").split(" - ")[0].replace(/\s*\(BO\d\)\s*$/i, "").trim();

  const decided = prices.length === 2 && Math.max(...prices) > 0.95 && Math.min(...prices) < 0.05;
  const winnerIdx = decided ? (prices[0] > prices[1] ? 0 : 1) : null;
  const finished = Boolean(e.closed || e.ended);
  const now = Date.now();
  const status = finished
    ? "finished"
    : e.live === true || (start.getTime() <= now && now - start.getTime() < 10 * 3600_000)
      ? "live"
      : "upcoming";
  const scoreText = String(e.score ?? "").split("|")[1] ?? "";
  const vol = Number(ml.volume ?? e.volume ?? 0) || 0;
  const slug = e.slug as string;

  const p1 = !finished && prices.length === 2 && prices[0] > 0 && prices[0] < 1 ? prices[0] : null;
  await db
    .insert(matches)
    .values({
      slug,
      eventId: String(e.id),
      game: gameOf(slug),
      title: cleanTitle,
      team1: outcomes[0],
      team2: outcomes[1],
      bestOf: bo,
      tournament,
      startTime: start,
      status,
      winnerIdx,
      scoreText,
      closedAt: e.closedTime ? new Date(String(e.closedTime).replace(" ", "T").replace(/\+00$/, "Z")) : null,
      volume: vol,
      price1: p1,
      price2: p1 === null ? null : 1 - p1,
    })
    .onConflictDoUpdate({
      target: matches.slug,
      set: {
        title: cleanTitle,
        startTime: start,
        status,
        winnerIdx,
        scoreText,
        closedAt: e.closedTime ? new Date(String(e.closedTime).replace(" ", "T").replace(/\+00$/, "Z")) : null,
        volume: vol,
        ...(p1 !== null ? { price1: p1, price2: 1 - p1 } : {}),
        updatedAt: new Date(),
      },
    });

  for (const m of e.markets ?? []) {
    const kind = m.sportsMarketType === "moneyline" ? "match" : m.sportsMarketType === "child_moneyline" ? "map" : null;
    if (!kind) continue;
    const mapNo = kind === "map" ? Number(/(?:Map|Game)\s+(\d+)/i.exec(m.question ?? "")?.[1] ?? 0) : 0;
    if (kind === "map" && !mapNo) continue;
    const toks = parseArr(m.clobTokenIds);
    const pr = parseArr(m.outcomePrices).map(Number);
    const dec = pr.length === 2 && Math.max(...pr) > 0.95 && Math.min(...pr) < 0.05;
    await db
      .insert(markets)
      .values({
        conditionId: m.conditionId,
        matchSlug: slug,
        kind,
        mapNo,
        token1: toks[0] ?? "",
        token2: toks[1] ?? "",
        price1: pr[0] ?? null,
        price2: pr[1] ?? null,
        volume: Number(m.volume ?? 0) || 0,
        winnerIdx: dec ? (pr[0] > pr[1] ? 0 : 1) : null,
        closed: Boolean(m.closed),
      })
      .onConflictDoUpdate({
        target: markets.conditionId,
        set: {
          price1: pr[0] ?? null,
          price2: pr[1] ?? null,
          volume: Number(m.volume ?? 0) || 0,
          winnerIdx: dec ? (pr[0] > pr[1] ? 0 : 1) : null,
          closed: Boolean(m.closed),
        },
      });
  }
  return slug;
}

/* ------------------------------ syncing trades ----------------------------- */

const walletName = (t: any) => {
  const n = String(t.name ?? "");
  if (n && !/^0x[0-9a-f]{20,}/i.test(n)) return n;
  return String(t.pseudonym ?? "");
};

async function fetchTrades(conditionId: string, pages: number, limit: number) {
  const out: any[] = [];
  let cursor: string | null = null;
  for (let p = 0; p < pages; p++) {
    const url: string = `${DATA}/trades?condition=${conditionId}&limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
    const j = await getJson(url);
    out.push(...(j.data ?? []));
    cursor = j.pagination?.has_more ? j.pagination.next_cursor : null;
    if (!cursor) break;
  }
  return out;
}

async function syncMarketTrades(slug: string, conditionId: string, pages: number, limit: number) {
  const rows = await fetchTrades(conditionId, pages, limit);
  const values = rows
    .filter((t) => t.size > 0 && t.price > 0 && t.proxy_wallet)
    .map((t) => ({
      id: `${t.transaction_hash}:${t.proxy_wallet}:${String(t.token_id).slice(-8)}:${t.side}:${t.size}`,
      conditionId,
      matchSlug: slug,
      wallet: String(t.proxy_wallet).toLowerCase(),
      name: walletName(t),
      side: String(t.side),
      outcomeIdx: Number(t.outcome_index) === 1 ? 1 : 0,
      shares: Number(t.size),
      price: Number(t.price),
      usd: Number(t.size) * Number(t.price),
      ts: new Date(Number(t.timestamp) * 1000),
    }));
  for (let i = 0; i < values.length; i += 400) {
    await db.insert(trades).values(values.slice(i, i + 400)).onConflictDoNothing();
  }
  return values.length;
}

async function refreshPrices(slug: string, conditionId: string) {
  const last = await db
    .select()
    .from(trades)
    .where(eq(trades.conditionId, conditionId))
    .orderBy(desc(trades.ts))
    .limit(1);
  const first = await db
    .select()
    .from(trades)
    .where(eq(trades.conditionId, conditionId))
    .orderBy(asc(trades.ts))
    .limit(1);
  const p0 = (t: { outcomeIdx: number; price: number }) => (t.outcomeIdx === 0 ? t.price : 1 - t.price);
  const set: Record<string, unknown> = {};
  if (last[0]) {
    set.price1 = p0(last[0]);
    set.price2 = 1 - p0(last[0]);
  }
  if (first[0]) set.openPrice1 = p0(first[0]);
  if (Object.keys(set).length) await db.update(matches).set(set).where(eq(matches.slug, slug));
}

async function syncMatchTrades(slug: string, opts: { live: boolean; deep: boolean }) {
  const mks = await db.select().from(markets).where(eq(markets.matchSlug, slug));
  const ml = mks.find((m) => m.kind === "match");
  if (!ml) return;
  await syncMarketTrades(slug, ml.conditionId, opts.deep ? 4 : 1, opts.deep ? 1000 : 300);
  if (opts.live) {
    for (const m of mks.filter((x) => x.kind === "map" && !x.closed)) {
      await syncMarketTrades(slug, m.conditionId, 1, opts.deep ? 500 : 150);
    }
  }
  await refreshPrices(slug, ml.conditionId);
  await db.update(matches).set({ tradesSyncedAt: new Date() }).where(eq(matches.slug, slug));
}

/* ------------------------------ signal storage ----------------------------- */

export async function finalizeSignal(slug: string) {
  const [m] = await db.select().from(matches).where(eq(matches.slug, slug));
  if (!m || m.status !== "finished" || m.winnerIdx === null) return;
  const [ml] = await db
    .select()
    .from(markets)
    .where(and(eq(markets.matchSlug, slug), eq(markets.kind, "match")));
  if (!ml) return;
  const rows = await db
    .select()
    .from(trades)
    .where(and(eq(trades.conditionId, ml.conditionId), lt(trades.ts, m.startTime)));
  if (rows.length < 3) {
    await db.update(matches).set({ signalScore: null, signalSide: null }).where(eq(matches.slug, slug));
    return;
  }
  const tr: TradeRow[] = rows.map((t) => ({
    wallet: t.wallet,
    name: t.name,
    side: t.side,
    outcomeIdx: t.outcomeIdx,
    usd: t.usd,
    price: t.price,
    ts: t.ts.getTime(),
  }));
  const lastP = [...tr].sort((a, b) => b.ts - a.ts)[0];
  const pr0 = lastP.outcomeIdx === 0 ? lastP.price : 1 - lastP.price;
  const a = analyze(tr, { asOf: m.startTime.getTime(), windowMin: 360, names: [m.team1, m.team2], prices: [pr0, 1 - pr0] });
  if (a.moneySide === null) return;
  const sidePrice = a.moneySide === 0 ? pr0 : 1 - pr0;
  await db
    .update(matches)
    .set({
      signalScore: a.score,
      signalSide: a.moneySide,
      signalPrice: Math.min(0.97, Math.max(0.03, sidePrice)),
      signalWon: a.moneySide === m.winnerIdx,
    })
    .where(eq(matches.slug, slug));
}

/* ------------------------------- wallet stats ------------------------------ */

export async function recomputeWallets() {
  const res: any = await db.execute(sql`
    select t.wallet as wallet, t.condition_id as cond, t.outcome_idx as idx,
      sum(case when t.side='BUY' then t.usd else 0 end) as buy,
      sum(case when t.side='SELL' then t.usd else 0 end) as sell,
      sum(case when t.side='BUY' then t.shares else -t.shares end) as net,
      max(t.ts) as last,
      max(case when t.name <> '' then t.name else null end) as name
    from trades t join markets mk on mk.condition_id = t.condition_id and mk.kind = 'match'
    group by t.wallet, t.condition_id, t.outcome_idx
  `);
  const mk = await db
    .select({
      cond: markets.conditionId,
      winner: markets.winnerIdx,
      p1: matches.price1,
      status: matches.status,
      game: matches.game,
      mw: matches.winnerIdx,
    })
    .from(markets)
    .innerJoin(matches, eq(matches.slug, markets.matchSlug))
    .where(eq(markets.kind, "match"));
  const mmap = new Map(mk.map((m) => [m.cond, m]));

  type Pos = { buy: number[]; sell: number[]; net: number[]; last: number };
  const per = new Map<string, { name: string; last: number; conds: Map<string, Pos> }>();
  for (const r of res.rows as any[]) {
    const w = per.get(r.wallet) ?? { name: "", last: 0, conds: new Map<string, Pos>() };
    if (r.name) w.name = r.name;
    const last = new Date(r.last).getTime();
    w.last = Math.max(w.last, last);
    const p = w.conds.get(r.cond) ?? { buy: [0, 0], sell: [0, 0], net: [0, 0], last: 0 };
    p.buy[r.idx] = Number(r.buy);
    p.sell[r.idx] = Number(r.sell);
    p.net[r.idx] = Number(r.net);
    p.last = Math.max(p.last, last);
    w.conds.set(r.cond, p);
    per.set(r.wallet, w);
  }

  const out: (typeof walletStats.$inferInsert)[] = [];
  for (const [addr, w] of per) {
    let n = 0, wins = 0, staked = 0, profit = 0, cs2 = 0, dota = 0, big = 0, bigW = 0, open = 0;
    for (const [cond, p] of w.conds) {
      const m = mmap.get(cond);
      if (!m) continue;
      const buy = p.buy[0] + p.buy[1];
      const sell = p.sell[0] + p.sell[1];
      if (buy < 1) continue;
      if (m.status === "finished" && m.mw !== null) {
        n++;
        staked += buy;
        const payout = Math.max(0, p.net[m.mw]);
        const pr = payout + sell - buy;
        profit += pr;
        if (pr > 0) wins++;
        if (m.game === "cs2") cs2++;
        else dota++;
        if (buy >= 200) {
          big++;
          if (pr > 0) bigW++;
        }
      } else if (m.status !== "finished") {
        const p1 = m.p1 ?? 0.5;
        open += Math.max(0, p.net[0]) * p1 + Math.max(0, p.net[1]) * (1 - p1);
      }
    }
    if (n === 0 && open < 50) continue;
    const wr = n ? wins / n : 0;
    const tag = n >= 7 && wr >= 0.85 && profit > 0 && profit / Math.max(1, staked) >= 0.15 ? "suspect" : n >= 5 && wr >= 0.75 && profit > 0 ? "strong" : "";
    out.push({
      address: addr,
      name: w.name,
      matches: n,
      wins,
      staked,
      profit,
      cs2,
      dota2: dota,
      bigBets: big,
      bigWins: bigW,
      openUsd: open,
      tag,
      lastBetAt: new Date(w.last),
      updatedAt: new Date(),
    });
  }
  await db.delete(walletStats);
  for (let i = 0; i < out.length; i += 500) {
    await db.insert(walletStats).values(out.slice(i, i + 500)).onConflictDoNothing();
  }
}

/* ---------------------------------- jobs ----------------------------------- */

async function syncActive() {
  state.phase = "events";
  const now = Date.now();
  const seen = new Set<string>();
  const endMin = new Date(now - 14 * 3600_000).toISOString();
  const endMax = new Date(now + 3 * 86400_000).toISOString();
  for (const sid of Object.values(SERIES)) {
    for (let off = 0; off < 150; off += 50) {
      const url = `${GAMMA}/events?series_id=${sid}&closed=false&limit=50&offset=${off}&order=startDate&ascending=false&end_date_min=${endMin}&end_date_max=${endMax}`;
      const list: any[] = await getJson(url);
      if (!Array.isArray(list)) break;
      for (const e of list) {
        const st = new Date(e.startTime ?? e.startDate).getTime();
        if (isNaN(st) || st < now - 14 * 3600_000 || st > now + 2 * 86400_000) continue;
        const s = await upsertEvent(e);
        if (s) seen.add(s);
      }
      if (list.length < 50) break;
    }
  }
  // matches that vanished from active list: refresh individually (finished)
  const stale = await db
    .select()
    .from(matches)
    .where(and(inArray(matches.status, ["live", "upcoming"]), lt(matches.startTime, new Date(now - 30 * 60_000))));
  const missing = stale.filter((m) => !seen.has(m.slug));
  await pmap(missing, 4, async (m) => {
    const list: any[] = await getJson(`${GAMMA}/events?slug=${m.slug}`);
    if (list[0]) {
      await upsertEvent(list[0]);
      await syncMatchTrades(m.slug, { live: false, deep: true });
      await finalizeSignal(m.slug);
    } else {
      await db.update(matches).set({ status: "finished" }).where(eq(matches.slug, m.slug));
    }
  });
}

async function syncOpenTrades(onlyLive: boolean) {
  state.phase = "trades";
  const now = Date.now();
  const list = await db
    .select()
    .from(matches)
    .where(inArray(matches.status, onlyLive ? ["live"] : ["live", "upcoming"]));
  const targets = list.filter((m) => m.status === "live" || m.startTime.getTime() < now + 12 * 3600_000);
  await pmap(targets, 5, async (m) => {
    await syncMatchTrades(m.slug, { live: m.status === "live", deep: !m.tradesSyncedAt });
  });
}

async function backfillFinished() {
  state.phase = "history";
  const picked: string[] = [];
  for (const sid of Object.values(SERIES)) {
    const list: any[] = await getJson(
      `${GAMMA}/events?series_id=${sid}&closed=true&limit=50&order=closedTime&ascending=false`,
    );
    let c = 0;
    for (const e of Array.isArray(list) ? list : []) {
      if (c >= 40) break;
      const s = await upsertEvent(e);
      if (!s) continue;
      const [m] = await db.select().from(matches).where(eq(matches.slug, s));
      if (m && m.winnerIdx !== null) {
        picked.push(s);
        c++;
      }
    }
  }
  const todo = await db
    .select()
    .from(matches)
    .where(and(inArray(matches.slug, picked.length ? picked : ["-"])));
  await pmap(
    todo.filter((m) => !m.tradesSyncedAt),
    4,
    async (m) => {
      await syncMatchTrades(m.slug, { live: false, deep: true });
      await finalizeSignal(m.slug);
    },
  );
  const noSig = todo.filter((m) => m.tradesSyncedAt && m.signalScore === null);
  await pmap(noSig, 4, async (m) => finalizeSignal(m.slug));
}

async function runSync() {
  if (state.running) return;
  state.running = true;
  state.startedAt = Date.now();
  try {
    const now = Date.now();
    if (now - state.lastFull > 120_000 || state.lastFull === 0) {
      await syncActive();
      await syncOpenTrades(false);
      state.lastFull = Date.now();
      state.lastLive = Date.now();
      state.phase = "wallets";
      await recomputeWallets();
      if (state.lastBackfill === 0 || Date.now() - state.lastBackfill > 20 * 60_000) {
        await backfillFinished();
        state.lastBackfill = Date.now();
        state.phase = "wallets";
        await recomputeWallets();
      }
    } else if (now - state.lastLive > 6_000) {
      await syncOpenTrades(true);
      state.lastLive = Date.now();
    }
    await db
      .insert(syncState)
      .values({ key: "last_sync", value: String(Date.now()) })
      .onConflictDoUpdate({ target: syncState.key, set: { value: String(Date.now()) } });
    state.failures = 0;
    state.lastError = "";
  } catch (e) {
    state.lastError = String((e as Error).message ?? e);
    state.lastErrorAt = Date.now();
    state.failures++;
  } finally {
    state.phase = "idle";
    state.running = false;
  }
}

/** Fire-and-forget: called from API routes to keep data fresh. */
export function kickSync() {
  if (state.running) {
    // recover from a stuck run
    if (Date.now() - state.startedAt > 10 * 60_000) state.running = false;
    return;
  }
  const now = Date.now();
  // экспоненциальный бэкофф после ошибок — не долбим API каждые пару секунд
  if (state.failures > 0 && now - state.lastErrorAt < Math.min(60_000, 15_000 * 2 ** Math.min(state.failures - 1, 2))) {
    return;
  }
  if (state.lastFull === 0 || now - state.lastFull > 120_000 || now - state.lastLive > 6_000) {
    void runSync();
  }
}
