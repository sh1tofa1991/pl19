import {
  boolean,
  index,
  integer,
  pgTable,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const matches = pgTable("matches", {
  slug: text("slug").primaryKey(),
  eventId: text("event_id").notNull(),
  game: text("game").notNull(), // cs2 | dota2
  title: text("title").notNull(),
  team1: text("team1").notNull(),
  team2: text("team2").notNull(),
  bestOf: text("best_of").notNull().default("BO3"),
  tournament: text("tournament").notNull().default(""),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  status: text("status").notNull().default("upcoming"), // upcoming | live | finished
  winnerIdx: integer("winner_idx"),
  scoreText: text("score_text").notNull().default(""),
  closedAt: timestamp("closed_at", { withTimezone: true }),
  volume: real("volume").notNull().default(0),
  price1: real("price1"),
  price2: real("price2"),
  openPrice1: real("open_price1"),
  signalScore: integer("signal_score"),
  signalSide: integer("signal_side"),
  signalPrice: real("signal_price"),
  signalWon: boolean("signal_won"),
  tradesSyncedAt: timestamp("trades_synced_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const markets = pgTable(
  "markets",
  {
    conditionId: text("condition_id").primaryKey(),
    matchSlug: text("match_slug").notNull(),
    kind: text("kind").notNull(), // match | map
    mapNo: integer("map_no").notNull().default(0),
    token1: text("token1").notNull().default(""),
    token2: text("token2").notNull().default(""),
    price1: real("price1"),
    price2: real("price2"),
    volume: real("volume").notNull().default(0),
    winnerIdx: integer("winner_idx"),
    closed: boolean("closed").notNull().default(false),
  },
  (t) => [index("markets_match_idx").on(t.matchSlug)],
);

export const trades = pgTable(
  "trades",
  {
    id: text("id").primaryKey(),
    conditionId: text("condition_id").notNull(),
    matchSlug: text("match_slug").notNull(),
    wallet: text("wallet").notNull(),
    name: text("name").notNull().default(""),
    side: text("side").notNull(), // BUY | SELL
    outcomeIdx: integer("outcome_idx").notNull(),
    shares: real("shares").notNull(),
    price: real("price").notNull(),
    usd: real("usd").notNull(),
    ts: timestamp("ts", { withTimezone: true }).notNull(),
  },
  (t) => [
    index("trades_cond_ts_idx").on(t.conditionId, t.ts),
    index("trades_wallet_idx").on(t.wallet),
    index("trades_match_idx").on(t.matchSlug),
  ],
);

export const walletStats = pgTable(
  "wallet_stats",
  {
    address: text("address").primaryKey(),
    name: text("name").notNull().default(""),
    matches: integer("matches").notNull().default(0),
    wins: integer("wins").notNull().default(0),
    staked: real("staked").notNull().default(0),
    profit: real("profit").notNull().default(0),
    cs2: integer("cs2").notNull().default(0),
    dota2: integer("dota2").notNull().default(0),
    bigBets: integer("big_bets").notNull().default(0),
    bigWins: integer("big_wins").notNull().default(0),
    openUsd: real("open_usd").notNull().default(0),
    tag: text("tag").notNull().default(""), // strong | suspect | ""
    lastBetAt: timestamp("last_bet_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("wallet_stats_profit_idx").on(t.profit)],
);

export const syncState = pgTable("sync_state", {
  key: text("key").primaryKey(),
  value: text("value").notNull(),
});
