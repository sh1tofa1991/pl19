import { NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { walletStats } from "@/db/schema";
import { label } from "@/lib/analytics";

export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(_req: Request, ctx: { params: Promise<{ address: string }> }) {
  const { address: raw } = await ctx.params;
  const address = raw.toLowerCase();
  const [w] = await db.select().from(walletStats).where(eq(walletStats.address, address));
  if (!w) return NextResponse.json({ error: "not found" }, { status: 404 });

  // per-match positions of this wallet
  const posRes: any = await db.execute(sql`
    select t.condition_id as cond, t.outcome_idx as idx,
      sum(case when t.side='BUY' then t.usd else 0 end) as buy,
      sum(case when t.side='SELL' then t.usd else 0 end) as sell,
      sum(case when t.side='BUY' then t.shares else -t.shares end) as net,
      max(t.ts) as last,
      m.slug, m.title, m.game, m.team1, m.team2, m.status, m.winner_idx as winner, m.start_time as start, m.price1
    from trades t
    join markets mk on mk.condition_id = t.condition_id and mk.kind='match'
    join matches m on m.slug = mk.match_slug
    where t.wallet = ${address}
    group by t.condition_id, t.outcome_idx, m.slug, m.title, m.game, m.team1, m.team2, m.status, m.winner_idx, m.start_time, m.price1
  `);
  const byCond = new Map<string, any>();
  for (const r of posRes.rows) {
    const c = byCond.get(r.cond) ?? {
      slug: r.slug, title: r.title, game: r.game, team1: r.team1, team2: r.team2, status: r.status,
      winner: r.winner, start: new Date(r.start).getTime(), price1: r.price1,
      buy: [0, 0], sell: [0, 0], net: [0, 0], last: 0,
    };
    c.buy[r.idx] = Number(r.buy);
    c.sell[r.idx] = Number(r.sell);
    c.net[r.idx] = Number(r.net);
    c.last = Math.max(c.last, new Date(r.last).getTime());
    byCond.set(r.cond, c);
  }
  const mine = new Map<string, number>(); // cond -> side
  const history = [...byCond.entries()]
    .map(([cond, c]) => {
      const buy = c.buy[0] + c.buy[1];
      const sell = c.sell[0] + c.sell[1];
      const side = c.buy[0] >= c.buy[1] ? 0 : 1;
      mine.set(cond, side);
      let result: "win" | "loss" | "open" = "open";
      let pnl = 0;
      if (c.status === "finished" && c.winner !== null) {
        pnl = Math.max(0, c.net[c.winner]) + sell - buy;
        result = pnl > 0 ? "win" : "loss";
      }
      return {
        slug: c.slug,
        title: c.title,
        game: c.game,
        team: side === 0 ? c.team1 : c.team2,
        staked: buy,
        pnl,
        result,
        last: c.last,
      };
    })
    .filter((h) => h.staked >= 1)
    .sort((a, b) => b.last - a.last);

  // network: other wallets betting the same matches
  const conds = [...mine.keys()];
  let network: any[] = [];
  if (conds.length) {
    const list = sql.join(conds.map((c) => sql`${c}`), sql`, `);
    const oth: any = await db.execute(sql`
      select wallet, condition_id as cond, outcome_idx as idx, sum(usd) as usd, max(case when name <> '' then name else null end) as name
      from trades
      where side='BUY' and condition_id in (${list}) and wallet <> ${address}
      group by wallet, condition_id, outcome_idx
    `);
    const agg = new Map<string, { name: string; together: Map<string, [number, number]> }>();
    for (const r of oth.rows) {
      const a = agg.get(r.wallet) ?? { name: "", together: new Map() };
      if (r.name) a.name = r.name;
      const t = a.together.get(r.cond) ?? [0, 0];
      t[r.idx] = Number(r.usd);
      a.together.set(r.cond, t);
      agg.set(r.wallet, a);
    }
    network = [...agg.entries()]
      .map(([addr, a]) => {
        let same = 0;
        for (const [cond, u] of a.together) {
          const side = u[0] >= u[1] ? 0 : 1;
          if (side === mine.get(cond)) same++;
        }
        const together = a.together.size;
        return { address: addr, name: label(a.name, addr), together, total: conds.length, same, pct: together ? same / together : 0 };
      })
      .filter((n) => n.together >= 2)
      .sort((a, b) => b.together - a.together || b.pct - a.pct)
      .slice(0, 10);
  }

  return NextResponse.json({
    wallet: {
      address: w.address,
      name: w.name,
      tag: w.tag,
      matches: w.matches,
      wins: w.wins,
      staked: w.staked,
      profit: w.profit,
      openUsd: w.openUsd,
      bigBets: w.bigBets,
      bigWins: w.bigWins,
      cs2: w.cs2,
      dota2: w.dota2,
      lastBetAt: w.lastBetAt?.getTime() ?? null,
    },
    history,
    network,
  });
}
