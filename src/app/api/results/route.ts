import { NextResponse } from "next/server";
import { guard } from "@/lib/api";
import { and, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { kickSync, syncInfo } from "@/lib/sync";

export const dynamic = "force-dynamic";

async function handler() {
  kickSync();
  const rows = await db
    .select()
    .from(matches)
    .where(and(eq(matches.status, "finished"), isNotNull(matches.winnerIdx)))
    .orderBy(desc(matches.startTime))
    .limit(300);
  return NextResponse.json({
    items: rows.map((m) => ({
      slug: m.slug,
      game: m.game,
      title: m.title,
      team1: m.team1,
      team2: m.team2,
      tournament: m.tournament,
      bestOf: m.bestOf,
      start: m.startTime.getTime(),
      scoreText: m.scoreText,
      winnerIdx: m.winnerIdx,
      signalScore: m.signalScore,
      signalSide: m.signalSide,
      signalPrice: m.signalPrice,
      signalWon: m.signalWon,
      volume: m.volume,
    })),
    sync: syncInfo(),
  });
}

export const GET = guard(handler);
