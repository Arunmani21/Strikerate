import { http } from "../lib/api";
import type {
  AbandonReason,
  DelayType,
  MatchStatus,
  TossChoice,
  VictoryType,
} from "../types/enums";
import type { Match } from "../types/match";

export interface StatusActionResult {
  match: Match;
  message: string;
  canPlaySuperOver?: boolean;
}

export const matchesApi = {
  byStatus: (status: MatchStatus) => http.get<Match[]>(`/matches/status/${status}`),

  get: (id: string) => http.get<Match>(`/matches/${id}`),

  recordToss: (matchId: string, body: { tossWinnerId: string; tossChoice: TossChoice }) =>
    http.patch<Match>(`/matches/${matchId}/toss`, body),

  /* ---- manual status actions (captain / vice-captain on the server) ---- */

  abandon: (
    matchId: string,
    body: { reason: AbandonReason; details?: string; weatherConditions?: string },
  ) => http.post<StatusActionResult>(`/matches/${matchId}/abandon`, body),

  complete: (
    matchId: string,
    body: {
      winningTeamId: string;
      victoryType: VictoryType;
      margin: number;
      resultDescription?: string;
    },
  ) => http.post<StatusActionResult>(`/matches/${matchId}/complete`, body),

  declareTie: (matchId: string, description?: string) =>
    http.post<StatusActionResult>(
      `/matches/${matchId}/tie`,
      description ? { description } : {},
    ),

  declareDraw: (matchId: string, body: { description?: string; reason?: string }) =>
    http.post<StatusActionResult>(`/matches/${matchId}/draw`, body),

  delay: (
    matchId: string,
    body: { delayType: DelayType; estimatedDuration: number; description?: string },
  ) => http.post<StatusActionResult>(`/matches/${matchId}/delay`, body),

  resume: (matchId: string, body: { description?: string; timeLost?: number }) =>
    http.post<StatusActionResult>(`/matches/${matchId}/resume`, body),

  postpone: (
    matchId: string,
    body: { reason: string; rescheduledDate: string; rescheduledTime: string },
  ) => http.post<StatusActionResult>(`/matches/${matchId}/postpone`, body),

  cancel: (matchId: string, reason?: string) =>
    http.post<StatusActionResult>(
      `/matches/${matchId}/cancel`,
      reason ? { reason } : {},
    ),
};
