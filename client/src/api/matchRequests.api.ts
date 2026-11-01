import { http } from "../lib/api";
import type { MatchRequest } from "../types/match";

export interface CreateMatchRequestInput {
  opponentTeamId: string;
  matchDate: string;
  matchTime: string;
  venue?: string;
  preferredOvers?: number;
}

export const matchRequestsApi = {
  create: (teamId: string, body: CreateMatchRequestInput) =>
    http.post<MatchRequest>(`/team/${teamId}/match-request`, body),

  listByTeam: (teamId: string) => http.get<MatchRequest[]>(`/match-request/team/${teamId}`),

  respond: (id: string, status: "confirmed" | "rejected") =>
    http.patch<unknown>(`/match-request/${id}/respond`, { status }),
};
