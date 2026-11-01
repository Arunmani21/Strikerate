import type { Match } from "./match";

/**
 * GET /stats/player/:playerId/career
 * Postgres decimal columns arrive as strings — parseFloat before math.
 */
export interface CareerStats {
  id: string;
  totalMatches: number;
  totalInnings: number;
  totalRuns: number;
  highestScore: number;
  totalFours: number;
  totalSixes: number;
  totalFifties: number;
  totalHundreds: number;
  careerBattingAvg: string;
  careerStrikeRate: string;
  totalNotOuts: number;
  totalDucks: number;
  totalWickets: number;
  totalOversBowled: string;
  totalRunsConceded: number;
  bestBowling: string | null;
  careerEconomy: string;
  fiveWicketHauls: number;
  totalMaidens: number;
  playerId: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Shared stat columns of the player-match-performance table */
export interface PerformanceRow {
  id: string;
  runsScored: number;
  ballsFaced: number;
  fours: number;
  sixes: number;
  strikeRate: string;
  isOut: boolean;
  wicketType: string | null;
  isRetiredHurt: boolean;
  oversBowled: string;
  runsConceded: number;
  wicketsTaken: number;
  economy: string;
  maidens: number;
  wides: number;
  noBalls: number;
  matchRating: string | null;
  isPlayerOfMatch: boolean;
  playerId: string;
  matchId: string;
  teamId: string;
  createdAt: string;
}

/** Row of GET /stats/player/:playerId/matches (match relation only — no player names) */
export interface PlayerMatchRow extends PerformanceRow {
  match: Match;
}

/** Row of GET /stats/match/:matchId/performances (player + team relations included) */
export interface MatchPerformanceRow extends PerformanceRow {
  player: { id: string; name: string; jerseyNumber: number | null };
  team?: { id: string; name: string } | null;
}

export type HistoryResult = "won" | "lost" | "tied" | "abandoned";

/** Row of GET /stats/team/:teamId/history */
export interface TeamHistoryRow {
  id: string;
  result: HistoryResult;
  runsScored: number;
  wicketsLost: number;
  oversPlayed: string;
  runsConceded: number;
  wicketsTaken: number;
  matchDate: string;
  teamId: string;
  matchId: string;
  opponentId: string;
  match: Match;
  opponent: { id: string; name: string };
}
