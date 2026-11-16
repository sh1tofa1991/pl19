"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import SignalCard from "@/components/SignalCard";
import { Card, Chip, ErrorBanner, GameBadge, Loading, Pills, ScoreRing, SplitBar, Stat, agoSec, pct, startLabel, useGame, useNow, usePoll, usd } from "@/components/ui";
import type { ListItem, MatchesResponse } from "@/lib/types";

function MatchCard({ m, now }: { m: ListItem; now: number }) {
  const live = m.status === "live";
  const st = startLabel(m.start, now);
  const w = m.a.w5;
  const lead = w.lead;
  return (
    <Card className={`p-4 ${m.a.score >= 60 ? "border-red-500/30" : ""}`}>
      <div className="flex flex-wrap items-center gap-3">
        <ScoreRing score={m.a.score} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <GameBadge game={m.game} />
            {m.fixLabel === "fixed" && <Chip tone="red">слив</Chip>}
            {m.fixLabel === "normal" && <Chip tone="green">норма</Chip>}
            <Link href={`/match/${m.slug}`} className="truncate text-[15px] font-bold text-white hover:text-sky-300">
              {m.title}
            </Link>
          </div>
          <div className="mt-0.5 text-xs text-slate-500">
            {m.tournament || "—"} · {m.bestOf} · старт {st.abs}
            {m.scoreText && live ? ` · серия ${m.scoreText}` : ""} · объём {usd(m.volume)}
          </div>
        </div>
        <div className={`rounded-lg border px-3 py-1.5 text-right ${live ? "border-red-500/50 bg-red-500/10" : "border-[#2a2a38] bg-[#14141c]"}`}>
          <div className="text-[10px] text-slate-400">{live ? "идёт" : "старт"}</div>
          <div className={`text-sm font-extrabold ${live ? "text-red-400" : "text-slate-200"}`}>{live ? "LIVE" : st.rel}</div>
        </div>
      </div>

      <div className="mt-3">
        <SignalCard
          slug={m.slug}
          team1={m.team1}
          team2={m.team2}
          side={m.a.moneySide}
          share={m.a.moneyShare}
          moneyUsd={m.a.moneyUsd}
          topWalletShare={m.a.topWalletShare}
          switched={m.a.switched}
          score={m.a.score}
          price1={m.price1}
          price2={m.price2}
          openPrice1={m.openPrice1}
          status={m.status}
        />
      </div>

      <div className="mt-3 grid items-center gap-3 sm:grid-cols-[1fr_auto]">
        <div className="text-xs text-slate-400">
          {w.lead !== null ? (
            <>
              <div className="mb-1 flex justify-between">
                <span>
                  последние 5 мин: <b className="text-slate-200">{lead === 0 ? m.team1 : m.team2} {pct(w.pct)}</b>
                </span>
                <span>
                  {usd(w.usd[0])} × {usd(w.usd[1])} · {w.n[0] + w.n[1]} сделок
                </span>
              </div>
              <SplitBar a={w.usd[0]} b={w.usd[1]} />
            </>
          ) : (
            <span>
              {m.a.lastTradeAgoSec !== null ? `последняя сделка ${agoSec(m.a.lastTradeAgoSec)} назад` : "нет свежих сделок"} · {m.a.trades} сделок в окне
            </span>
          )}
        </div>
        <Link href={`/match/${m.slug}`} className="rounded-lg border border-[#2f2f40] bg-[#181822] px-4 py-2 text-center text-sm font-semibold text-slate-200 hover:border-slate-500">
          Анализ матча →
        </Link>
      </div>
    </Card>
  );
}

export default function LivePage() {
  const game = useGame();
  const { data, loading, error } = usePoll<MatchesResponse>(`/api/matches${game ? `?game=${game}` : ""}`, 5000);
  const now = useNow(1000);
  const [status, setStatus] = useState<"all" | "live" | "upcoming">("all");
  const [minScore, setMinScore] = useState<"0" | "30" | "60">("0");
  const [q, setQ] = useState("");

  const items = useMemo(() => {
    if (!data) return [];
    return data.items.filter(
      (m) =>
        (status === "all" || m.status === status) &&
        m.a.score >= Number(minScore) &&
        (!q || (m.title + m.tournament).toLowerCase().includes(q.toLowerCase())),
    );
  }, [data, status, minScore, q]);

  if (loading && !data) return <Loading />;
  if (error && !data) return <ErrorBanner error={error} />;
  const k = data?.kpi;
  const syncing = data?.sync.running;

  return (
    <div className="space-y-4">
      <Card className="grid grid-cols-2 divide-x divide-y divide-[#23232f] overflow-hidden md:grid-cols-5 md:divide-y-0">
        <Stat label="Высокий скор" value={k?.high ?? 0} sub="score ≥ 60 сейчас" tone={k && k.high > 0 ? "red" : undefined} />
        <Stat label="Средний скор" value={k?.medium ?? 0} sub="score 30–59" tone="amber" />
        <Stat
          label="Точность алертов"
          value={k && k.alertsResolved ? `${k.alertHits}/${k.alertsResolved}` : "—"}
          sub={k ? `из ${k.resolved} закрытых сигналов` : ""}
          tone="green"
        />
        <Stat label="Матчи с потоком" value={k?.withFlow ?? 0} sub={`из ${k?.total ?? 0} отслеживаемых · ${k?.live ?? 0} live`} />
        <Stat
          label="Источник"
          value="Polymarket"
          tone={data?.sync.lastError ? "amber" : undefined}
          sub={syncing ? `синхронизация: ${data?.sync.phase}…` : data?.sync.lastError ? "ошибка синхронизации — детали ниже" : "CLOB · Gamma · Data API"}
        />
      </Card>

      {data?.sync.lastError && (
        <Card className="border-amber-500/30 bg-amber-500/5 px-4 py-3 text-xs text-amber-200">
          Синхронизация с Polymarket: {data.sync.lastError}
        </Card>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Pills
          value={status}
          onChange={setStatus}
          options={[
            { v: "all", label: "Все матчи" },
            { v: "live", label: "Live" },
            { v: "upcoming", label: "Скоро" },
          ]}
        />
        <Pills
          value={minScore}
          onChange={setMinScore}
          options={[
            { v: "0", label: "Любой скор" },
            { v: "30", label: "Скор ≥ 30" },
            { v: "60", label: "Алерты ≥ 60" },
          ]}
        />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Поиск команды или турнира"
          className="ml-auto w-full rounded-lg border border-[#2a2a38] bg-[#0e0e15] px-3 py-1.5 text-sm outline-none placeholder:text-slate-600 focus:border-slate-500 sm:w-72"
        />
      </div>

      {items.length === 0 ? (
        <Card className="p-10 text-center text-sm text-slate-500">
          {syncing && !data?.items.length
            ? "Идёт первичная загрузка матчей и сделок с Polymarket — это займёт около минуты…"
            : data?.sync.lastError && !data?.items.length
              ? "Данные не загрузились: синхронизация с Polymarket не удалась (детали выше)."
              : "Нет матчей под выбранные фильтры."}
        </Card>
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {items.map((m) => (
            <MatchCard key={m.slug} m={m} now={now} />
          ))}
        </div>
      )}
    </div>
  );
}
