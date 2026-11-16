"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useNow } from "@/components/ui";

const NAV = [
  { href: "/", label: "Live" },
  { href: "/results", label: "Результаты" },
  { href: "/wallets", label: "Кошельки" },
];

export default function Header() {
  const path = usePathname();
  const router = useRouter();
  const sp = useSearchParams();
  const game = sp.get("game") ?? "";
  const [updated, setUpdated] = useState<number | null>(null);
  const now = useNow(1000);

  useEffect(() => {
    const h = (e: Event) => setUpdated((e as CustomEvent<number>).detail);
    window.addEventListener("pm-updated", h);
    return () => window.removeEventListener("pm-updated", h);
  }, []);

  const q = (g: string) => (g ? `?game=${g}` : "");
  const sec = updated ? Math.max(0, Math.round((now - updated) / 1000)) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-[#23232f] bg-[#0a0a10]/95 backdrop-blur">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-5 gap-y-2 px-4 py-2.5">
        <Link href={`/${q(game)}`} className="leading-tight">
          <div className="text-[15px] font-extrabold tracking-tight text-white">Esports Fix Monitor</div>
          <div className="text-[10px] text-slate-500">CS2 · Dota 2 · Polymarket</div>
        </Link>

        <nav className="flex gap-1 rounded-xl border border-[#23232f] bg-[#101018] p-1">
          {NAV.map((n) => {
            const active = n.href === "/" ? path === "/" || path.startsWith("/match") : path.startsWith(n.href);
            return (
              <Link
                key={n.href}
                href={`${n.href}${q(game)}`}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${active ? "bg-[#23232f] text-white" : "text-slate-400 hover:text-white"}`}
              >
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex gap-1 rounded-full border border-[#23232f] bg-[#101018] p-1">
          {[
            { v: "", l: "Все" },
            { v: "cs2", l: "CS2" },
            { v: "dota2", l: "Dota 2" },
          ].map((o) => (
            <button
              key={o.v}
              onClick={() => router.push(`${path.startsWith("/match") ? "/" : path}${q(o.v)}`)}
              className={`rounded-full px-3.5 py-1 text-xs font-bold ${game === o.v ? "bg-red-500 text-white" : "text-slate-400 hover:text-white"}`}
            >
              {o.l}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 text-xs text-slate-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          {sec === null ? "Подключение…" : `Обновлено ${sec}с назад`}
          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-300">real time</span>
        </div>
      </div>
    </header>
  );
}
