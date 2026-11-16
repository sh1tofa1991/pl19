export type TradeRow = {
  wallet: string;
  name: string;
  side: string;
  outcomeIdx: number;
  usd: number;
  price: number;
  ts: number; // ms
};

export type Reason = { ok: boolean; text: string };

export type WindowStat = {
  min: number;
  usd: [number, number];
  n: [number, number];
  lead: 0 | 1 | null;
  pct: number;
};

export type Analysis = {
  score: number;
  level: "low" | "medium" | "high";
  moneySide: 0 | 1 | null;
  moneyShare: number;
  moneyUsd: number;
  netUsd: number;
  totalUsd: [number, number];
  tradeCount: number;
  walletCount: number;
  avgBuy: number;
  lastTradeAgoSec: number | null;
  topWalletShare: number;
  topWalletName: string;
  topWalletCount: number;
  windows: WindowStat[];
  reasons: Reason[];
  switched: { wallet: string; name: string; from: number; to: number; usd: number }[];
  liveWallets: { wallet: string; name: string; usd: number; side: number; trades: number }[];
  biggest: { wallet: string; name: string; usd: number; side: number; price: number; ts: number }[];
  recent: { wallet: string; name: string; usd: number; side: number; price: number; ts: number; mult: number }[];
  timeline: { t: number; usd: [number, number]; odds0: number | null }[];
  sinceStart: { usd: [number, number]; trades: number; wallets: number };
  oddsFrom: number | null;
  oddsTo: number | null;
};

const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

export function levelOf(score: number): "low" | "medium" | "high" {
  return score >= 60 ? "high" : score >= 30 ? "medium" : "low";
}

export function shortAddr(a: string) {
  return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}

export function label(name: string, wallet: string) {
  return name && name.length > 0 ? name : shortAddr(wallet);
}

export function analyze(
  all: TradeRow[],
  opts: {
    asOf: number;
    windowMin: number;
    names: [string, string];
    prices: [number | null, number | null];
  },
): Analysis {
  const { asOf, windowMin, names } = opts;
  const buys = all
    .filter((t) => t.side === "BUY" && t.ts <= asOf)
    .sort((a, b) => a.ts - b.ts);
  const win = buys.filter((t) => t.ts > asOf - windowMin * 60000);

  const usd: [number, number] = [0, 0];
  for (const t of win) usd[t.outcomeIdx === 0 ? 0 : 1] += t.usd;
  const total = usd[0] + usd[1];
  const lead: 0 | 1 | null = total > 0 ? (usd[0] >= usd[1] ? 0 : 1) : null;
  const share = lead === null ? 0 : usd[lead] / total;

  // wallets on lead side
  const perWallet = new Map<string, { name: string; usd: number }>();
  if (lead !== null) {
    for (const t of win) {
      if (t.outcomeIdx !== lead) continue;
      const cur = perWallet.get(t.wallet) ?? { name: t.name, usd: 0 };
      cur.usd += t.usd;
      if (t.name) cur.name = t.name;
      perWallet.set(t.wallet, cur);
    }
  }
  let topWallet = "";
  let topUsd = 0;
  for (const [w, v] of perWallet) {
    if (v.usd > topUsd) {
      topUsd = v.usd;
      topWallet = w;
    }
  }
  const leadUsd = lead === null ? 0 : usd[lead];
  const topShare = leadUsd > 0 ? topUsd / leadUsd : 0;
  const avgBuy = win.length ? total / win.length : 0;
  const maxTrade = win.reduce((m, t) => Math.max(m, t.usd), 0);
  const mult = avgBuy > 0 ? maxTrade / avgBuy : 0;
  const leadPrice = lead === null ? null : opts.prices[lead];

  // score
  let score = 0;
  const reasons: Reason[] = [];
  if (win.length < 3 || total < 30) {
    reasons.push({ ok: false, text: "Мало сделок в окне анализа — данных недостаточно" });
  } else {
    const leadName = names[lead as number];
    const p1 = clamp((share - 0.55) / 0.4) * 30;
    const p2 = clamp((topShare - 0.3) / 0.6) * 25;
    const p3 = leadUsd > 500 ? clamp(Math.log10(leadUsd / 500) / Math.log10(40)) * 20 : 0;
    const p4 = clamp((mult - 3) / 12) * 10;
    const p5 = leadPrice !== null ? (leadPrice < 0.4 ? 10 : leadPrice < 0.5 ? 5 : 0) : 0;
    score = Math.round(Math.min(100, p1 + p2 + p3 + p4 + p5));
    reasons.push({
      ok: share >= 0.7,
      text: `${Math.round(share * 100)}% свежих денег пришло на ${leadName}`,
    });
    reasons.push({
      ok: topShare >= 0.5,
      text:
        topShare >= 0.5
          ? `Один кошелёк даёт ${Math.round(topShare * 100)}% этих денег`
          : `Деньги распределены между кошельками (топ-кошелёк ${Math.round(topShare * 100)}%)`,
    });
    reasons.push({
      ok: leadUsd >= 2000,
      text:
        leadUsd >= 2000
          ? `Крупные ставки для рынка такого размера ($${fmtK(leadUsd)} на ${leadName})`
          : `Объём на ${leadName} небольшой ($${fmtK(leadUsd)})`,
    });
    if (mult >= 6) reasons.push({ ok: true, text: `Разовая ставка в ${mult.toFixed(1)}× больше средней` });
    if (leadPrice !== null) {
      reasons.push({
        ok: leadPrice < 0.5,
        text:
          leadPrice < 0.5
            ? `${leadName} — андердог по цене (${Math.round(leadPrice * 100)}%), деньги идут против рынка`
            : `${leadName} — фаворит по цене (${Math.round(leadPrice * 100)}%)`,
      });
    }
  }

  // windows
  const windows: WindowStat[] = [1, 5, 15].map((m) => {
    const u: [number, number] = [0, 0];
    const n: [number, number] = [0, 0];
    for (const t of buys) {
      if (t.ts > asOf - m * 60000) {
        const i = t.outcomeIdx === 0 ? 0 : 1;
        u[i] += t.usd;
        n[i] += 1;
      }
    }
    const tot = u[0] + u[1];
    const l: 0 | 1 | null = tot > 0 ? (u[0] >= u[1] ? 0 : 1) : null;
    return { min: m, usd: u, n, lead: l, pct: l === null ? 0 : u[l] / tot };
  });

  // switched sides (whole history)
  const byWallet = new Map<string, TradeRow[]>();
  for (const t of buys) {
    const arr = byWallet.get(t.wallet) ?? [];
    arr.push(t);
    byWallet.set(t.wallet, arr);
  }
  const switched: Analysis["switched"] = [];
  const liveW: Analysis["liveWallets"] = [];
  for (const [w, arr] of byWallet) {
    const first = arr[0].outcomeIdx;
    const last = arr[arr.length - 1].outcomeIdx;
    const nm = arr.find((x) => x.name)?.name ?? "";
    if (first !== last) {
      const usdNew = arr.filter((x) => x.outcomeIdx === last).reduce((s, x) => s + x.usd, 0);
      switched.push({ wallet: w, name: nm, from: first, to: last, usd: usdNew });
    }
    const recent = arr.filter((x) => x.ts > asOf - 30 * 60000);
    if (recent.length) {
      const u = [0, 0];
      for (const x of recent) u[x.outcomeIdx === 0 ? 0 : 1] += x.usd;
      liveW.push({
        wallet: w,
        name: nm,
        usd: u[0] + u[1],
        side: u[0] >= u[1] ? 0 : 1,
        trades: recent.length,
      });
    }
  }
  switched.sort((a, b) => b.usd - a.usd);
  liveW.sort((a, b) => b.usd - a.usd);

  const biggest = [...win]
    .sort((a, b) => b.usd - a.usd)
    .slice(0, 6)
    .map((t) => ({ wallet: t.wallet, name: t.name, usd: t.usd, side: t.outcomeIdx, price: t.price, ts: t.ts }));
  const recent = buys
    .slice(-12)
    .reverse()
    .map((t) => ({
      wallet: t.wallet,
      name: t.name,
      usd: t.usd,
      side: t.outcomeIdx,
      price: t.price,
      ts: t.ts,
      mult: avgBuy > 0 ? t.usd / avgBuy : 0,
    }));

  // timeline
  const timeline: Analysis["timeline"] = [];
  const sinceUsd: [number, number] = [0, 0];
  for (const t of buys) sinceUsd[t.outcomeIdx === 0 ? 0 : 1] += t.usd;
  if (buys.length) {
    const t0 = buys[0].ts;
    const span = Math.max(asOf - t0, 60000);
    const N = 24;
    const step = span / N;
    let carry: number | null = null;
    let idx = 0;
    for (let b = 0; b < N; b++) {
      const lo = t0 + b * step;
      const hi = lo + step;
      const u: [number, number] = [0, 0];
      while (idx < buys.length && buys[idx].ts < hi + (b === N - 1 ? 1 : 0)) {
        const t = buys[idx];
        u[t.outcomeIdx === 0 ? 0 : 1] += t.usd;
        carry = t.outcomeIdx === 0 ? t.price : 1 - t.price;
        idx++;
      }
      timeline.push({ t: lo, usd: u, odds0: carry });
    }
  }
  const ppOf = (t: TradeRow) => (t.outcomeIdx === 0 ? t.price : 1 - t.price);
  const oddsFrom = buys.length ? ppOf(buys[0]) : null;
  const oddsTo = buys.length ? ppOf(buys[buys.length - 1]) : null;

  return {
    score,
    level: levelOf(score),
    moneySide: lead,
    moneyShare: share,
    moneyUsd: leadUsd,
    netUsd: lead === null ? 0 : usd[lead] - usd[lead === 0 ? 1 : 0],
    totalUsd: usd,
    tradeCount: win.length,
    walletCount: new Set(win.map((t) => t.wallet)).size,
    avgBuy,
    lastTradeAgoSec: buys.length ? Math.max(0, Math.round((asOf - buys[buys.length - 1].ts) / 1000)) : null,
    topWalletShare: topShare,
    topWalletName: topWallet ? label(perWallet.get(topWallet)?.name ?? "", topWallet) : "",
    topWalletCount: perWallet.size,
    windows,
    reasons,
    switched,
    liveWallets: liveW,
    biggest,
    recent,
    timeline,
    sinceStart: {
      usd: sinceUsd,
      trades: buys.length,
      wallets: byWallet.size,
    },
    oddsFrom,
    oddsTo,
  };
}

export function fmtK(n: number) {
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e4) return Math.round(n / 1000) + "k";
  if (n >= 1000) return (n / 1000).toFixed(1) + "k";
  return String(Math.round(n));
}
