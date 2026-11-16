/**
 * Кластеры кошельков: поиск кошельков, которые регулярно ставят на одни и те же
 * матчи одной стороной — сильный признак того, что за ними стоит один игрок
 * (дробление банка по нескольким аккаунтам).
 *
 * Алгоритм:
 *  1. Для каждого матча берём покупки (BUY) по каждому кошельку и его «сторону».
 *  2. Считаем парную статистику: сколько матчей пара ставила вместе и как часто
 *     на одну сторону.
 *  3. Пары с ≥3 совместными матчами и ≥70% согласия объединяем (union-find).
 *  4. Связные группы из 2+ кошельков — кластеры.
 */

export type ClusterMember = {
  address: string;
  name: string;
  matches: number;
  wins: number;
  staked: number;
  profit: number;
  winRate: number;
  tag: string;
};

export type Cluster = {
  members: ClusterMember[];
  together: number; // матчей, где ставили ≥2 участников
  sameSide: number; // из них на одну и ту же сторону
  sameSideRate: number;
  combined: { matches: number; wins: number; staked: number; profit: number; winRate: number; roi: number };
};

export type WalletStatRow = {
  address: string;
  name: string;
  matches: number;
  wins: number;
  staked: number;
  profit: number;
  tag: string;
};

export type CoRow = { matchSlug: string; wallet: string; outcomeIdx: number; usd: number };

class UnionFind {
  private parent = new Map<string, string>();

  find(x: string): string {
    let root = x;
    while ((this.parent.get(root) ?? root) !== root) root = this.parent.get(root)!;
    // сжание пути
    let cur = x;
    while ((this.parent.get(cur) ?? cur) !== cur) {
      const next = this.parent.get(cur)!;
      this.parent.set(cur, root);
      cur = next;
    }
    this.parent.set(x, root);
    return root;
  }

  union(a: string, b: string) {
    this.parent.set(this.find(a), this.find(b));
  }

  keys(): IterableIterator<string> {
    return this.parent.keys();
  }
}

export function computeClusters(
  rows: CoRow[],
  stats: WalletStatRow[],
  opts: { minTogether?: number; minRate?: number; minUsd?: number } = {},
): Cluster[] {
  const minTogether = opts.minTogether ?? 3;
  const minRate = opts.minRate ?? 0.7;
  const minUsd = opts.minUsd ?? 20;

  // матч -> кошелёк -> [usd на сторону 0, usd на сторону 1]
  const perMatch = new Map<string, Map<string, [number, number]>>();
  for (const r of rows) {
    const per = perMatch.get(r.matchSlug) ?? new Map<string, [number, number]>();
    const u = per.get(r.wallet) ?? [0, 0];
    u[r.outcomeIdx === 0 ? 0 : 1] += r.usd;
    per.set(r.wallet, u);
    perMatch.set(r.matchSlug, per);
  }

  // парная статистика
  const pairs = new Map<string, { a: string; b: string; together: number; same: number }>();
  for (const per of perMatch.values()) {
    const ws = [...per.entries()]
      .filter(([, u]) => u[0] + u[1] >= minUsd)
      .map(([w, u]) => [w, u[0] >= u[1] ? 0 : 1] as const);
    for (let i = 0; i < ws.length; i++) {
      for (let j = i + 1; j < ws.length; j++) {
        const [wa, sa] = ws[i];
        const [wb, sb] = ws[j];
        const [a, b] = wa < wb ? [wa, wb] : [wb, wa];
        const key = `${a}|${b}`;
        const p = pairs.get(key) ?? { a, b, together: 0, same: 0 };
        p.together += 1;
        if (sa === sb) p.same += 1;
        pairs.set(key, p);
      }
    }
  }

  // объединяем устойчивые пары
  const uf = new UnionFind();
  for (const p of pairs.values()) {
    if (p.together >= minTogether && p.same / p.together >= minRate) uf.union(p.a, p.b);
  }

  const byRoot = new Map<string, Set<string>>();
  for (const w of uf.keys()) {
    const root = uf.find(w);
    const set = byRoot.get(root) ?? new Set<string>();
    set.add(w);
    byRoot.set(root, set);
  }

  const smap = new Map(stats.map((s) => [s.address, s]));
  const clusters: Cluster[] = [];
  for (const members of byRoot.values()) {
    if (members.size < 2) continue;

    let together = 0;
    let same = 0;
    for (const per of perMatch.values()) {
      const sides = [...per.entries()]
        .filter(([w, u]) => members.has(w) && u[0] + u[1] >= minUsd)
        .map(([, u]) => (u[0] >= u[1] ? 0 : 1));
      if (sides.length < 2) continue;
      together += 1;
      if (sides.every((s) => s === sides[0])) same += 1;
    }

    const mem: ClusterMember[] = [...members]
      .map((address) => {
        const s = smap.get(address);
        return {
          address,
          name: s?.name ?? "",
          matches: s?.matches ?? 0,
          wins: s?.wins ?? 0,
          staked: s?.staked ?? 0,
          profit: s?.profit ?? 0,
          winRate: s?.matches ? s.wins / s.matches : 0,
          tag: s?.tag ?? "",
        };
      })
      .sort((x, y) => y.profit - x.profit);

    const matches = mem.reduce((s, m) => s + m.matches, 0);
    const wins = mem.reduce((s, m) => s + m.wins, 0);
    const staked = mem.reduce((s, m) => s + m.staked, 0);
    const profit = mem.reduce((s, m) => s + m.profit, 0);
    clusters.push({
      members: mem,
      together,
      sameSide: same,
      sameSideRate: together ? same / together : 0,
      combined: { matches, wins, staked, profit, winRate: matches ? wins / matches : 0, roi: staked ? profit / staked : 0 },
    });
  }
  return clusters.sort((a, b) => b.combined.profit - a.combined.profit);
}

export type PairStat = {
  a: string;
  b: string;
  together: number; // матчей, где оба ставили
  same: number; // из них на одну сторону
  usd: number; // совокупный объём пары на этих матчах
};

/**
 * Пары кошельков (панель same / mixed / against):
 * все пары, ставившие на одни и те же матчи ≥2 раз, с совместным объёмом.
 * rel и «шанс один владелец» считаются снаружи из same/together.
 */
export function computePairs(rows: CoRow[], opts: { minUsd?: number } = {}): PairStat[] {
  const minUsd = opts.minUsd ?? 20;

  const perMatch = new Map<string, Map<string, [number, number]>>();
  for (const r of rows) {
    const per = perMatch.get(r.matchSlug) ?? new Map<string, [number, number]>();
    const u = per.get(r.wallet) ?? [0, 0];
    u[r.outcomeIdx === 0 ? 0 : 1] += r.usd;
    per.set(r.wallet, u);
    perMatch.set(r.matchSlug, per);
  }

  const pairs = new Map<string, PairStat>();
  for (const per of perMatch.values()) {
    const ws = [...per.entries()].filter(([, u]) => u[0] + u[1] >= minUsd);
    for (let i = 0; i < ws.length; i++) {
      for (let j = i + 1; j < ws.length; j++) {
        const [wa, ua] = ws[i];
        const [wb, ub] = ws[j];
        const [a, b] = wa < wb ? [wa, wb] : [wb, wa];
        const key = `${a}|${b}`;
        const p = pairs.get(key) ?? { a, b, together: 0, same: 0, usd: 0 };
        p.together += 1;
        const sa = ua[0] >= ua[1] ? 0 : 1;
        const sb = ub[0] >= ub[1] ? 0 : 1;
        if (sa === sb) p.same += 1;
        p.usd += ua[0] + ua[1] + ub[0] + ub[1];
        pairs.set(key, p);
      }
    }
  }
  return [...pairs.values()].filter((p) => p.together >= 2).sort((x, y) => y.usd - x.usd);
}
