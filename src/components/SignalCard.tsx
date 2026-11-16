"use client";

import { Chip, oddsOf, pct, usd } from "@/components/ui";

export type SignalProps = {
  slug: string;
  team1: string;
  team2: string;
  side: 0 | 1 | null;
  share: number;
  moneyUsd: number;
  topWalletShare: number;
  switched: number;
  score: number;
  price1: number | null;
  price2: number | null;
  openPrice1: number | null;
  status: string;
  marketLabel?: string;
  reasons?: { ok: boolean; text: string }[];
};

export default function SignalCard(p: SignalProps) {
  if (p.side === null) {
    return (
      <div className="rounded-xl border border-[#23232f] bg-[#101018] px-4 py-3 text-sm text-slate-500">
        Пока недостаточно сделок, чтобы определить сторону денег.
      </div>
    );
  }
  const team = p.side === 0 ? p.team1 : p.team2;
  const other = p.side === 0 ? p.team2 : p.team1;
  const price = p.side === 0 ? p.price1 : p.price2;
  const open = p.openPrice1 === null ? null : p.side === 0 ? p.openPrice1 : 1 - p.openPrice1;
  const pp = price !== null && open !== null ? Math.round((price - open) * 100) : null;
  const hot = p.score >= 60;
  const mid = p.score >= 30 && p.score < 60;
  const border = hot ? "border-red-500/40 bg-red-500/5" : mid ? "border-amber-500/30 bg-amber-500/5" : "border-emerald-500/30 bg-emerald-500/5";

  return (
    <div className={`rounded-xl border px-4 py-3 ${border}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-wider text-emerald-400">
            Ставка · сторона денег
            <span className="rounded border border-sky-400/40 bg-sky-400/10 px-1.5 py-0.5 normal-case text-sky-300">{p.marketLabel ?? "Победитель матча (серия)"}</span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-2xl font-extrabold text-white">{team}</span>
            <span className="text-xl font-bold text-slate-100">{oddsOf(price)}</span>
            <span className="text-sm text-slate-400">{pct(p.share)} на матче</span>
            {p.status === "live" && price !== null && (
              <span className="flex items-center gap-1.5 rounded-md border border-[#2f2f40] bg-[#16161f] px-2 py-0.5 text-sm">
                <i className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                <span className="text-[10px] font-bold text-slate-400">LIVE</span>
                <b className="text-white">{oddsOf(price)}</b>
                {pp !== null && pp !== 0 && (
                  <b className={pp > 0 ? "text-emerald-400" : "text-red-400"}>
                    {pp > 0 ? "▲" : "▼"} {Math.abs(pp)} pp
                  </b>
                )}
              </span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-xs text-slate-400">
            <span>vs {other}</span>
            {hot && <Chip tone="red">подозрение на слив</Chip>}
            {mid && <Chip tone="amber">аномальный поток</Chip>}
            <Chip tone="gray">${usd(p.moneyUsd).slice(1)} на {team}</Chip>
            {p.topWalletShare >= 0.5 && <Chip tone="amber">один кошелёк {pct(p.topWalletShare)}</Chip>}
            {p.switched > 0 && <Chip tone="blue">{p.switched} сменили сторону</Chip>}
          </div>
        </div>
        <a
          href={`https://polymarket.com/event/${p.slug}`}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-lg bg-sky-500 px-4 py-2 text-sm font-bold text-white hover:bg-sky-400"
        >
          Открыть на Polymarket ↗
        </a>
      </div>
      {p.reasons && p.reasons.length > 0 && (
        <div className="mt-3 rounded-lg border border-[#262633] bg-[#0e0e15]/70 px-3 py-2">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Почему скор {p.score >= 60 ? "высокий" : p.score >= 30 ? "средний" : "низкий"} ({p.score})
          </div>
          <ul className="mt-1 space-y-0.5 text-sm">
            {p.reasons.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className={r.ok ? "text-emerald-400" : "text-amber-400"}>{r.ok ? "✓" : "—"}</span>
                <span className="text-slate-300">{r.text}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
