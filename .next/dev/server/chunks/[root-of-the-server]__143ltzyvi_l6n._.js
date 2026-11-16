module.exports = [
(()=>{"use strict";return[
"[project]/src/app/api/matches/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "GET",
    ()=>GET,
    "dynamic",
    ()=>dynamic
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/expressions/conditions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/sync.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$queries$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/queries.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$queries$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$queries$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
;
;
const dynamic = "force-dynamic";
async function GET(req) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["kickSync"])();
    const game = new URL(req.url).searchParams.get("game");
    const open = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$queries$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["loadOpenMatches"])(game);
    const items = open.map(({ m, a, mode })=>({
            slug: m.slug,
            game: m.game,
            title: m.title,
            team1: m.team1,
            team2: m.team2,
            bestOf: m.bestOf,
            tournament: m.tournament,
            start: m.startTime.getTime(),
            status: m.status,
            scoreText: m.scoreText,
            price1: m.price1,
            price2: m.price2,
            openPrice1: m.openPrice1,
            volume: m.volume,
            mode,
            a: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$queries$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["summary"])(a)
        })).sort((x, y)=>{
        if (x.status !== y.status) return x.status === "live" ? -1 : 1;
        if (y.a.score !== x.a.score) return y.a.score - x.a.score;
        return x.start - y.start;
    });
    const cond = [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].status, "finished"),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["isNotNull"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].signalScore)
    ];
    if (game === "cs2" || game === "dota2") cond.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].game, game));
    const fin = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
        s: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].signalScore,
        w: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].signalWon,
        p: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].signalPrice
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["and"])(...cond));
    const alerts = fin.filter((f)=>(f.s ?? 0) >= 60);
    const hits = alerts.filter((f)=>f.w).length;
    const now = Date.now();
    return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
        items,
        kpi: {
            high: items.filter((i)=>i.a.score >= 60).length,
            medium: items.filter((i)=>i.a.score >= 30 && i.a.score < 60).length,
            live: items.filter((i)=>i.status === "live").length,
            total: items.length,
            withFlow: items.filter((i)=>i.a.lastTradeAgoSec !== null && i.a.lastTradeAgoSec < 1800).length,
            alertsResolved: alerts.length,
            alertHits: hits,
            resolved: fin.length
        },
        sync: (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$sync$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncInfo"])(),
        now
    });
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/db/index.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "db",
    ()=>db,
    "pool",
    ()=>pool
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/node-postgres/driver.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__ = __turbopack_context__.i("[externals]/pg [external] (pg, esm_import, [project]/node_modules/pg)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__,
    __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__, __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
}
const globalForDb = globalThis;
const pool = globalForDb.__arenaNextJsPostgresqlPool ?? new __TURBOPACK__imported__module__$5b$externals$5d2f$pg__$5b$external$5d$__$28$pg$2c$__esm_import$2c$__$5b$project$5d2f$node_modules$2f$pg$29$__["Pool"]({
    connectionString: databaseUrl
});
if ("TURBOPACK compile-time truthy", 1) {
    globalForDb.__arenaNextJsPostgresqlPool = pool;
}
const db = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$node$2d$postgres$2f$driver$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["drizzle"])(pool);
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/db/schema.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "markets",
    ()=>markets,
    "matches",
    ()=>matches,
    "syncState",
    ()=>syncState,
    "trades",
    ()=>trades,
    "walletStats",
    ()=>walletStats
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/boolean.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/indexes.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/integer.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/table.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/real.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/text.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/pg-core/columns/timestamp.js [app-route] (ecmascript)");
;
const matches = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("matches", {
    slug: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("slug").primaryKey(),
    eventId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("event_id").notNull(),
    game: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("game").notNull(),
    title: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("title").notNull(),
    team1: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("team1").notNull(),
    team2: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("team2").notNull(),
    bestOf: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("best_of").notNull().default("BO3"),
    tournament: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("tournament").notNull().default(""),
    startTime: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("start_time", {
        withTimezone: true
    }).notNull(),
    status: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("status").notNull().default("upcoming"),
    winnerIdx: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("winner_idx"),
    scoreText: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("score_text").notNull().default(""),
    closedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("closed_at", {
        withTimezone: true
    }),
    volume: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["real"])("volume").notNull().default(0),
    price1: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["real"])("price1"),
    price2: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["real"])("price2"),
    openPrice1: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["real"])("open_price1"),
    signalScore: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("signal_score"),
    signalSide: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("signal_side"),
    signalPrice: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["real"])("signal_price"),
    signalWon: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])("signal_won"),
    tradesSyncedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("trades_synced_at", {
        withTimezone: true
    }),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at", {
        withTimezone: true
    }).defaultNow().notNull()
});
const markets = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("markets", {
    conditionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("condition_id").primaryKey(),
    matchSlug: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("match_slug").notNull(),
    kind: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("kind").notNull(),
    mapNo: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("map_no").notNull().default(0),
    token1: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("token1").notNull().default(""),
    token2: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("token2").notNull().default(""),
    price1: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["real"])("price1"),
    price2: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["real"])("price2"),
    volume: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["real"])("volume").notNull().default(0),
    winnerIdx: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("winner_idx"),
    closed: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$boolean$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["boolean"])("closed").notNull().default(false)
}, (t)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("markets_match_idx").on(t.matchSlug)
    ]);
const trades = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("trades", {
    id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("id").primaryKey(),
    conditionId: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("condition_id").notNull(),
    matchSlug: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("match_slug").notNull(),
    wallet: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("wallet").notNull(),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("name").notNull().default(""),
    side: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("side").notNull(),
    outcomeIdx: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("outcome_idx").notNull(),
    shares: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["real"])("shares").notNull(),
    price: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["real"])("price").notNull(),
    usd: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["real"])("usd").notNull(),
    ts: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("ts", {
        withTimezone: true
    }).notNull()
}, (t)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("trades_cond_ts_idx").on(t.conditionId, t.ts),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("trades_wallet_idx").on(t.wallet),
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("trades_match_idx").on(t.matchSlug)
    ]);
const walletStats = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("wallet_stats", {
    address: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("address").primaryKey(),
    name: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("name").notNull().default(""),
    matches: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("matches").notNull().default(0),
    wins: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("wins").notNull().default(0),
    staked: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["real"])("staked").notNull().default(0),
    profit: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["real"])("profit").notNull().default(0),
    cs2: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("cs2").notNull().default(0),
    dota2: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("dota2").notNull().default(0),
    bigBets: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("big_bets").notNull().default(0),
    bigWins: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$integer$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["integer"])("big_wins").notNull().default(0),
    openUsd: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$real$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["real"])("open_usd").notNull().default(0),
    tag: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("tag").notNull().default(""),
    lastBetAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("last_bet_at", {
        withTimezone: true
    }),
    updatedAt: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$timestamp$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["timestamp"])("updated_at", {
        withTimezone: true
    }).defaultNow().notNull()
}, (t)=>[
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$indexes$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["index"])("wallet_stats_profit_idx").on(t.profit)
    ]);
const syncState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$table$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["pgTable"])("sync_state", {
    key: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("key").primaryKey(),
    value: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$pg$2d$core$2f$columns$2f$text$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["text"])("value").notNull()
});
}),
"[project]/src/lib/analytics.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "analyze",
    ()=>analyze,
    "fmtK",
    ()=>fmtK,
    "label",
    ()=>label,
    "levelOf",
    ()=>levelOf,
    "shortAddr",
    ()=>shortAddr
]);
const clamp = (v, a = 0, b = 1)=>Math.min(b, Math.max(a, v));
function levelOf(score) {
    return score >= 60 ? "high" : score >= 30 ? "medium" : "low";
}
function shortAddr(a) {
    return a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
}
function label(name, wallet) {
    return name && name.length > 0 ? name : shortAddr(wallet);
}
function analyze(all, opts) {
    const { asOf, windowMin, names } = opts;
    const buys = all.filter((t)=>t.side === "BUY" && t.ts <= asOf).sort((a, b)=>a.ts - b.ts);
    const win = buys.filter((t)=>t.ts > asOf - windowMin * 60000);
    const usd = [
        0,
        0
    ];
    for (const t of win)usd[t.outcomeIdx === 0 ? 0 : 1] += t.usd;
    const total = usd[0] + usd[1];
    const lead = total > 0 ? usd[0] >= usd[1] ? 0 : 1 : null;
    const share = lead === null ? 0 : usd[lead] / total;
    // wallets on lead side
    const perWallet = new Map();
    if (lead !== null) {
        for (const t of win){
            if (t.outcomeIdx !== lead) continue;
            const cur = perWallet.get(t.wallet) ?? {
                name: t.name,
                usd: 0
            };
            cur.usd += t.usd;
            if (t.name) cur.name = t.name;
            perWallet.set(t.wallet, cur);
        }
    }
    let topWallet = "";
    let topUsd = 0;
    for (const [w, v] of perWallet){
        if (v.usd > topUsd) {
            topUsd = v.usd;
            topWallet = w;
        }
    }
    const leadUsd = lead === null ? 0 : usd[lead];
    const topShare = leadUsd > 0 ? topUsd / leadUsd : 0;
    const avgBuy = win.length ? total / win.length : 0;
    const maxTrade = win.reduce((m, t)=>Math.max(m, t.usd), 0);
    const mult = avgBuy > 0 ? maxTrade / avgBuy : 0;
    const leadPrice = lead === null ? null : opts.prices[lead];
    // score
    let score = 0;
    const reasons = [];
    if (win.length < 3 || total < 30) {
        reasons.push({
            ok: false,
            text: "Мало сделок в окне анализа — данных недостаточно"
        });
    } else {
        const leadName = names[lead];
        const p1 = clamp((share - 0.55) / 0.4) * 30;
        const p2 = clamp((topShare - 0.3) / 0.6) * 25;
        const p3 = leadUsd > 500 ? clamp(Math.log10(leadUsd / 500) / Math.log10(40)) * 20 : 0;
        const p4 = clamp((mult - 3) / 12) * 10;
        const p5 = leadPrice !== null ? leadPrice < 0.4 ? 10 : leadPrice < 0.5 ? 5 : 0 : 0;
        score = Math.round(Math.min(100, p1 + p2 + p3 + p4 + p5));
        reasons.push({
            ok: share >= 0.7,
            text: `${Math.round(share * 100)}% свежих денег пришло на ${leadName}`
        });
        reasons.push({
            ok: topShare >= 0.5,
            text: topShare >= 0.5 ? `Один кошелёк даёт ${Math.round(topShare * 100)}% этих денег` : `Деньги распределены между кошельками (топ-кошелёк ${Math.round(topShare * 100)}%)`
        });
        reasons.push({
            ok: leadUsd >= 2000,
            text: leadUsd >= 2000 ? `Крупные ставки для рынка такого размера ($${fmtK(leadUsd)} на ${leadName})` : `Объём на ${leadName} небольшой ($${fmtK(leadUsd)})`
        });
        if (mult >= 6) reasons.push({
            ok: true,
            text: `Разовая ставка в ${mult.toFixed(1)}× больше средней`
        });
        if (leadPrice !== null) {
            reasons.push({
                ok: leadPrice < 0.5,
                text: leadPrice < 0.5 ? `${leadName} — андердог по цене (${Math.round(leadPrice * 100)}%), деньги идут против рынка` : `${leadName} — фаворит по цене (${Math.round(leadPrice * 100)}%)`
            });
        }
    }
    // windows
    const windows = [
        1,
        5,
        15
    ].map((m)=>{
        const u = [
            0,
            0
        ];
        const n = [
            0,
            0
        ];
        for (const t of buys){
            if (t.ts > asOf - m * 60000) {
                const i = t.outcomeIdx === 0 ? 0 : 1;
                u[i] += t.usd;
                n[i] += 1;
            }
        }
        const tot = u[0] + u[1];
        const l = tot > 0 ? u[0] >= u[1] ? 0 : 1 : null;
        return {
            min: m,
            usd: u,
            n,
            lead: l,
            pct: l === null ? 0 : u[l] / tot
        };
    });
    // switched sides (whole history)
    const byWallet = new Map();
    for (const t of buys){
        const arr = byWallet.get(t.wallet) ?? [];
        arr.push(t);
        byWallet.set(t.wallet, arr);
    }
    const switched = [];
    const liveW = [];
    for (const [w, arr] of byWallet){
        const first = arr[0].outcomeIdx;
        const last = arr[arr.length - 1].outcomeIdx;
        const nm = arr.find((x)=>x.name)?.name ?? "";
        if (first !== last) {
            const usdNew = arr.filter((x)=>x.outcomeIdx === last).reduce((s, x)=>s + x.usd, 0);
            switched.push({
                wallet: w,
                name: nm,
                from: first,
                to: last,
                usd: usdNew
            });
        }
        const recent = arr.filter((x)=>x.ts > asOf - 30 * 60000);
        if (recent.length) {
            const u = [
                0,
                0
            ];
            for (const x of recent)u[x.outcomeIdx === 0 ? 0 : 1] += x.usd;
            liveW.push({
                wallet: w,
                name: nm,
                usd: u[0] + u[1],
                side: u[0] >= u[1] ? 0 : 1,
                trades: recent.length
            });
        }
    }
    switched.sort((a, b)=>b.usd - a.usd);
    liveW.sort((a, b)=>b.usd - a.usd);
    const biggest = [
        ...win
    ].sort((a, b)=>b.usd - a.usd).slice(0, 6).map((t)=>({
            wallet: t.wallet,
            name: t.name,
            usd: t.usd,
            side: t.outcomeIdx,
            price: t.price,
            ts: t.ts
        }));
    const recent = buys.slice(-12).reverse().map((t)=>({
            wallet: t.wallet,
            name: t.name,
            usd: t.usd,
            side: t.outcomeIdx,
            price: t.price,
            ts: t.ts,
            mult: avgBuy > 0 ? t.usd / avgBuy : 0
        }));
    // timeline
    const timeline = [];
    const sinceUsd = [
        0,
        0
    ];
    for (const t of buys)sinceUsd[t.outcomeIdx === 0 ? 0 : 1] += t.usd;
    if (buys.length) {
        const t0 = buys[0].ts;
        const span = Math.max(asOf - t0, 60000);
        const N = 24;
        const step = span / N;
        let carry = null;
        let idx = 0;
        for(let b = 0; b < N; b++){
            const lo = t0 + b * step;
            const hi = lo + step;
            const u = [
                0,
                0
            ];
            while(idx < buys.length && buys[idx].ts < hi + (b === N - 1 ? 1 : 0)){
                const t = buys[idx];
                u[t.outcomeIdx === 0 ? 0 : 1] += t.usd;
                carry = t.outcomeIdx === 0 ? t.price : 1 - t.price;
                idx++;
            }
            timeline.push({
                t: lo,
                usd: u,
                odds0: carry
            });
        }
    }
    const ppOf = (t)=>t.outcomeIdx === 0 ? t.price : 1 - t.price;
    const oddsFrom = buys.length ? ppOf(buys[0]) : null;
    const oddsTo = buys.length ? ppOf(buys[buys.length - 1]) : null;
    return {
        score,
        level: levelOf(score),
        moneySide: lead,
        moneyShare: share,
        moneyUsd: leadUsd,
        netUsd: lead === null ? 0 : usd[lead] - usd[lead === 0 ? 1 : 0],
        totalUsd: usd,
        tradeCount: win.length,
        walletCount: new Set(win.map((t)=>t.wallet)).size,
        avgBuy,
        lastTradeAgoSec: buys.length ? Math.max(0, Math.round((asOf - buys[buys.length - 1].ts) / 1000)) : null,
        topWalletShare: topShare,
        topWalletName: topWallet ? label(perWallet.get(topWallet)?.name ?? "", topWallet) : "",
        topWalletCount: perWallet.size,
        windows,
        reasons,
        switched,
        liveWallets: liveW,
        biggest,
        recent,
        timeline,
        sinceStart: {
            usd: sinceUsd,
            trades: buys.length,
            wallets: byWallet.size
        },
        oddsFrom,
        oddsTo
    };
}
function fmtK(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
    if (n >= 1e4) return Math.round(n / 1000) + "k";
    if (n >= 1000) return (n / 1000).toFixed(1) + "k";
    return String(Math.round(n));
}
}),
"[project]/src/lib/queries.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "analyzeMatch",
    ()=>analyzeMatch,
    "loadOpenMatches",
    ()=>loadOpenMatches,
    "sqlCount",
    ()=>sqlCount,
    "summary",
    ()=>summary,
    "toRow",
    ()=>toRow
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/expressions/conditions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/sql.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/analytics.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const toRow = (t)=>({
        wallet: t.wallet,
        name: t.name,
        side: t.side,
        outcomeIdx: t.outcomeIdx,
        usd: t.usd,
        price: t.price,
        ts: t.ts.getTime()
    });
function analyzeMatch(m, rows, mode) {
    const prices = [
        m.price1,
        m.price2
    ];
    if (mode === "pre") {
        return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["analyze"])(rows, {
            asOf: Math.min(Date.now(), m.startTime.getTime()),
            windowMin: 360,
            names: [
                m.team1,
                m.team2
            ],
            prices
        });
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["analyze"])(rows, {
        asOf: Date.now(),
        windowMin: 30,
        names: [
            m.team1,
            m.team2
        ],
        prices
    });
}
function summary(a) {
    return {
        score: a.score,
        level: a.level,
        moneySide: a.moneySide,
        moneyShare: a.moneyShare,
        moneyUsd: a.moneyUsd,
        topWalletShare: a.topWalletShare,
        trades: a.tradeCount,
        wallets: a.walletCount,
        lastTradeAgoSec: a.lastTradeAgoSec,
        switched: a.switched.length,
        w5: a.windows[1],
        reasons: a.reasons,
        totalUsd: a.totalUsd
    };
}
async function loadOpenMatches(game) {
    const cond = [
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inArray"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].status, [
            "live",
            "upcoming"
        ])
    ];
    if (game === "cs2" || game === "dota2") cond.push((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].game, game));
    const list = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["and"])(...cond));
    if (!list.length) return [];
    const slugs = list.map((m)=>m.slug);
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
        t: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trades"]
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trades"]).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markets"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["and"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markets"].conditionId, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trades"].conditionId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markets"].kind, "match"))).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inArray"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trades"].matchSlug, slugs));
    const by = new Map();
    for (const { t } of rows){
        const arr = by.get(t.matchSlug) ?? [];
        arr.push(toRow(t));
        by.set(t.matchSlug, arr);
    }
    return list.map((m)=>{
        const tr = by.get(m.slug) ?? [];
        const mode = m.status === "live" ? "live" : "pre";
        const a = analyzeMatch(m, tr, mode);
        return {
            m,
            a,
            mode
        };
    });
}
async function sqlCount(table) {
    const r = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].execute(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`select count(*)::int as c from ${__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"].raw(table)}`);
    return Number(r.rows[0].c);
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
"[project]/src/lib/sync.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

return __turbopack_context__.a(async (__turbopack_handle_async_dependencies__, __turbopack_async_result__) => { try {
__turbopack_context__.s([
    "finalizeSignal",
    ()=>finalizeSignal,
    "kickSync",
    ()=>kickSync,
    "recomputeWallets",
    ()=>recomputeWallets,
    "syncInfo",
    ()=>syncInfo
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/expressions/conditions.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/expressions/select.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/drizzle-orm/sql/sql.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/index.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/db/schema.ts [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/analytics.ts [app-route] (ecmascript)");
var __turbopack_async_dependencies__ = __turbopack_handle_async_dependencies__([
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__
]);
[__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__] = __turbopack_async_dependencies__.then ? (await __turbopack_async_dependencies__)() : __turbopack_async_dependencies__;
;
;
;
;
const GAMMA = "https://gamma-api.polymarket.com";
const DATA = "https://data-api.polymarket.com/v2";
const SERIES = {
    cs2: "10310",
    dota2: "10309"
};
/* eslint-disable @typescript-eslint/no-explicit-any */ async function getJson(url, tries = 3) {
    for(let i = 0; i < tries; i++){
        try {
            const res = await fetch(url, {
                headers: {
                    "Accept-Encoding": "gzip",
                    Accept: "application/json"
                },
                signal: AbortSignal.timeout(25000),
                cache: "no-store"
            });
            if (res.status === 429) {
                const wait = Number(res.headers.get("retry-after") ?? "1");
                await new Promise((r)=>setTimeout(r, Math.min(5, wait) * 1000));
                continue;
            }
            if (!res.ok) throw new Error(`${res.status} ${url}`);
            return await res.json();
        } catch (e) {
            if (i === tries - 1) throw e;
            await new Promise((r)=>setTimeout(r, 500 * (i + 1)));
        }
    }
}
async function pmap(items, limit, fn) {
    let i = 0;
    const workers = Array.from({
        length: Math.min(limit, items.length)
    }, async ()=>{
        while(i < items.length){
            const item = items[i++];
            try {
                await fn(item);
            } catch (e) {
                state.lastError = String(e.message ?? e);
            }
        }
    });
    await Promise.all(workers);
}
const g = globalThis;
g.__pmSync ??= {
    running: false,
    lastFull: 0,
    lastLive: 0,
    lastBackfill: 0,
    lastError: "",
    phase: "idle",
    startedAt: Date.now()
};
const state = g.__pmSync;
function syncInfo() {
    return {
        running: state.running,
        phase: state.phase,
        lastFull: state.lastFull,
        lastLive: state.lastLive,
        lastError: state.lastError
    };
}
/* ----------------------------- parsing events ----------------------------- */ const parseArr = (s)=>{
    if (Array.isArray(s)) return s;
    try {
        return JSON.parse(String(s));
    } catch  {
        return [];
    }
};
function gameOf(slug) {
    return slug.startsWith("dota2") ? "dota2" : "cs2";
}
async function upsertEvent(e) {
    const ml = (e.markets ?? []).find((m)=>m.sportsMarketType === "moneyline");
    if (!ml) return null;
    const outcomes = parseArr(ml.outcomes);
    if (outcomes.length !== 2) return null;
    const prices = parseArr(ml.outcomePrices).map(Number);
    const startIso = e.startTime ?? (ml.gameStartTime ? String(ml.gameStartTime).replace(" ", "T").replace("+00", "Z") : e.startDate);
    const start = new Date(startIso);
    if (isNaN(start.getTime())) return null;
    const title = e.title ?? "";
    const bo = /\((BO\d)\)/i.exec(title)?.[1]?.toUpperCase() ?? /bo(\d)/i.exec(e.score ?? "")?.[0]?.toUpperCase() ?? "BO3";
    const tournament = title.includes(" - ") ? title.split(" - ").slice(1).join(" - ").trim() : "";
    const cleanTitle = title.replace(/^[^:]+:\s*/, "").split(" - ")[0].replace(/\s*\(BO\d\)\s*$/i, "").trim();
    const decided = prices.length === 2 && Math.max(...prices) > 0.95 && Math.min(...prices) < 0.05;
    const winnerIdx = decided ? prices[0] > prices[1] ? 0 : 1 : null;
    const finished = Boolean(e.closed || e.ended);
    const now = Date.now();
    const status = finished ? "finished" : e.live === true || start.getTime() <= now && now - start.getTime() < 10 * 3600_000 ? "live" : "upcoming";
    const scoreText = String(e.score ?? "").split("|")[1] ?? "";
    const vol = Number(ml.volume ?? e.volume ?? 0) || 0;
    const slug = e.slug;
    const p1 = !finished && prices.length === 2 && prices[0] > 0 && prices[0] < 1 ? prices[0] : null;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"]).values({
        slug,
        eventId: String(e.id),
        game: gameOf(slug),
        title: cleanTitle,
        team1: outcomes[0],
        team2: outcomes[1],
        bestOf: bo,
        tournament,
        startTime: start,
        status,
        winnerIdx,
        scoreText,
        closedAt: e.closedTime ? new Date(String(e.closedTime).replace(" ", "T").replace(/\+00$/, "Z")) : null,
        volume: vol,
        price1: p1,
        price2: p1 === null ? null : 1 - p1
    }).onConflictDoUpdate({
        target: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].slug,
        set: {
            title: cleanTitle,
            startTime: start,
            status,
            winnerIdx,
            scoreText,
            closedAt: e.closedTime ? new Date(String(e.closedTime).replace(" ", "T").replace(/\+00$/, "Z")) : null,
            volume: vol,
            ...p1 !== null ? {
                price1: p1,
                price2: 1 - p1
            } : {},
            updatedAt: new Date()
        }
    });
    for (const m of e.markets ?? []){
        const kind = m.sportsMarketType === "moneyline" ? "match" : m.sportsMarketType === "child_moneyline" ? "map" : null;
        if (!kind) continue;
        const mapNo = kind === "map" ? Number(/(?:Map|Game)\s+(\d+)/i.exec(m.question ?? "")?.[1] ?? 0) : 0;
        if (kind === "map" && !mapNo) continue;
        const toks = parseArr(m.clobTokenIds);
        const pr = parseArr(m.outcomePrices).map(Number);
        const dec = pr.length === 2 && Math.max(...pr) > 0.95 && Math.min(...pr) < 0.05;
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markets"]).values({
            conditionId: m.conditionId,
            matchSlug: slug,
            kind,
            mapNo,
            token1: toks[0] ?? "",
            token2: toks[1] ?? "",
            price1: pr[0] ?? null,
            price2: pr[1] ?? null,
            volume: Number(m.volume ?? 0) || 0,
            winnerIdx: dec ? pr[0] > pr[1] ? 0 : 1 : null,
            closed: Boolean(m.closed)
        }).onConflictDoUpdate({
            target: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markets"].conditionId,
            set: {
                price1: pr[0] ?? null,
                price2: pr[1] ?? null,
                volume: Number(m.volume ?? 0) || 0,
                winnerIdx: dec ? pr[0] > pr[1] ? 0 : 1 : null,
                closed: Boolean(m.closed)
            }
        });
    }
    return slug;
}
/* ------------------------------ syncing trades ----------------------------- */ const walletName = (t)=>{
    const n = String(t.name ?? "");
    if (n && !/^0x[0-9a-f]{20,}/i.test(n)) return n;
    return String(t.pseudonym ?? "");
};
async function fetchTrades(conditionId, pages, limit) {
    const out = [];
    let cursor = null;
    for(let p = 0; p < pages; p++){
        const url = `${DATA}/trades?condition=${conditionId}&limit=${limit}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`;
        const j = await getJson(url);
        out.push(...j.data ?? []);
        cursor = j.pagination?.has_more ? j.pagination.next_cursor : null;
        if (!cursor) break;
    }
    return out;
}
async function syncMarketTrades(slug, conditionId, pages, limit) {
    const rows = await fetchTrades(conditionId, pages, limit);
    const values = rows.filter((t)=>t.size > 0 && t.price > 0 && t.proxy_wallet).map((t)=>({
            id: `${t.transaction_hash}:${t.proxy_wallet}:${String(t.token_id).slice(-8)}:${t.side}:${t.size}`,
            conditionId,
            matchSlug: slug,
            wallet: String(t.proxy_wallet).toLowerCase(),
            name: walletName(t),
            side: String(t.side),
            outcomeIdx: Number(t.outcome_index) === 1 ? 1 : 0,
            shares: Number(t.size),
            price: Number(t.price),
            usd: Number(t.size) * Number(t.price),
            ts: new Date(Number(t.timestamp) * 1000)
        }));
    for(let i = 0; i < values.length; i += 400){
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trades"]).values(values.slice(i, i + 400)).onConflictDoNothing();
    }
    return values.length;
}
async function refreshPrices(slug, conditionId) {
    const last = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trades"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trades"].conditionId, conditionId)).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["desc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trades"].ts)).limit(1);
    const first = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trades"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trades"].conditionId, conditionId)).orderBy((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$select$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["asc"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trades"].ts)).limit(1);
    const p0 = (t)=>t.outcomeIdx === 0 ? t.price : 1 - t.price;
    const set = {};
    if (last[0]) {
        set.price1 = p0(last[0]);
        set.price2 = 1 - p0(last[0]);
    }
    if (first[0]) set.openPrice1 = p0(first[0]);
    if (Object.keys(set).length) await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].update(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"]).set(set).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].slug, slug));
}
async function syncMatchTrades(slug, opts) {
    const mks = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markets"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markets"].matchSlug, slug));
    const ml = mks.find((m)=>m.kind === "match");
    if (!ml) return;
    await syncMarketTrades(slug, ml.conditionId, opts.deep ? 4 : 1, opts.deep ? 1000 : 300);
    if (opts.live) {
        for (const m of mks.filter((x)=>x.kind === "map" && !x.closed)){
            await syncMarketTrades(slug, m.conditionId, 1, opts.deep ? 500 : 150);
        }
    }
    await refreshPrices(slug, ml.conditionId);
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].update(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"]).set({
        tradesSyncedAt: new Date()
    }).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].slug, slug));
}
async function finalizeSignal(slug) {
    const [m] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].slug, slug));
    if (!m || m.status !== "finished" || m.winnerIdx === null) return;
    const [ml] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markets"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["and"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markets"].matchSlug, slug), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markets"].kind, "match")));
    if (!ml) return;
    const rows = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trades"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["and"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trades"].conditionId, ml.conditionId), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lt"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["trades"].ts, m.startTime)));
    if (rows.length < 3) {
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].update(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"]).set({
            signalScore: null,
            signalSide: null
        }).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].slug, slug));
        return;
    }
    const tr = rows.map((t)=>({
            wallet: t.wallet,
            name: t.name,
            side: t.side,
            outcomeIdx: t.outcomeIdx,
            usd: t.usd,
            price: t.price,
            ts: t.ts.getTime()
        }));
    const lastP = [
        ...tr
    ].sort((a, b)=>b.ts - a.ts)[0];
    const pr0 = lastP.outcomeIdx === 0 ? lastP.price : 1 - lastP.price;
    const a = (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$analytics$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["analyze"])(tr, {
        asOf: m.startTime.getTime(),
        windowMin: 360,
        names: [
            m.team1,
            m.team2
        ],
        prices: [
            pr0,
            1 - pr0
        ]
    });
    if (a.moneySide === null) return;
    const sidePrice = a.moneySide === 0 ? pr0 : 1 - pr0;
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].update(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"]).set({
        signalScore: a.score,
        signalSide: a.moneySide,
        signalPrice: Math.min(0.97, Math.max(0.03, sidePrice)),
        signalWon: a.moneySide === m.winnerIdx
    }).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].slug, slug));
}
async function recomputeWallets() {
    const res = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].execute(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$sql$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["sql"]`
    select t.wallet as wallet, t.condition_id as cond, t.outcome_idx as idx,
      sum(case when t.side='BUY' then t.usd else 0 end) as buy,
      sum(case when t.side='SELL' then t.usd else 0 end) as sell,
      sum(case when t.side='BUY' then t.shares else -t.shares end) as net,
      max(t.ts) as last,
      max(case when t.name <> '' then t.name else null end) as name
    from trades t join markets mk on mk.condition_id = t.condition_id and mk.kind = 'match'
    group by t.wallet, t.condition_id, t.outcome_idx
  `);
    const mk = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select({
        cond: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markets"].conditionId,
        winner: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markets"].winnerIdx,
        p1: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].price1,
        status: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].status,
        game: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].game,
        mw: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].winnerIdx
    }).from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markets"]).innerJoin(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"], (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].slug, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markets"].matchSlug)).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["markets"].kind, "match"));
    const mmap = new Map(mk.map((m)=>[
            m.cond,
            m
        ]));
    const per = new Map();
    for (const r of res.rows){
        const w = per.get(r.wallet) ?? {
            name: "",
            last: 0,
            conds: new Map()
        };
        if (r.name) w.name = r.name;
        const last = new Date(r.last).getTime();
        w.last = Math.max(w.last, last);
        const p = w.conds.get(r.cond) ?? {
            buy: [
                0,
                0
            ],
            sell: [
                0,
                0
            ],
            net: [
                0,
                0
            ],
            last: 0
        };
        p.buy[r.idx] = Number(r.buy);
        p.sell[r.idx] = Number(r.sell);
        p.net[r.idx] = Number(r.net);
        p.last = Math.max(p.last, last);
        w.conds.set(r.cond, p);
        per.set(r.wallet, w);
    }
    const out = [];
    for (const [addr, w] of per){
        let n = 0, wins = 0, staked = 0, profit = 0, cs2 = 0, dota = 0, big = 0, bigW = 0, open = 0;
        for (const [cond, p] of w.conds){
            const m = mmap.get(cond);
            if (!m) continue;
            const buy = p.buy[0] + p.buy[1];
            const sell = p.sell[0] + p.sell[1];
            if (buy < 1) continue;
            if (m.status === "finished" && m.mw !== null) {
                n++;
                staked += buy;
                const payout = Math.max(0, p.net[m.mw]);
                const pr = payout + sell - buy;
                profit += pr;
                if (pr > 0) wins++;
                if (m.game === "cs2") cs2++;
                else dota++;
                if (buy >= 200) {
                    big++;
                    if (pr > 0) bigW++;
                }
            } else if (m.status !== "finished") {
                const p1 = m.p1 ?? 0.5;
                open += Math.max(0, p.net[0]) * p1 + Math.max(0, p.net[1]) * (1 - p1);
            }
        }
        if (n === 0 && open < 50) continue;
        const wr = n ? wins / n : 0;
        const tag = n >= 7 && wr >= 0.85 && profit > 0 && profit / Math.max(1, staked) >= 0.15 ? "suspect" : n >= 5 && wr >= 0.75 && profit > 0 ? "strong" : "";
        out.push({
            address: addr,
            name: w.name,
            matches: n,
            wins,
            staked,
            profit,
            cs2,
            dota2: dota,
            bigBets: big,
            bigWins: bigW,
            openUsd: open,
            tag,
            lastBetAt: new Date(w.last),
            updatedAt: new Date()
        });
    }
    await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].delete(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["walletStats"]);
    for(let i = 0; i < out.length; i += 500){
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["walletStats"]).values(out.slice(i, i + 500)).onConflictDoNothing();
    }
}
/* ---------------------------------- jobs ----------------------------------- */ async function syncActive() {
    state.phase = "events";
    const now = Date.now();
    const seen = new Set();
    const endMin = new Date(now - 14 * 3600_000).toISOString();
    const endMax = new Date(now + 3 * 86400_000).toISOString();
    for (const sid of Object.values(SERIES)){
        for(let off = 0; off < 150; off += 50){
            const url = `${GAMMA}/events?series_id=${sid}&closed=false&limit=50&offset=${off}&order=startDate&ascending=false&end_date_min=${endMin}&end_date_max=${endMax}`;
            const list = await getJson(url);
            if (!Array.isArray(list)) break;
            for (const e of list){
                const st = new Date(e.startTime ?? e.startDate).getTime();
                if (isNaN(st) || st < now - 14 * 3600_000 || st > now + 2 * 86400_000) continue;
                const s = await upsertEvent(e);
                if (s) seen.add(s);
            }
            if (list.length < 50) break;
        }
    }
    // matches that vanished from active list: refresh individually (finished)
    const stale = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["and"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inArray"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].status, [
        "live",
        "upcoming"
    ]), (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["lt"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].startTime, new Date(now - 30 * 60_000))));
    const missing = stale.filter((m)=>!seen.has(m.slug));
    await pmap(missing, 4, async (m)=>{
        const list = await getJson(`${GAMMA}/events?slug=${m.slug}`);
        if (list[0]) {
            await upsertEvent(list[0]);
            await syncMatchTrades(m.slug, {
                live: false,
                deep: true
            });
            await finalizeSignal(m.slug);
        } else {
            await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].update(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"]).set({
                status: "finished"
            }).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].slug, m.slug));
        }
    });
}
async function syncOpenTrades(onlyLive) {
    state.phase = "trades";
    const now = Date.now();
    const list = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inArray"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].status, onlyLive ? [
        "live"
    ] : [
        "live",
        "upcoming"
    ]));
    const targets = list.filter((m)=>m.status === "live" || m.startTime.getTime() < now + 12 * 3600_000);
    await pmap(targets, 5, async (m)=>{
        await syncMatchTrades(m.slug, {
            live: m.status === "live",
            deep: !m.tradesSyncedAt
        });
    });
}
async function backfillFinished() {
    state.phase = "history";
    const picked = [];
    for (const sid of Object.values(SERIES)){
        const list = await getJson(`${GAMMA}/events?series_id=${sid}&closed=true&limit=50&order=closedTime&ascending=false`);
        let c = 0;
        for (const e of Array.isArray(list) ? list : []){
            if (c >= 40) break;
            const s = await upsertEvent(e);
            if (!s) continue;
            const [m] = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["eq"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].slug, s));
            if (m && m.winnerIdx !== null) {
                picked.push(s);
                c++;
            }
        }
    }
    const todo = await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].select().from(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"]).where((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["and"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$drizzle$2d$orm$2f$sql$2f$expressions$2f$conditions$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["inArray"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["matches"].slug, picked.length ? picked : [
        "-"
    ])));
    await pmap(todo.filter((m)=>!m.tradesSyncedAt), 4, async (m)=>{
        await syncMatchTrades(m.slug, {
            live: false,
            deep: true
        });
        await finalizeSignal(m.slug);
    });
    const noSig = todo.filter((m)=>m.tradesSyncedAt && m.signalScore === null);
    await pmap(noSig, 4, async (m)=>finalizeSignal(m.slug));
}
async function runSync() {
    if (state.running) return;
    state.running = true;
    state.startedAt = Date.now();
    try {
        const now = Date.now();
        if (now - state.lastFull > 120_000 || state.lastFull === 0) {
            await syncActive();
            await syncOpenTrades(false);
            state.lastFull = Date.now();
            state.lastLive = Date.now();
            state.phase = "wallets";
            await recomputeWallets();
            if (state.lastBackfill === 0 || Date.now() - state.lastBackfill > 20 * 60_000) {
                await backfillFinished();
                state.lastBackfill = Date.now();
                state.phase = "wallets";
                await recomputeWallets();
            }
        } else if (now - state.lastLive > 6_000) {
            await syncOpenTrades(true);
            state.lastLive = Date.now();
        }
        await __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$index$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["db"].insert(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncState"]).values({
            key: "last_sync",
            value: String(Date.now())
        }).onConflictDoUpdate({
            target: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$db$2f$schema$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["syncState"].key,
            set: {
                value: String(Date.now())
            }
        });
    } catch (e) {
        state.lastError = String(e.message ?? e);
    } finally{
        state.phase = "idle";
        state.running = false;
    }
}
function kickSync() {
    if (state.running) {
        // recover from a stuck run
        if (Date.now() - state.startedAt > 10 * 60_000) state.running = false;
        return;
    }
    const now = Date.now();
    if (state.lastFull === 0 || now - state.lastFull > 120_000 || now - state.lastLive > 6_000) {
        void runSync();
    }
}
__turbopack_async_result__();
} catch(e) { __turbopack_async_result__(e); } }, false);}),
]})(),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/runtime-reacts.external.js [external] (next/dist/server/runtime-reacts.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/server/runtime-reacts.external.js", () => require("next/dist/server/runtime-reacts.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/node:stream [external] (node:stream, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("node:stream", () => require("node:stream"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

var mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__143ltzyvi_l6n._.js.map