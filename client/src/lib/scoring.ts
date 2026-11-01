import type { Ball } from "../types/scoring";

/**
 * Aggregation helpers built on the scorecard's ordered balls[].
 *
 * Server credit rules these must mirror:
 * - batsman is credited ball.runs on every delivery (even wide/no-ball)
 * - balls faced counts legal deliveries only (not wide/no-ball)
 * - bowler concedes ball.runs + extraRuns + 1 per wide/no-ball
 * - bowler is credited every dismissal incl. run-outs
 * - stored overNumber is unreliable (off-by-one) → overs are reconstructed
 *   from the legal-delivery count instead
 */

export type NameMap = Record<string, string>;

export function nameLookup(entries: { id: string; name: string }[] | undefined): (id: string) => string {
  const map: NameMap = {};
  for (const e of entries ?? []) map[e.id] = e.name;
  return (id: string) => map[id] ?? "—";
}

export function isLegalBall(b: Ball): boolean {
  return !b.isWide && !b.isNoBall;
}

/** Team runs on this delivery (server adds +1 per wide/no-ball itself) */
export function ballTotal(b: Ball): number {
  return b.runs + (b.extraRuns ?? 0) + (b.isWide || b.isNoBall ? 1 : 0);
}

/** The batter dismissed by this ball (run-outs can dismiss either end) */
export function dismissedIdOf(b: Ball): string {
  return b.wicketType === "runout" && b.dismissedPlayerId ? b.dismissedPlayerId : b.batsmanId;
}

export function outIdsFromBalls(balls: Ball[]): Set<string> {
  const out = new Set<string>();
  for (const b of balls) if (b.isWicket && b.wicketType !== "retired_hurt") out.add(dismissedIdOf(b));
  return out;
}

/* ---------------- batting ---------------- */

export interface BattingRow {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  sr: string;
  dismissal: string;
  isOut: boolean;
  order: number;
}

export function aggregateBatting(balls: Ball[], nameOf: (id: string) => string): BattingRow[] {
  const rows = new Map<string, BattingRow>();
  const orderOf = new Map<string, number>();
  let seq = 0;

  const ensure = (id: string): BattingRow => {
    let row = rows.get(id);
    if (!row) {
      row = {
        id,
        name: nameOf(id),
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        sr: "0.00",
        dismissal: "not out",
        isOut: false,
        order: orderOf.get(id) ?? seq++,
      };
      orderOf.set(id, row.order);
      rows.set(id, row);
    }
    return row;
  };

  const bowlerName = new Map<string, string>();
  for (const b of balls) {
    const batter = ensure(b.batsmanId);
    batter.runs += b.runs;
    if (isLegalBall(b)) {
      batter.balls += 1;
      if (b.runs === 4) batter.fours += 1;
      if (b.runs === 6) batter.sixes += 1;
    }
    if (!bowlerName.has(b.bowlerId)) bowlerName.set(b.bowlerId, nameOf(b.bowlerId));

    if (b.isWicket && b.wicketType !== "retired_hurt") {
      const out = ensure(dismissedIdOf(b));
      out.isOut = true;
      out.dismissal = dismissalLabel(b, bowlerName.get(b.bowlerId) ?? "");
    }
  }

  return [...rows.values()]
    .map((r) => ({ ...r, sr: r.balls ? ((r.runs / r.balls) * 100).toFixed(2) : "0.00" }))
    .sort((a, b) => a.order - b.order);
}

function dismissalLabel(b: Ball, bowler: string): string {
  switch (b.wicketType) {
    case "bowled":
      return `b ${bowler}`;
    case "lbw":
      return `lbw b ${bowler}`;
    case "caught":
      return `c b ${bowler}`;
    case "caught_and_bowled":
      return `c & b ${bowler}`;
    case "stumped":
      return `st b ${bowler}`;
    case "hit_wicket":
      return `hit wicket b ${bowler}`;
    case "runout":
      return "run out";
    default:
      return "out";
  }
}

/* ---------------- bowling ---------------- */

export interface BowlingRow {
  id: string;
  name: string;
  oversText: string;
  legalBalls: number;
  runs: number;
  wickets: number;
  econ: string;
  order: number;
}

export function aggregateBowling(balls: Ball[], nameOf: (id: string) => string): BowlingRow[] {
  const rows = new Map<string, BowlingRow>();
  let seq = 0;

  for (const b of balls) {
    let row = rows.get(b.bowlerId);
    if (!row) {
      row = {
        id: b.bowlerId,
        name: nameOf(b.bowlerId),
        oversText: "0.0",
        legalBalls: 0,
        runs: 0,
        wickets: 0,
        econ: "0.00",
        order: seq++,
      };
      rows.set(b.bowlerId, row);
    }
    row.runs += ballTotal(b);
    if (isLegalBall(b)) row.legalBalls += 1;
    if (b.isWicket) row.wickets += 1;
  }

  return [...rows.values()].map((r) => ({
    ...r,
    oversText: `${Math.floor(r.legalBalls / 6)}.${r.legalBalls % 6}`,
    econ: r.legalBalls ? ((r.runs / r.legalBalls) * 6).toFixed(2) : "0.00",
  }));
}

/* ---------------- overs ---------------- */

export interface OverGroup {
  overIndex: number;
  balls: Ball[];
  runs: number;
  wickets: number;
}

export function groupOvers(balls: Ball[]): OverGroup[] {
  const sorted = [...balls].sort(
    (a, b) =>
      a.overNumber - b.overNumber ||
      a.ballNumber - b.ballNumber ||
      a.createdAt.localeCompare(b.createdAt),
  );
  const groups: OverGroup[] = [];
  let legal = 0;

  for (const b of sorted) {
    const idx = Math.floor(legal / 6);
    let g = groups.find((x) => x.overIndex === idx);
    if (!g) {
      g = { overIndex: idx, balls: [], runs: 0, wickets: 0 };
      groups.push(g);
    }
    g.balls.push(b);
    g.runs += ballTotal(b);
    if (b.isWicket) g.wickets += 1;
    if (isLegalBall(b)) legal += 1;
  }

  return groups;
}

/** Deliveries bowled in the over currently in progress */
export function currentOverBalls(balls: Ball[]): Ball[] {
  const groups = groupOvers(balls);
  if (!groups.length) return [];
  const last = groups[groups.length - 1];
  return last.balls.filter(isLegalBall).length < 6 ? last.balls : [];
}

/* ---------------- tokens ---------------- */

export type TokenTone = "dot" | "run" | "four" | "six" | "wicket" | "extra";

export function ballToken(b: Ball): { label: string; tone: TokenTone; title: string } {
  if (b.isWicket) {
    const label = "W";
    return { label, tone: "wicket", title: `Wicket — ${b.wicketType?.replaceAll("_", " ") ?? ""}` };
  }
  if (b.isWide) {
    return {
      label: b.runs > 0 ? `wd${b.runs}` : "wd",
      tone: "extra",
      title: "Wide",
    };
  }
  if (b.isNoBall) {
    return {
      label: b.runs > 0 ? `nb${b.runs}` : "nb",
      tone: "extra",
      title: "No ball",
    };
  }
  if (b.isBye) return { label: `${ballTotal(b)}b`, tone: "extra", title: "Bye" };
  if (b.isLegBye) return { label: `${ballTotal(b)}lb`, tone: "extra", title: "Leg bye" };
  if (b.runs === 0) return { label: "·", tone: "dot", title: "Dot ball" };
  if (b.runs === 4) return { label: "4", tone: "four", title: "Four" };
  if (b.runs === 6) return { label: "6", tone: "six", title: "Six" };
  return { label: String(b.runs), tone: "run", title: `${b.runs} run${b.runs > 1 ? "s" : ""}` };
}

/* ---------------- chase ---------------- */

/** "NEED 42 OFF 30" for the chasing side; null when there's no live chase */
export function chaseLine(
  target: number,
  totalRuns: number,
  totalOvers: number,
  totalBalls: number,
): string | null {
  const need = target + 1 - totalRuns;
  const ballsLeft = totalOvers * 6 - totalBalls;
  if (need <= 0 || ballsLeft <= 0) return null;
  return `NEED ${need} OFF ${ballsLeft}`;
}

export function runRate(totalRuns: number, totalBalls: number): string {
  if (!totalBalls) return "0.00";
  return ((totalRuns / totalBalls) * 6).toFixed(2);
}

/** Chase display bundle for the header — all null when there's no target in play */
export function chaseInfo(
  target: number | null,
  totalRuns: number,
  totalBalls: number,
  matchOvers: number,
): { chase: string | null; rrr: string | null; targetNote: string | null } {
  if (target == null) return { chase: null, rrr: null, targetNote: null };
  const need = target + 1 - totalRuns;
  const ballsLeft = matchOvers * 6 - totalBalls;
  return {
    chase: chaseLine(target, totalRuns, matchOvers, totalBalls),
    rrr: need > 0 && ballsLeft > 0 ? ((need / ballsLeft) * 6).toFixed(2) : null,
    targetNote: need > 0 ? `Target ${target + 1}` : null,
  };
}
