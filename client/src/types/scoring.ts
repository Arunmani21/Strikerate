import type {
  DismissalType,
  ScorerRole,
  TransferStatus,
} from "./enums";
import type { Innings } from "./innings";
import type { Match } from "./match";

/** A recorded delivery — mirrors server Ball entity */
export interface Ball {
  id: string;
  overNumber: number;
  ballNumber: number;
  runs: number;
  extraRuns: number;
  isWide: boolean;
  isNoBall: boolean;
  isBye: boolean;
  isLegBye: boolean;
  isWicket: boolean;
  wicketType: DismissalType | null;
  inningsId: string;
  matchId: string;
  batsmanId: string;
  bowlerId: string;
  dismissedPlayerId: string | null;
  commentary: string | null;
  createdAt: string;
}

export interface ScorecardInnings extends Innings {
  balls: Ball[];
}

/** GET /scoring/scorecard/:matchId — teams are ids only; aggregate tables client-side */
export interface Scorecard {
  match: Match;
  innings: ScorecardInnings[];
}

export interface OverSummaryBall {
  ballNumber: number;
  runs: number;
  isWide: boolean;
  isNoBall: boolean;
  isWicket: boolean;
}

export interface OverSummaryOver {
  overNumber: number;
  balls: OverSummaryBall[];
  totalRuns: number;
  wickets: number;
}

/** POST /scoring/ball body — extras are boolean flags; server adds +1 team run per wide/no-ball */
export interface RecordBallInput {
  inningsId: string;
  batsmanId: string;
  bowlerId: string;
  runs: number;
  extraRuns?: number;
  isWide?: boolean;
  isNoBall?: boolean;
  isBye?: boolean;
  isLegBye?: boolean;
  isWicket?: boolean;
  wicketType?: DismissalType;
  dismissedPlayerId?: string;
  commentary?: string;
}

export interface RecordBallResult {
  ball: Ball;
  innings: Innings;
  matchCompleted: boolean;
  inningsCompleted: boolean;
  overCompleted: boolean;
  wicket?: { type: DismissalType; batsman: string; bowler: string };
}

export interface ScorerPermission {
  id: string;
  matchId: string;
  userId: string;
  role: ScorerRole;
  isActive: boolean;
  canScore: boolean;
  transferredFrom: string | null;
  transferredTo: string | null;
  transferStatus: TransferStatus;
  transferredAt: string | null;
  acceptedAt: string | null;
  revokedAt: string | null;
  transferReason: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string | null;
  user?: { id: string; name: string; email: string };
  transferredFromUser?: { id: string; name: string } | null;
  transferredToUser?: { id: string; name: string } | null;
  match?: Match;
}

export interface TransferHistory {
  totalTransfers: number;
  pendingTransfers: number;
  completedTransfers: number;
  rejectedTransfers: number;
  transfers: ScorerPermission[];
}

/** Row of the player-match performance table (retire-hurt subset) */
export interface PlayerPerformance {
  id: string;
  playerId: string;
  matchId: string;
  isRetiredHurt: boolean;
  retiredHurtAt: string | null;
  retiredHurtBallNumber: number;
  returnedFromRetirement: boolean;
  returnedAtBall: number;
  isOut: boolean;
}

/* ---------- Socket event payloads (server wraps every event as {success, data, timestamp}) ---------- */

export interface SocketEventEnvelope<T> {
  success: true;
  data: T;
  timestamp: string;
}

export interface SocketBatterState {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours?: number;
  sixes?: number;
  strikeRate?: number;
}

/** ball-updated — striker/nonStriker stats can lag the ids; hydrate names from the scorecard */
export interface BallUpdatedData {
  overNumber: number;
  ballNumber: number;
  totalRuns: number;
  totalWickets: number;
  currentOvers: number;
  currentRunRate: number;
  requiredRunRate?: number;
  target?: number;
  striker: SocketBatterState;
  nonStriker: SocketBatterState;
  bowler: {
    id: string;
    name: string;
    overs: number;
    runs: number;
    wickets: number;
    economy: number;
  };
  extras: number;
  lastBall: string;
}

export interface WicketFellData {
  dismissedPlayer: SocketBatterState;
  wicketType: DismissalType;
  wicketNumber: number;
  totalWickets: number;
  totalRuns: number;
  currentOvers: number;
}

export interface OverCompleteData {
  overNumber: number;
  overRuns: number;
  totalRuns: number;
  totalWickets: number;
  currentOvers: number;
  currentRunRate: number;
  requiredRunRate?: number;
  target?: number;
  bowlerSummary: {
    bowlerName: string;
    overs: number;
    runs: number;
    wickets: number;
    maidens: number;
    economy: number;
  };
}

export interface InningsEndData {
  inningsNumber: number;
  totalRuns: number;
  totalWickets: number;
  totalOvers: number;
  target?: number;
  battingTeam: { id: string; name: string };
  bowlingTeam: { id: string; name: string };
}

export interface MatchResultData {
  result: string;
  teamAScore: { teamName: string; runs: number; wickets: number; overs: number };
  teamBScore: { teamName: string; runs: number; wickets: number; overs: number };
}
