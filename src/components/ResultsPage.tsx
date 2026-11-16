"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Card, GameBadge, Loading, Pills, Stat, useGame, usePoll, usd } from "@/components/ui";

type Item = {
  slug: string;
  game: string;
  title: string;
  team1: string;
  team2: string;
  tournament: string;
  bestOf: string;
  start: number;
  scoreText: string;
  winnerIdx: number | null;
  signalScore: number | null;
  signalSide: number | null;
  signalPrice: number | null;
  signalWon: boolean | null;
  volume: number;
};

type Bucket = "all" | "0" | "30" | "60";
const BUCKETS: Record<Bucket, [number, number]> = { all: [0, 101], "0": [0, 30], "30": [30, 60], "60": [60, 101] };

function Equity({ pts }: { pts: number[] }) {
  const W = 900;
  const H = 150;
  if (pts.length < 2) return <div className="grid h-[150px] place-items-center text-sm text-slate-500">Недостаточно ставок для графика</div>;
  const lo = Math.min(0, ...pts);
  const hi = Math.max(0, ...pts);
  const rng = hi - lo || 1;
  const y = (v: number) => H - 10 - ((v - lo) / rng) * (H - 20);
  const d = pts.map((v, i) => `${i ? "L" : "M"}${((i / (pts.length - 1)) * W).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = pts[pts.length - 1];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[150px] w-full" preserveAspectRatio="none">
      <line x1={0} x2={W} y1={y(0)} y2={y(0)} stroke="#3a3a4a" strokeDasharray="4 4" />
      <path d={d} fill="none" stroke={last >= 0 ? "#34d399" : "#f87171"} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

export default function ResultsPage() {
  const game = useGame();
  const { data, loading } = usePoll<{ items: Item[]; sync: { running: boolean } }>("/api/results", 15000);
  const [bucket, setBucket] = useState<Bucket>("all");
  const [alertsOnly, setAlertsOnly] = useState(false);
  const [floor, setFloor] = useState(true);
  const [stake, setStake] = useState(10);
  const [range, setRange] = useState<"all" | "1" | "7">("all");

  const calc = useMemo(() => {
    const now = Date.now();
    const all = (data?.items ?? []).filter(
      (i) =>
        i.signalScore !== null &&
        i.signalSide !== null &&
        i.signalPrice !== null &&
        (!game || i.game === game) &&
        (range === "all" || now - i.start < Number(range) * 86400_000),
    );
    const hidden = all.filter((i) => floor && (i.signalPrice as number) > 0.8).length;
    const sig = all.filter((i) => !(floor && (i.signalPrice as number) > 0.8));
    const [lo, hi] = BUCKETS[bucket];
    const inB = sig.filter((i) => (i.signalScore as number) >= lo && (i.signalScore as number) < hi);
    const list = (alertsOnly ? inB.filter((i) => (i.signalScore as number) >= 60) : inB).sort((a, b) => b.start - a.start);

    const won = inB.filter((i) => i.signalWon).length;
    const alerts = sig.filter((i) => (i.signalScore as number) >= 60);
    const aWon = alerts.filter((i) => i.signalWon).length;
    const avgOdds = alerts.length ? alerts.reduce((s, i) => s + 1 / (i.signalPrice as number), 0) / alerts.length : 0;
    const implied = alerts.length ? alerts.reduce((s, i) => s + (i.signalPrice as number), 0) / alerts.length : 0;
    const edge = alerts.length ? aWon / alerts.length - implied : 0;

    const chrono = [...list].sort((a, b) => a.start - b.start);
    let eq = 0;
    const pts = [0];
    let greens = 0;
    let reds = 0;
    let plus = 0;
    let minus = 0;
    for (const i of chrono) {
      const p = i.signalPrice as number;
      const pr = i.signalWon ? stake * (1 / p - 1) : -stake;
      eq += pr;
      pts.push(eq);
      if (i.signalWon) {
        greens++;
        plus += pr;
      } else {
        reds++;
        minus += pr;
      }
    }
    const staked = chrono.length * stake;

    const rows = (["0", "30", "60"] as const).map((b) => {
      const [l, h] = BUCKETS[b];
      const xs = sig.filter((i) => (i.signalScore as number) >= l && (i.signalScore as number) < h);
      const w = xs.filter((i) => i.signalWon).length;
      const ao = xs.length ? xs.reduce((s, i) => s + (i.signalPrice as number), 0) / xs.length : 0;
      const profit = xs.reduce((s, i) => s + (i.signalWon ? 1 / (i.signalPrice as number) - 1 : -1), 0);
      return {
        label: b === "0" ? "0–30" : b === "30" ? "30–60" : "60–100",
        n: xs.length,
        won: xs.length ? w / xs.length : 0,
        odds: ao ? 1 / ao : 0,
        edge: xs.length ? w / xs.length - ao : 0,
        roi: xs.length ? profit / xs.length : 0,
      };
    });
    return { all, hidden, sig, inB, list, won, alerts, aWon, avgOdds, edge, pts, eq, greens, reds, plus, minus, staked, rows };
  }, [data, game, bucket, alertsOnly, floor, stake, range]);

  if (loading && !data) return <Loading />;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-lg font-bold text-white">История модели</h1>
        <span className="rounded bg-[#23232f] px-2 py-0.5 text-xs text-slate-300">{calc.all.length}</span>
        <span className="text-xs text-slate-500">каждый проанализированный сигнал по завершённым матчам · деньги до старта матча</span>
        <div className="ml-auto flex flex-wrap gap-3">
          <Pills
            value={range}
            onChange={setRange}
            options={[
              { v: "1", label: "Сутки" },
              { v: "7", label: "7 дней" },
              { v: "all", label: "Всё время" },
            ]}
          />
        </div>
      </div>

      <Card className="flex flex-wrap items-center gap-4 p-3 text-sm">
        <label className="flex items-center gap-2 text-slate-300">
          <input type="checkbox" checked={floor} onChange={(e) => setFloor(e.target.checked)} className="accent-red-500" />
          Только коэф. от 1.25 (цена ≤ 80%)
        </label>
        <span className="text-xs text-slate-500">{calc.hidden} сигналов ниже минимального коэф. скрыто</span>
        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-slate-500">Макс. скор</span>
          <Pills
            value={bucket}
            onChange={setBucket}
            options={[
              { v: "all", label: "Все" },
              { v: "0", label: "0–30" },
              { v: "30", label: "30–60" },
              { v: "60", label: "60+" },
            ]}
          />
        </div>
      </Card>

      <Card className="grid grid-cols-2 divide-x divide-[#23232f] overflow-hidden md:grid-cols-4">
        <Stat label="Закрытых сигналов" value={calc.inB.length} sub={`${calc.inB.length ? Math.round((calc.won / calc.inB.length) * 100) : 0}% — деньги выиграли`} />
        <Stat label="Алерты (≥ 60)" value={`${calc.aWon}/${calc.alerts.length}`} sub={`${calc.alerts.length ? Math.round((calc.aWon / calc.alerts.length) * 100) : 0}% попаданий`} tone={calc.alerts.length && calc.aWon / calc.alerts.length >= 0.5 ? "green" : "red"} />
        <Stat label="Средний коэф. алертов" value={calc.avgOdds ? calc.avgOdds.toFixed(2) : "—"} sub="шанс, который давал рынок" />
        <Stat label="Edge алертов" value={`${calc.edge >= 0 ? "+" : ""}${Math.round(calc.edge * 100)} pp`} sub="попадания минус подразумеваемый шанс" tone={calc.edge >= 0 ? "green" : "red"} />
      </Card>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="text-sm font-bold text-white">Симуляция: фиксированная ставка на каждый сигнал</div>
          <span className="text-xs text-slate-500">на экране · одна ставка на матч</span>
          <div className="ml-auto flex flex-wrap items-center gap-3">
            <Pills value={alertsOnly ? "a" : "all"} onChange={(v) => setAlertsOnly(v === "a")} options={[{ v: "all", label: "Все сигналы" }, { v: "a", label: "Только алерты ≥ 60" }]} />
            <label className="flex items-center gap-1 rounded-lg border border-[#2a2a38] bg-[#0e0e15] px-2 py-1 text-sm">
              $
              <input type="number" min={1} value={stake} onChange={(e) => setStake(Math.max(1, Number(e.target.value) || 1))} className="w-16 bg-transparent outline-none" />
            </label>
          </div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-[#23232f] bg-[#23232f] md:grid-cols-4">
          {[
            { l: "Результат", v: `${calc.eq >= 0 ? "+" : "−"}$${Math.abs(calc.eq).toFixed(2)}`, s: `${calc.greens + calc.reds} ставок · $${calc.staked} вложено`, t: calc.eq >= 0 ? "green" : "red" },
            { l: "Доходность", v: `${calc.staked ? ((calc.eq / calc.staked) * 100).toFixed(1) : "0.0"}%`, s: "от суммы ставок", t: calc.eq >= 0 ? "green" : "red" },
            { l: "Зелёные", v: calc.greens, s: `+$${calc.plus.toFixed(2)} прибыль`, t: "green" },
            { l: "Красные", v: calc.reds, s: `−$${Math.abs(calc.minus).toFixed(2)} убыток`, t: "red" },
          ].map((c) => (
            <div key={c.l} className="bg-[#12121a]">
              <Stat label={c.l} value={c.v} sub={c.s} tone={c.t as "green" | "red"} />
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-lg bg-[#0e0e15] p-2">
          <Equity pts={calc.pts} />
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>1-я ставка</span>
            <span>худшая точка {usd(Math.min(0, ...calc.pts))} · лучшая {usd(Math.max(0, ...calc.pts))}</span>
            <span>последняя</span>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#23232f] text-left text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-4 py-2">Макс. скор</th>
              <th>Случаев</th>
              <th>Выиграли</th>
              <th>Коэф.</th>
              <th>Edge</th>
              <th className="pr-4 text-right">Доход / ставка</th>
            </tr>
          </thead>
          <tbody>
            {calc.rows.map((r) => (
              <tr key={r.label} className="border-b border-[#1b1b25]">
                <td className="px-4 py-2 font-semibold text-white">
                  {r.label} {r.label === "60–100" && <span className="ml-1 rounded bg-amber-500/20 px-1.5 text-[10px] text-amber-300">алерт</span>}
                </td>
                <td>{r.n}</td>
                <td>{Math.round(r.won * 100)}%</td>
                <td>{r.odds ? r.odds.toFixed(2) : "—"}</td>
                <td className={r.edge >= 0 ? "text-emerald-400" : "text-red-400"}>{r.n ? `${r.edge >= 0 ? "+" : ""}${Math.round(r.edge * 100)} pp` : "—"}</td>
                <td className={`pr-4 text-right ${r.roi >= 0 ? "text-emerald-400" : "text-red-400"}`}>{r.n ? `${r.roi >= 0 ? "+" : ""}${(r.roi * 100).toFixed(1)}%` : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <div className="space-y-2">
        {calc.list.length === 0 && (
          <Card className="p-8 text-center text-sm text-slate-500">
            {data?.sync.running ? "Идёт загрузка истории матчей с Polymarket…" : "Нет сигналов под выбранные фильтры."}
          </Card>
        )}
        {calc.list.slice(0, 80).map((i) => {
          const side = i.signalSide as number;
          const team = side === 0 ? i.team1 : i.team2;
          const won = Boolean(i.signalWon);
          return (
            <div key={i.slug} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${won ? "border-emerald-500/30 bg-emerald-500/5" : "border-red-500/30 bg-red-500/5"}`}>
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm font-bold ${won ? "border-emerald-500 text-emerald-400" : "border-red-500 text-red-400"}`}>{won ? "✓" : "✗"}</div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-white">
                  <GameBadge game={i.game} />
                  {i.title} ({i.bestOf})
                  {(i.signalScore ?? 0) >= 60 && <span className="rounded bg-amber-500/20 px-1.5 text-[10px] text-amber-300">алерт</span>}
                </div>
                <div className="truncate text-xs text-slate-400">
                  {i.tournament} · деньги на <b className="text-slate-200">{team}</b> · скор {i.signalScore} · коэф. до старта {(1 / (i.signalPrice as number)).toFixed(2)} ·{" "}
                  {new Date(i.start).toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
                </div>
              </div>
              <div className={`text-right text-sm font-semibold ${won ? "text-emerald-400" : "text-red-400"}`}>
                {i.winnerIdx === 0 ? i.team1 : i.team2} победил {i.scoreText}
              </div>
              <Link href={`/match/${i.slug}`} className="grid h-8 w-8 place-items-center rounded-full border border-[#33334a] text-slate-300 hover:border-slate-400">↗</Link>
            </div>
          );
        })}
      </div>
    </div>
  );
}
