import { http } from "../lib/api";
import type {
  CareerStats,
  MatchPerformanceRow,
  PlayerMatchRow,
  TeamHistoryRow,
} from "../types/stats";

export const statsApi = {
  calculate: (matchId: string) =>
    http.patch<{ message: string }>(`/stats/match/${matchId}/calculate`, {}),

  setPlayerOfMatch: (matchId: string, playerId: string) =>
    http.patch<{ message: string }>(
      `/stats/match/${matchId}/player-of-match/${playerId}`,
      {},
    ),

  career: (playerId: string) =>
    http.get<CareerStats>(`/stats/player/${playerId}/career`),

  playerMatches: (playerId: string) =>
    http.get<PlayerMatchRow[]>(`/stats/player/${playerId}/matches`),

  matchPerformances: (matchId: string) =>
    http.get<MatchPerformanceRow[]>(`/stats/match/${matchId}/performances`),

  teamHistory: (teamId: string) =>
    http.get<TeamHistoryRow[]>(`/stats/team/${teamId}/history`),
};
