import type { Reason, WindowStat } from "@/lib/analytics";

export type ListItem = {
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
  price1: number | null;
  price2: number | null;
  openPrice1: number | null;
  volume: number;
  mode: string;
  a: {
    score: number;
    level: string;
    moneySide: 0 | 1 | null;
    moneyShare: number;
    moneyUsd: number;
    topWalletShare: number;
    trades: number;
    wallets: number;
    lastTradeAgoSec: number | null;
    switched: number;
    w5: WindowStat;
    reasons: Reason[];
    totalUsd: [number, number];
  };
};

export type MatchesResponse = {
  items: ListItem[];
  kpi: {
    high: number;
    medium: number;
    live: number;
    total: number;
    withFlow: number;
    alertsResolved: number;
    alertHits: number;
    resolved: number;
  };
  sync: { running: boolean; phase: string; lastFull: number; lastError: string };
  now: number;
};
