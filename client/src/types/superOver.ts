import type { Match } from "./match";
import type { TossChoice } from "./enums";

export type SuperOverStatus =
  | "scheduled"
  | "in_progress"
  | "completed"
  | "abandoned";

export type SuperOverType = "standard" | "tie_breaker";

/**
 * Super over aggregate — the server stores no per-ball rows, only these
 * counters. currentOver 0 = first team's innings, 1 = second's.
 */
export interface SuperOver {
  id: string;
  matchId: string;
  teamAId: string;
  teamBId: string;
  type: SuperOverType;
  status: SuperOverStatus;
  teamABattingFirst: boolean;
  tossWinnerTeamId: string | null;
  tossChoice: TossChoice | null;
  currentOver: number;
  currentBall: number;
  teamARuns: number;
  teamAWickets: number;
  teamBRuns: number;
  teamBWickets: number;
  targetRuns: number | null;
  wonByTeamId: string | null;
  margin: string | null;
  completedAt: string | null;
  superOverNumber: number;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string | null;
  statusChangedAt: string | null;
  teamA?: { id: string; name: string };
  teamB?: { id: string; name: string };
  match?: Match;
}

export interface StartSuperOverInput {
  type: SuperOverType;
  tossWinnerTeamId: string;
  tossChoice?: TossChoice;
}

/** DTO requires these three even though the server derives everything else */
export interface SuperOverBallInput {
  superOverId: string;
  batsmanId: string;
  bowlerId: string;
  runs: number;
  isWide?: boolean;
  isNoBall?: boolean;
  isWicket?: boolean;
  wicketType?: string;
}
