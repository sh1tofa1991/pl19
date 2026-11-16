"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "next/navigation";

export function usePoll<T>(url: string | null, ms = 5000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    if (!url) return;
    let timer: ReturnType<typeof setTimeout>;
    const load = async () => {
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const j = (await res.json()) as T;
        if (!alive.current) return;
        setData(j);
        setError(null);
        window.dispatchEvent(new CustomEvent("pm-updated", { detail: Date.now() }));
      } catch (e) {
        if (alive.current) setError((e as Error).message);
      } finally {
        if (alive.current) setLoading(false);
        if (alive.current) timer = setTimeout(load, ms);
      }
    };
    setLoading(true);
    void load();
    return () => {
      alive.current = false;
      clearTimeout(timer);
    };
  }, [url, ms]);

  return { data, error, loading };
}

export function useGame() {
  const sp = useSearchParams();
  const g = sp.get("game");
  return g === "cs2" || g === "dota2" ? g : "";
}

export function useNow(ms = 1000) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

/* ------------------------------- formatters ------------------------------- */

export const usd = (n: number) => {
  const a = Math.abs(n);
  const s = a >= 1e6 ? (a / 1e6).toFixed(2) + "M" : a >= 1e4 ? Math.round(a / 1000) + "k" : a >= 1000 ? (a / 1000).toFixed(1) + "k" : String(Math.round(a));
  return (n < 0 ? "−$" : "$") + s;
};
export const pct = (v: number) => Math.round(v * 100) + "%";
export const oddsOf = (p: number | null | undefined) => (p && p > 0.01 ? (1 / p).toFixed(2) : "–");
export const shortAddr = (a: string) => (a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a);
export const nameOf = (name: string, wallet: string) => (name ? name : shortAddr(wallet));

export function agoSec(sec: number) {
  if (sec < 60) return `${sec}с`;
  if (sec < 3600) return `${Math.floor(sec / 60)}м`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}ч`;
  return `${Math.floor(sec / 86400)}д`;
}

export function startLabel(start: number, now: number) {
  const diff = Math.round((start - now) / 60000);
  const d = new Date(start);
  const hhmm = d.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });
  const day = d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
  if (diff > 0) {
    const h = Math.floor(diff / 60);
    return { rel: h > 0 ? `через ${h}ч ${diff % 60}м` : `через ${diff}м`, abs: `${day} ${hhmm}` };
  }
  return { rel: `${-diff} мин назад`, abs: `${day} ${hhmm}` };
}

/* --------------------------------- widgets -------------------------------- */

export const COLORS = {
  a: "#34d399", // team1
  b: "#f87171", // team2
};

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-[#23232f] bg-[#12121a] ${className}`}>{children}</div>;
}

export function GameBadge({ game }: { game: string }) {
  return game === "dota2" ? (
    <span className="rounded border border-red-500/40 bg-red-500/15 px-1.5 py-0.5 text-[11px] font-bold text-red-300">DOTA 2</span>
  ) : (
    <span className="rounded border border-amber-500/40 bg-amber-500/15 px-1.5 py-0.5 text-[11px] font-bold text-amber-300">CS2</span>
  );
}

export function Chip({ children, tone = "gray" }: { children: ReactNode; tone?: "gray" | "amber" | "green" | "red" | "blue" }) {
  const t = {
    gray: "bg-slate-500/15 text-slate-300 border-slate-500/30",
    amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    red: "bg-red-500/15 text-red-300 border-red-500/30",
    blue: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  }[tone];
  return <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${t}`}>{children}</span>;
}

export function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = size / 2 - 4;
  const c = 2 * Math.PI * r;
  const color = score >= 60 ? "#ef4444" : score >= 30 ? "#fbbf24" : "#34d399";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="#262633" strokeWidth={4} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={4}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - Math.min(100, score) / 100)}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-sm font-bold text-white">{score}</span>
    </div>
  );
}

export function SplitBar({ a, b, h = 6 }: { a: number; b: number; h?: number }) {
  const t = a + b;
  const pa = t > 0 ? (a / t) * 100 : 50;
  return (
    <div className="flex w-full overflow-hidden rounded-full bg-[#262633]" style={{ height: h }}>
      <div style={{ width: `${pa}%`, background: COLORS.a }} />
      <div style={{ width: `${100 - pa}%`, background: t > 0 ? COLORS.b : "#262633" }} />
    </div>
  );
}

export function Stat({ label, value, sub, tone }: { label: string; value: ReactNode; sub?: ReactNode; tone?: "red" | "green" | "amber" }) {
  const c = tone === "red" ? "text-red-400" : tone === "green" ? "text-emerald-400" : tone === "amber" ? "text-amber-300" : "text-white";
  return (
    <div className="px-4 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`mt-0.5 text-2xl font-bold ${c}`}>{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export function Pills<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { v: T; label: ReactNode }[];
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
            value === o.v ? "border-red-500 bg-red-500/90 text-white" : "border-[#2a2a38] bg-[#14141c] text-slate-300 hover:border-slate-500"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Tabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { v: T; label: ReactNode; n?: number | string }[];
}) {
  return (
    <div className="grid rounded-lg border border-[#23232f] bg-[#0e0e15] p-0.5" style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0,1fr))` }}>
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          className={`rounded-md px-3 py-2 text-sm font-semibold transition ${value === o.v ? "bg-[#1b1b27] text-white ring-1 ring-[#33334a]" : "text-slate-400 hover:text-slate-200"}`}
        >
          {o.label}
          {o.n !== undefined && <span className="ml-2 rounded bg-[#262633] px-1.5 py-0.5 text-[10px] text-slate-300">{o.n}</span>}
        </button>
      ))}
    </div>
  );
}

export function Loading({ text = "Загрузка данных Polymarket…" }: { text?: string }) {
  return (
    <div className="grid place-items-center py-20 text-sm text-slate-500">
      <div className="mb-3 h-6 w-6 animate-spin rounded-full border-2 border-slate-600 border-t-red-500" />
      {text}
    </div>
  );
}

export function Timeline({
  data,
  names,
}: {
  data: { t: number; usd: [number, number]; odds0: number | null }[];
  names: [string, string];
}) {
  const W = 800;
  const H = 130;
  if (!data.length) return <div className="grid h-[130px] place-items-center rounded-lg bg-[#0e0e15] text-xs text-slate-500">Пока нет сделок</div>;
  const max = Math.max(1, ...data.map((d) => d.usd[0] + d.usd[1]));
  const bw = W / data.length;
  const pts = data.filter((d) => d.odds0 !== null);
  const line = pts
    .map((d, i) => {
      const x = data.indexOf(d) * bw + bw / 2;
      const y = H - 8 - (d.odds0 as number) * (H - 16);
      return `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-[130px] w-full rounded-lg bg-[#0e0e15]" preserveAspectRatio="none">
        {data.map((d, i) => {
          const h1 = (d.usd[0] / max) * (H - 10);
          const h2 = (d.usd[1] / max) * (H - 10);
          return (
            <g key={i}>
              <rect x={i * bw + 1} y={H - h1} width={bw - 2} height={h1} fill={COLORS.a} opacity={0.75} />
              <rect x={i * bw + 1} y={H - h1 - h2} width={bw - 2} height={h2} fill={COLORS.b} opacity={0.75} />
            </g>
          );
        })}
        {line && <path d={line} fill="none" stroke="#facc15" strokeWidth={2} vectorEffect="non-scaling-stroke" />}
      </svg>
      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
        <span>start</span>
        <span className="flex items-center gap-3">
          <i className="inline-block h-2 w-2 rounded-sm" style={{ background: COLORS.a }} /> {names[0]}
          <i className="inline-block h-2 w-2 rounded-sm" style={{ background: COLORS.b }} /> {names[1]}
          <i className="inline-block h-0.5 w-4 bg-yellow-400" /> коэф. {names[0]}
        </span>
        <span>now</span>
      </div>
    </div>
  );
}
