"use client";

import Link from "next/link";
import { useState } from "react";
import SignalCard from "@/components/SignalCard";
import {
  COLORS,
  Card,
  GameBadge,
  Loading,
  ScoreRing,
  SplitBar,
  Stat,
  Tabs,
  Timeline,
  agoSec,
  nameOf,
  oddsOf,
  pct,
  startLabel,
  useNow,
  usePoll,
  usd,
} from "@/components/ui";
import type { Analysis } from "@/lib/analytics";

type Resp = {
  match: {
    slug: string;
    game: string;
    title: string;
    team1: string;
    team2: string;
    bestOf: string;
    tournament: string;
    start: number;
    status: string;
    scoreText: string;
    winnerIdx: number | null;
    price1: number | null;
    price2: number | null;
    openPrice1: number | null;
    volume: number;
  };
  markets: { conditionId: string; kind: string; mapNo: number; volume: number; recent5: number }[];
  selected: string | null;
  selectedKind: string | null;
  selP1: number | null;
  live: Analysis | null;
  pre: Analysis | null;
  holders: { sides: { wallet: string; name: string; shares: number; value: number }[][] } | null;
};

type Tab = "live" | "pre" | "cmp";
type Sub = "switched" | "wallets" | "holders" | "biggest";

function Dot({ side }: { side: number }) {
  return <i className="inline-block h-2 w-2 rounded-full" style={{ background: side === 0 ? COLORS.a : COLORS.b }} />;
}

function Windows({ a, names }: { a: Analysis; names: [string, string] }) {
  return (
    <div className="grid gap-2 md:grid-cols-3">
      {a.windows.map((w) => (
        <div key={w.min} className="rounded-lg border border-[#2c2230] bg-[#1a141c] p-3">
          <div className="text-[11px] text-slate-400">последние {w.min} мин</div>
          <div className="mt-0.5 text-sm font-bold text-white">
            {w.lead === null ? "нет сделок" : (
              <>
                {names[w.lead]} <span className="text-slate-400">{pct(w.pct)}</span>
              </>
            )}
          </div>
          <div className="my-1.5">
            <SplitBar a={w.usd[0]} b={w.usd[1]} />
          </div>
          <div className="text-[11px] text-slate-500">
            {usd(w.usd[0])} × {usd(w.usd[1])} · {w.n[0] + w.n[1]} сделок
          </div>
        </div>
      ))}
    </div>
  );
}

function Legend({ names }: { names: [string, string] }) {
  return (
    <div className="mt-2 flex gap-4 text-[11px] text-slate-400">
      <span className="flex items-center gap-1.5"><Dot side={0} /> {names[0]}</span>
      <span className="flex items-center gap-1.5"><Dot side={1} /> {names[1]}</span>
    </div>
  );
}

function Analytics({ a, names, odds }: { a: Analysis; names: [string, string]; odds: boolean }) {
  const lead = a.moneySide;
  const from = a.oddsFrom;
  const to = a.oddsTo;
  const side = (p: number | null) => (p === null ? null : lead === 1 ? 1 - p : p);
  const f = side(from);
  const t = side(to);
  const pp = f !== null && t !== null ? Math.round((t - f) * 100) : null;
  return (
    <>
      <div className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#23232f] bg-[#23232f] md:grid-cols-4">
        <div className="bg-[#12121a]">
          <Stat
            label="Деньги идут на"
            value={lead === null ? "—" : <span className="text-lg" style={{ color: lead === 0 ? COLORS.a : COLORS.b }}>● {names[lead]}</span>}
            sub={lead === null ? "" : `${usd(a.moneyUsd)} · ${pct(a.moneyShare)} · чистыми ${usd(a.netUsd)}`}
          />
        </div>
        <div className="bg-[#12121a]">
          <Stat
            label={lead === null ? "Коэффициент" : `Коэф. ${names[lead]}`}
            value={<span className="text-lg">{f !== null && t !== null ? `${oddsOf(f)} → ${oddsOf(t)}` : "—"}</span>}
            sub={pp !== null ? `${pp > 0 ? "+" : ""}${pp} pp ${odds ? "с начала потока" : "до старта"}` : ""}
          />
        </div>
        <div className="bg-[#12121a]">
          <Stat label="Концентрация" value={pct(a.topWalletShare)} sub={a.topWalletName ? `${a.topWalletName} · ${a.topWalletCount} кошельков` : "—"} tone={a.topWalletShare >= 0.5 ? "amber" : undefined} />
        </div>
        <div className="bg-[#12121a]">
          <Stat label="Сменили сторону" value={a.switched.length} sub={a.switched.length ? "см. вкладку ниже" : "нет кошельков"} />
        </div>
      </div>

      <div className="mt-4 border-t border-dashed border-[#2f2f40] pt-3">
        <div className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">
          Таймлайн · {names[0]} {usd(a.sinceStart.usd[0])} vs {names[1]} {usd(a.sinceStart.usd[1])} · {a.sinceStart.trades} сделок · {a.sinceStart.wallets} кошельков
        </div>
        <Timeline data={a.timeline} names={names} />
      </div>
    </>
  );
}

function SubTabs({ a, names, holders }: { a: Analysis; names: [string, string]; holders: Resp["holders"] }) {
  const [sub, setSub] = useState<Sub>("holders");
  const h = holders?.sides ?? [[], []];
  const Row = ({ n, w, right, left }: { n: string; w: string; right: string; left: string }) => (
    <div className="flex items-center justify-between gap-3 border-b border-[#1d1d28] py-1.5 text-sm">
      <a href={`https://polymarket.com/profile/${w}`} target="_blank" rel="noreferrer" className="truncate font-semibold text-slate-100 hover:text-sky-300">{n}</a>
      <span className="ml-auto text-slate-400">{left}</span>
      <span className="w-20 text-right text-slate-300">{right}</span>
    </div>
  );
  return (
    <div className="mt-4">
      <Tabs
        value={sub}
        onChange={setSub}
        options={[
          { v: "switched", label: "Сменили сторону", n: a.switched.length },
          { v: "wallets", label: "Живые кошельки", n: a.liveWallets.length },
          { v: "holders", label: "Держатели", n: h[0].length + h[1].length },
          { v: "biggest", label: "Крупнейшие ставки", n: a.biggest.length },
        ]}
      />
      <div className="mt-3">
        {sub === "holders" && (
          <>
            <div className="mb-2 text-[11px] uppercase tracking-wider text-slate-500">Топ держателей (текущая позиция, обновл. раз в минуту)</div>
            <div className="grid gap-6 md:grid-cols-2">
              {[0, 1].map((i) => (
                <div key={i}>
                  <div className="mb-1 text-sm font-bold" style={{ color: i === 0 ? COLORS.a : COLORS.b }}>{names[i]}</div>
                  {h[i].length === 0 && <div className="text-sm text-slate-500">нет данных</div>}
                  {h[i].map((x) => (
                    <Row key={x.wallet} n={x.name} w={x.wallet} left={`${Math.round(x.shares).toLocaleString("ru-RU")} шт.`} right={`≈ ${usd(x.value)}`} />
                  ))}
                </div>
              ))}
            </div>
          </>
        )}
        {sub === "switched" &&
          (a.switched.length === 0 ? (
            <div className="text-sm text-slate-500">Кошельков, поменявших сторону, нет.</div>
          ) : (
            a.switched.slice(0, 10).map((s) => (
              <Row key={s.wallet} n={nameOf(s.name, s.wallet)} w={s.wallet} left={`${names[s.from]} → ${names[s.to]}`} right={usd(s.usd)} />
            ))
          ))}
        {sub === "wallets" &&
          (a.liveWallets.length === 0 ? (
            <div className="text-sm text-slate-500">За последние 30 минут активности нет.</div>
          ) : (
            a.liveWallets.slice(0, 10).map((s) => (
              <Row key={s.wallet} n={nameOf(s.name, s.wallet)} w={s.wallet} left={`${names[s.side]} · ${s.trades} сделок`} right={usd(s.usd)} />
            ))
          ))}
        {sub === "biggest" &&
          (a.biggest.length === 0 ? (
            <div className="text-sm text-slate-500">Нет сделок.</div>
          ) : (
            a.biggest.map((s, i) => (
              <Row key={i} n={nameOf(s.name, s.wallet)} w={s.wallet} left={`${names[s.side]} @ ${oddsOf(s.price)}`} right={usd(s.usd)} />
            ))
          ))}
      </div>
    </div>
  );
}

function LiveTab({ d, now }: { d: Resp; now: number }) {
  const a = d.live!;
  const m = d.match;
  const names: [string, string] = [m.team1, m.team2];
  const live = m.status === "live";
  const mins = Math.max(0, Math.round((now - m.start) / 60000));
  return (
    <div className="rounded-xl border border-[#3a2228] bg-[#171116] p-4">
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-white">
        <span className={`rounded border px-1.5 py-0.5 text-[10px] ${live ? "border-red-500/50 bg-red-500/15 text-red-300" : "border-slate-500/40 text-slate-300"}`}>{live ? "live" : "скоро"}</span>
        {live ? `${mins} мин с начала матча` : `матч начнётся ${startLabel(m.start, now).rel}`}
      </div>
      <div className="rounded-xl border border-[#3a2228] bg-[#1b1318] p-3">
        <div className="mb-2 flex flex-wrap items-center gap-2 text-sm">
          <i className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          <b className="text-white">Деньги в реальном времени</b>
          <span className="text-xs text-slate-500">
            {a.lastTradeAgoSec !== null ? `последняя сделка ${agoSec(a.lastTradeAgoSec)} назад` : "сделок нет"} · средняя покупка {usd(a.avgBuy)}
          </span>
        </div>
        <Windows a={a} names={names} />
        <Legend names={names} />
        <div className="mt-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Последние сделки ({a.recent.length})</div>
        <div className="mt-1 max-h-64 overflow-y-auto rounded-md border border-[#2a2029] bg-[#130e14]">
          {a.recent.map((t, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 border-l-2 px-3 py-1 text-sm ${t.mult >= 5 ? "bg-amber-500/10" : ""}`}
              style={{ borderLeftColor: t.side === 0 ? COLORS.a : COLORS.b }}
            >
              <span className="w-10 text-slate-500">{agoSec(Math.max(0, Math.round((now - t.ts) / 1000)))}</span>
              <span className="w-14 font-bold text-white">{usd(t.usd)}</span>
              <span className="flex-1 truncate">
                {names[t.side]} {t.mult >= 5 && <span className="text-xs text-amber-300">{t.mult.toFixed(1)}× от средней</span>}
              </span>
              <span className="text-slate-400">@ {oddsOf(t.price)}</span>
            </div>
          ))}
          {a.recent.length === 0 && <div className="p-3 text-sm text-slate-500">Пока нет сделок по этому рынку.</div>}
        </div>
      </div>
      <div className="mt-3 text-xs text-slate-500">анализ кошельков: последние 30 мин · информативно, не является рекомендацией</div>
      <Analytics a={a} names={names} odds />
      <SubTabs a={a} names={names} holders={d.holders} />
    </div>
  );
}

function PreTab({ d }: { d: Resp }) {
  const a = d.pre!;
  const m = d.match;
  const names: [string, string] = [m.team1, m.team2];
  return (
    <div className="rounded-xl border border-[#23232f] bg-[#12121a] p-4">
      <div className="mb-2 text-sm font-bold text-white">Pre-game сигнал — деньги до старта матча (окно 6 часов)</div>
      <Windows a={{ ...a, windows: a.windows }} names={names} />
      <Legend names={names} />
      <Analytics a={a} names={names} odds={false} />
      <SubTabs a={a} names={names} holders={d.holders} />
    </div>
  );
}

function CompareTab({ d }: { d: Resp }) {
  const m = d.match;
  const names: [string, string] = [m.team1, m.team2];
  const pre = d.pre!;
  const live = d.live!;
  const same = pre.moneySide !== null && pre.moneySide === live.moneySide;
  const rows: [string, string, string][] = [
    ["Сторона денег", pre.moneySide === null ? "—" : names[pre.moneySide], live.moneySide === null ? "—" : names[live.moneySide]],
    ["Доля денег", pct(pre.moneyShare), pct(live.moneyShare)],
    ["Объём на стороне", usd(pre.moneyUsd), usd(live.moneyUsd)],
    ["Топ-кошелёк", `${pct(pre.topWalletShare)} ${pre.topWalletName}`, `${pct(live.topWalletShare)} ${live.topWalletName}`],
    ["Сделок / кошельков", `${pre.tradeCount} / ${pre.walletCount}`, `${live.tradeCount} / ${live.walletCount}`],
    ["Сменили сторону", String(pre.switched.length), String(live.switched.length)],
    ["Скор аномалии", String(pre.score), String(live.score)],
  ];
  return (
    <div className="rounded-xl border border-[#23232f] bg-[#12121a] p-4">
      <div className={`mb-3 rounded-lg border px-3 py-2 text-sm ${same ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300" : "border-amber-500/30 bg-amber-500/10 text-amber-300"}`}>
        {pre.moneySide === null || live.moneySide === null
          ? "Недостаточно данных для сравнения pre-game и live потоков."
          : same
            ? `✓ Pre-game и live деньги идут на одну сторону — ${names[live.moneySide]}.`
            : `⚠ Деньги развернулись: до старта на ${names[pre.moneySide]}, сейчас на ${names[live.moneySide]}.`}
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wider text-slate-500">
            <th className="py-1.5">Метрика</th>
            <th>Pre-game</th>
            <th>Live (30 мин)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r[0]} className="border-t border-[#1d1d28]">
              <td className="py-2 text-slate-400">{r[0]}</td>
              <td className="font-semibold text-white">{r[1]}</td>
              <td className="font-semibold text-white">{r[2]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MatchPage({ slug }: { slug: string }) {
  const [market, setMarket] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("live");
  const { data, loading, error } = usePoll<Resp>(`/api/matches/${slug}${market ? `?market=${market}` : ""}`, 5000);
  const now = useNow(1000);

  if (loading && !data) return <Loading />;
  if (!data || error === "404")
    return (
      <Card className="p-10 text-center text-slate-400">
        Матч не найден. <Link href="/" className="text-sky-400 underline">К списку</Link>
      </Card>
    );
  const m = data.match;
  const names: [string, string] = [m.team1, m.team2];
  const finished = m.status === "finished";
  const main = m.status === "live" ? data.live : data.pre;
  const st = startLabel(m.start, now);
  const mapLabel = (x: Resp["markets"][number]) => (x.kind === "match" ? "Матч" : `Карта ${x.mapNo}`);
  const marketLabel = data.selectedKind === "map" ? `Победитель карты ${data.markets.find((x) => x.conditionId === data.selected)?.mapNo}` : "Победитель матча (серия)";

  return (
    <div className="space-y-4">
      <Link href="/" className="text-xs text-slate-500 hover:text-slate-300">← все матчи</Link>

      <div className="flex flex-wrap items-center gap-4">
        <ScoreRing score={main?.score ?? 0} size={56} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <GameBadge game={m.game} />
            <h1 className="text-lg font-bold text-white">{m.title} ({m.bestOf})</h1>
          </div>
          <div className="text-xs text-slate-500">
            {m.tournament} · старт {st.abs} · объём {usd(m.volume)} {m.scoreText && m.status !== "upcoming" ? `· серия ${m.scoreText}` : ""}
          </div>
        </div>
        <div className={`rounded-lg border px-4 py-2 text-right ${m.status === "live" ? "border-red-500/50 bg-red-500/10" : "border-[#2a2a38] bg-[#14141c]"}`}>
          <div className="text-[10px] text-slate-400">{finished ? "завершён" : m.status === "live" ? "старт" : "начало"}</div>
          <div className={`text-lg font-extrabold ${m.status === "live" ? "text-red-400" : "text-slate-200"}`}>
            {finished ? (m.winnerIdx === null ? "—" : `победа ${names[m.winnerIdx]}`) : m.status === "live" ? "LIVE" : st.rel}
          </div>
        </div>
      </div>

      {data.markets.length > 1 && (
        <div className="flex flex-wrap gap-2">
          {data.markets.map((x) => (
            <button
              key={x.conditionId}
              onClick={() => setMarket(x.conditionId)}
              className={`min-w-28 rounded-lg border px-4 py-2 text-left ${data.selected === x.conditionId ? "border-sky-500 bg-sky-500/10" : "border-[#2a2a38] bg-[#14141c] hover:border-slate-500"}`}
            >
              <div className="text-sm font-bold text-white">{mapLabel(x)}</div>
              <div className="text-[11px] text-slate-500">{x.recent5 > 0 ? `${usd(x.recent5)} за 5 мин` : "тихо"}</div>
            </button>
          ))}
        </div>
      )}

      {main && (
        <SignalCard
          slug={m.slug}
          team1={m.team1}
          team2={m.team2}
          side={main.moneySide}
          share={main.moneyShare}
          moneyUsd={main.moneyUsd}
          topWalletShare={main.topWalletShare}
          switched={main.switched.length}
          score={main.score}
          price1={data.selP1}
          price2={data.selP1 === null ? null : 1 - data.selP1}
          openPrice1={data.selectedKind === "map" ? null : m.openPrice1}
          status={m.status}
          marketLabel={marketLabel}
          reasons={main.reasons}
        />
      )}

      {data.live && data.pre && (
        <>
          <Tabs
            value={tab}
            onChange={setTab}
            options={[
              { v: "live", label: "Live · деньги", n: data.live.tradeCount },
              { v: "pre", label: "Pre-game сигнал", n: data.pre.score },
              { v: "cmp", label: "Сравнение" },
            ]}
          />
          {tab === "live" && <LiveTab d={data} now={now} />}
          {tab === "pre" && <PreTab d={data} />}
          {tab === "cmp" && <CompareTab d={data} />}
        </>
      )}
    </div>
  );
}
