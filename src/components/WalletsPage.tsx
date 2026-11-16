"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Card, Chip, ErrorBanner, Loading, Pills, Stat, Tabs, agoSec, nameOf, pct, useGame, usePoll, usd } from "@/components/ui";

type W = {
  address: string;
  name: string;
  matches: number;
  wins: number;
  winRate: number;
  staked: number;
  profit: number;
  roi: number;
  cs2: number;
  dota2: number;
  bigBets: number;
  bigWins: number;
  openUsd: number;
  tag: string;
  lastBetAt: number | null;
  active: boolean;
};

type ListResp = {
  items: W[];
  top10: W[];
  bettingNow: {
    slug: string;
    title: string;
    status: string;
    game: string;
    wallets: { address: string; name: string; tag: string; team: string; usd: number; winRate: number; matches: number }[];
  }[];
  clusters: {
    members: { address: string; name: string; matches: number; wins: number; staked: number; profit: number; winRate: number; tag: string }[];
    together: number;
    sameSide: number;
    sameSideRate: number;
    combined: { matches: number; wins: number; staked: number; profit: number; winRate: number; roi: number };
  }[];
  kpi: { total: number; strong: number; suspect: number; active: number; stopped: number; matchesWithElite: number };
  sync: { running: boolean; phase: string };
};

type Detail = {
  wallet: W & { lastBetAt: number | null };
  history: { slug: string; title: string; game: string; team: string; staked: number; pnl: number; result: string; last: number }[];
  network: { address: string; name: string; together: number; total: number; same: number; pct: number }[];
};

type Filter = "all" | "strong" | "suspect" | "big" | "active" | "stopped";
type Sort = "profit" | "winRate" | "staked" | "recent";

const PAGE = 15;

function TagChip({ tag }: { tag: string }) {
  if (tag === "suspect") return <Chip tone="red">подозрит.</Chip>;
  if (tag === "strong") return <Chip tone="amber">сильный</Chip>;
  return null;
}

const money = (n: number) => `${n >= 0 ? "+" : "−"}${usd(Math.abs(n))}`;

function Network({ d }: { d: Detail }) {
  const n = d.network;
  const rowH = 46;
  const H = Math.max(120, n.length * rowH + 10);
  const color = (p: number) => (p >= 0.75 ? "#34d399" : p <= 0.4 ? "#f87171" : "#8b93a7");
  const copies = n.filter((x) => x.pct >= 0.9 && x.together >= 5);
  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
        <span className="font-bold uppercase tracking-wider text-slate-500">Ставили на те же матчи · {n.length}</span>
        <span className="ml-auto flex gap-3">
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-emerald-400" /> та же команда</span>
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-slate-400" /> смешанно</span>
          <span className="flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-red-400" /> против</span>
        </span>
      </div>
      {n.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">Недостаточно общих матчей с другими кошельками.</div>
      ) : (
        <div className="relative" style={{ height: H }}>
          <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 1000 ${H}`} preserveAspectRatio="none">
            {n.map((x, i) => {
              const y = i * rowH + rowH / 2;
              return <path key={x.address} d={`M 560 ${y} C 760 ${y}, 760 ${H / 2}, 900 ${H / 2}`} fill="none" stroke={color(x.pct)} strokeOpacity={0.55} strokeWidth={1 + x.pct * 2} vectorEffect="non-scaling-stroke" />;
            })}
          </svg>
          <div className="absolute left-0 top-0 w-[56%]">
            {n.map((x) => (
              <div key={x.address} className="mb-1.5 rounded-lg border border-[#2a2a38] bg-[#14141c] px-3 py-1" style={{ height: rowH - 6 }}>
                <div className="flex items-center gap-2 text-sm font-semibold text-white">
                  <i className="h-2 w-2 rounded-full" style={{ background: color(x.pct) }} />
                  <span className="truncate">{x.name}</span>
                </div>
                <div className="text-[11px] text-slate-500">{pct(x.pct)} · {x.same}/{x.together} вместе</div>
              </div>
            ))}
          </div>
          <div className="absolute right-0 top-1/2 w-[28%] -translate-y-1/2 rounded-lg border-2 border-red-500/70 bg-[#1d1115] p-3 text-center">
            <div className="text-[10px] text-slate-400">этот кошелёк</div>
            <div className="truncate text-sm font-bold text-white">{nameOf(d.wallet.name, d.wallet.address)}</div>
          </div>
        </div>
      )}
      {copies.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-amber-300">
          {copies.length} вероятно один владелец или копирующие (≥ 90% та же команда):
          {copies.map((c) => <Chip key={c.address} tone="amber">{c.name} {pct(c.pct)}</Chip>)}
        </div>
      )}
    </div>
  );
}

function DetailPanel({ address }: { address: string }) {
  const { data, loading, error } = usePoll<Detail>(`/api/wallets/${address}`, 30000);
  const [tab, setTab] = useState<"hist" | "net">("hist");
  const [page, setPage] = useState(0);
  useEffect(() => setPage(0), [address]);
  if (loading && !data) return <Loading text="Загрузка кошелька…" />;
  if (error === "404") return <div className="p-6 text-sm text-slate-500">Кошелёк не найден.</div>;
  if (!data) return <ErrorBanner error={error} />;
  const w = data.wallet;
  const wr = w.matches ? w.wins / w.matches : 0;
  const slice = data.history.slice(page * 10, page * 10 + 10);
  const pages = Math.ceil(data.history.length / 10);
  return (
    <div className="p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-lg font-bold text-white">
            {nameOf(w.name, w.address)} <TagChip tag={w.tag} />
          </div>
          <a href={`https://polymarket.com/profile/${w.address}`} target="_blank" rel="noreferrer" className="break-all text-[11px] text-sky-400 hover:underline">
            {w.address} ↗
          </a>
        </div>
        <div className="text-right text-xs text-slate-500">{w.lastBetAt ? `последняя ставка ${agoSec(Math.round((Date.now() - w.lastBetAt) / 1000))} назад` : ""}</div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#23232f] bg-[#23232f]">
        {[
          { l: "Прибыль (CS2 / Dota 2)", v: money(w.profit), s: `${usd(w.staked)} вложено · ROI ${w.staked ? ((w.profit / w.staked) * 100).toFixed(1) : 0}%`, t: w.profit >= 0 ? "green" : "red" },
          { l: "Винрейт", v: pct(wr), s: `${w.wins} из ${w.matches} матчей · крупные ${w.bigWins}/${w.bigBets}` },
          { l: "CS2 / Dota 2", v: `${w.cs2} / ${w.dota2}`, s: "матчей в базе" },
          { l: "Открыто сейчас", v: usd(w.openUsd), s: "по незавершённым матчам" },
        ].map((c) => (
          <div key={c.l} className="bg-[#12121a]"><Stat label={c.l} value={c.v} sub={c.s} tone={c.t as "green" | "red" | undefined} /></div>
        ))}
      </div>
      <div className="mt-4">
        <Tabs value={tab} onChange={setTab} options={[{ v: "hist", label: "Матчи", n: data.history.length }, { v: "net", label: "Связи", n: data.network.length }]} />
      </div>
      <div className="mt-3">
        {tab === "hist" ? (
          <>
            {slice.map((h) => (
              <Link key={h.slug} href={`/match/${h.slug}`} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-[#181822]">
                <span className={h.result === "win" ? "text-emerald-400" : h.result === "loss" ? "text-red-400" : "text-slate-500"}>{h.result === "win" ? "✓" : h.result === "loss" ? "✗" : "…"}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-slate-100">{h.title}</span>
                  <span className="text-[11px] text-slate-500">ставка на {h.team}</span>
                </span>
                <span className="text-right">
                  <span className="block text-slate-200">{usd(h.staked)}</span>
                  <span className={`text-[11px] ${h.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{h.result === "open" ? "открыта" : money(h.pnl)}</span>
                </span>
              </Link>
            ))}
            {pages > 1 && (
              <div className="mt-2 flex items-center justify-between text-xs text-slate-500">
                <span>{page * 10 + 1}–{Math.min(data.history.length, page * 10 + 10)} из {data.history.length}</span>
                <div className="flex gap-1">
                  <button disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded border border-[#2a2a38] px-2 py-1 disabled:opacity-30">‹</button>
                  <button disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className="rounded border border-[#2a2a38] px-2 py-1 disabled:opacity-30">›</button>
                </div>
              </div>
            )}
          </>
        ) : (
          <Network d={data} />
        )}
      </div>
    </div>
  );
}

export default function WalletsPage() {
  const game = useGame();
  const { data, loading, error } = usePoll<ListResp>("/api/wallets", 20000);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<Sort>("profit");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(0);
  const [sel, setSel] = useState<string | null>(null);

  const list = useMemo(() => {
    let xs = data?.items ?? [];
    if (game === "cs2") xs = xs.filter((w) => w.cs2 > 0);
    if (game === "dota2") xs = xs.filter((w) => w.dota2 > 0);
    if (filter === "strong") xs = xs.filter((w) => w.tag === "strong");
    if (filter === "suspect") xs = xs.filter((w) => w.tag === "suspect");
    if (filter === "big") xs = xs.filter((w) => w.bigBets > 0);
    if (filter === "active") xs = xs.filter((w) => w.active);
    if (filter === "stopped") xs = xs.filter((w) => !w.active);
    if (q) xs = xs.filter((w) => (w.name + w.address).toLowerCase().includes(q.toLowerCase()));
    const key: Record<Sort, (w: W) => number> = {
      profit: (w) => w.profit,
      winRate: (w) => w.winRate * 1000 + w.matches,
      staked: (w) => w.staked,
      recent: (w) => w.lastBetAt ?? 0,
    };
    return [...xs].sort((a, b) => key[sort](b) - key[sort](a));
  }, [data, game, filter, sort, q]);

  useEffect(() => setPage(0), [filter, sort, q, game]);
  const selected = sel ?? list[0]?.address ?? null;

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorBanner error={error} />;
  const k = data?.kpi;
  const rows = list.slice(page * PAGE, page * PAGE + PAGE);
  const pages = Math.ceil(list.length / PAGE);
  const cnt = (f: (w: W) => boolean) => (data?.items ?? []).filter(f).length;

  return (
    <div className="space-y-4">
      <Card className="grid grid-cols-2 divide-x divide-[#23232f] overflow-hidden md:grid-cols-5">
        <Stat label="Кошельков в базе" value={k?.total ?? 0} sub="≥ 3 завершённых матча" />
        <Stat label="Сильные" value={k?.strong ?? 0} sub="≥ 5 матчей, винрейт ≥ 75%" tone="amber" />
        <Stat label="Подозрительные" value={k?.suspect ?? 0} sub="≥ 7 матчей, винрейт ≥ 85%, ROI ≥ 15%" tone="red" />
        <Stat label="Активны" value={k?.active ?? 0} sub={`остановились: ${k?.stopped ?? 0}`} tone="green" />
        <Stat label="Матчей с элитой" value={k?.matchesWithElite ?? 0} sub="сильные кошельки ≥ $200 сейчас" />
      </Card>

      <Card className="px-4 py-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
          <i className="h-2 w-2 animate-pulse rounded-full bg-red-500" /> Ставят сейчас
        </div>
        {data?.bettingNow.length ? (
          <div className="space-y-1.5">
            {data.bettingNow.map((m) => (
              <Link key={m.slug} href={`/match/${m.slug}`} className="flex flex-wrap items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2 text-sm hover:border-amber-400/60">
                <b className="text-white">{m.title}</b>
                {m.status === "live" && <Chip tone="red">live</Chip>}
                <span className="ml-auto flex flex-wrap gap-2">
                  {m.wallets.slice(0, 4).map((w) => (
                    <Chip key={w.address} tone="amber">★ {nameOf(w.name, w.address)} → {w.team} · {usd(w.usd)}</Chip>
                  ))}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-[#0e0e15] px-3 py-2 text-sm text-slate-500">Сильных кошельков с ≥ $200 на одной стороне открытых матчей сейчас нет.</div>
        )}
      </Card>

      <Card className="px-4 py-3">
        <div className="mb-2 flex items-center gap-2 text-sm font-bold text-white">
          <i className="h-2 w-2 rounded-full bg-violet-500" /> Кластеры кошельков
          <span className="text-xs font-normal text-slate-500">постоянно ставят на одни матчи одной стороной — возможно, один владелец</span>
        </div>
        {data?.clusters.length ? (
          <div className="space-y-1.5">
            {data.clusters.slice(0, 8).map((c) => (
              <div key={c.members[0].address} className="flex flex-wrap items-center gap-2 rounded-lg border border-[#2a2a38] bg-[#14141c] px-3 py-2 text-sm">
                <span className="flex flex-wrap gap-1.5">
                  {c.members.map((m) => (
                    <button key={m.address} onClick={() => setSel(m.address)} title={m.address}>
                      <Chip tone="blue">{nameOf(m.name, m.address)}</Chip>
                    </button>
                  ))}
                </span>
                {c.together >= 4 && c.sameSideRate >= 0.8 && <Chip tone="red">вероятно один владелец</Chip>}
                {c.combined.matches >= 5 && c.combined.winRate >= 0.75 && <Chip tone="amber">высокий винрейт</Chip>}
                <span className="ml-auto text-xs text-slate-400">
                  вместе {c.together} матчей · {pct(c.sameSideRate)} на одну сторону · суммарно{" "}
                  <b className={c.combined.profit >= 0 ? "text-emerald-400" : "text-red-400"}>{money(c.combined.profit)}</b> · винрейт {pct(c.combined.winRate)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-lg bg-[#0e0e15] px-3 py-2 text-sm text-slate-500">Пока нет кошельков, которые регулярно ставят на одни и те же матчи.</div>
        )}
      </Card>

      <Card className="p-4">
        <div className="mb-3 flex items-baseline gap-3">
          <h2 className="text-sm font-bold text-white">Топ-10 по прибыли</h2>
          <span className="text-xs text-slate-500">только активные (ставки за последние 24 ч) · прибыль по отслеживаемым матчам</span>
        </div>
        <div className="grid gap-x-10 gap-y-1 md:grid-cols-2">
          {(data?.top10 ?? []).map((w, i) => (
            <button key={w.address} onClick={() => setSel(w.address)} className="flex items-center gap-3 rounded-lg px-2 py-1.5 text-left hover:bg-[#181822]">
              <span className={`grid h-6 w-6 place-items-center rounded-full text-xs font-bold ${i === 0 ? "bg-amber-400 text-black" : i === 1 ? "bg-slate-300 text-black" : i === 2 ? "bg-orange-500 text-black" : "bg-[#23232f] text-slate-300"}`}>{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold text-white">{nameOf(w.name, w.address)}</span>
                <span className="text-[11px] text-slate-500">{w.wins}/{w.matches} в плюсе · {usd(w.staked)} вложено</span>
              </span>
              <span className="text-right">
                <span className="block text-sm font-bold text-emerald-400">{money(w.profit)}</span>
                <span className="text-[11px] text-slate-500">ROI {Math.round(w.roi * 100)}%</span>
              </span>
            </button>
          ))}
          {!data?.top10.length && <div className="text-sm text-slate-500">Данные ещё загружаются…</div>}
        </div>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Поиск по имени или адресу" className="w-full max-w-sm rounded-lg border border-[#2a2a38] bg-[#0e0e15] px-3 py-1.5 text-sm outline-none placeholder:text-slate-600 focus:border-slate-500" />
        <Pills
          value={filter}
          onChange={setFilter}
          options={[
            { v: "all", label: `Все ${data?.items.length ?? 0}` },
            { v: "strong", label: `Сильные ${cnt((w) => w.tag === "strong")}` },
            { v: "suspect", label: `Подозрительные ${cnt((w) => w.tag === "suspect")}` },
            { v: "big", label: `Крупные ставки ${cnt((w) => w.bigBets > 0)}` },
            { v: "active", label: `Активные ${cnt((w) => w.active)}` },
            { v: "stopped", label: `Остановились ${cnt((w) => !w.active)}` },
          ]}
        />
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className="ml-auto rounded-lg border border-[#2a2a38] bg-[#0e0e15] px-2 py-1.5 text-sm">
          <option value="profit">Сортировка: прибыль</option>
          <option value="winRate">Сортировка: винрейт</option>
          <option value="staked">Сортировка: объём</option>
          <option value="recent">Сортировка: последняя ставка</option>
        </select>
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#23232f] text-left text-[11px] uppercase tracking-wider text-slate-500">
                <th className="px-3 py-2">Кошелёк</th>
                <th>Рекорд</th>
                <th>Прибыль</th>
                <th className="pr-3">Статус</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((w) => (
                <tr
                  key={w.address}
                  onClick={() => setSel(w.address)}
                  className={`cursor-pointer border-b border-[#1b1b25] hover:bg-[#181822] ${selected === w.address ? "bg-red-500/5 shadow-[inset_2px_0_0_#ef4444]" : w.tag ? "shadow-[inset_2px_0_0_#f59e0b]" : ""}`}
                >
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2 font-semibold text-white">
                      <span className="max-w-[170px] truncate">{nameOf(w.name, w.address)}</span> <TagChip tag={w.tag} />
                    </div>
                    <div className="text-[11px] text-slate-500">{w.address.slice(0, 6)}…{w.address.slice(-4)} · CS2 {w.cs2} · D2 {w.dota2}</div>
                  </td>
                  <td>
                    <div className="font-semibold text-white">{pct(w.winRate)}</div>
                    <div className="text-[11px] text-slate-500">{w.wins}/{w.matches}</div>
                  </td>
                  <td>
                    <div className={`font-semibold ${w.profit >= 0 ? "text-emerald-400" : "text-red-400"}`}>{money(w.profit)}</div>
                    <div className="text-[11px] text-slate-500">ROI {Math.round(w.roi * 100)}%</div>
                  </td>
                  <td className="pr-3">
                    <Chip tone={w.active ? "green" : "red"}>{w.active ? "Активен" : "Остановился"}</Chip>
                    <div className="mt-0.5 text-[11px] text-slate-500">{w.lastBetAt ? `ставка ${agoSec(Math.round((Date.now() - w.lastBetAt) / 1000))} назад` : ""}</div>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-slate-500">{data?.sync.running ? "Идёт загрузка данных…" : "Кошельки не найдены."}</td></tr>
              )}
            </tbody>
          </table>
          <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-500">
            <span>{list.length ? `${page * PAGE + 1}–${Math.min(list.length, page * PAGE + PAGE)} из ${list.length}` : "0"}</span>
            <div className="flex gap-1">
              <button disabled={page === 0} onClick={() => setPage(page - 1)} className="rounded border border-[#2a2a38] px-2 py-1 disabled:opacity-30">‹</button>
              <span className="px-2 py-1">{page + 1} / {Math.max(1, pages)}</span>
              <button disabled={page >= pages - 1} onClick={() => setPage(page + 1)} className="rounded border border-[#2a2a38] px-2 py-1 disabled:opacity-30">›</button>
            </div>
          </div>
        </Card>
        <Card>{selected ? <DetailPanel address={selected} /> : <div className="p-8 text-center text-sm text-slate-500">Выберите кошелёк</div>}</Card>
      </div>
    </div>
  );
}
