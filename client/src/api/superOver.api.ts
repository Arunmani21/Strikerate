import { http } from "../lib/api";
import type {
  StartSuperOverInput,
  SuperOver,
  SuperOverBallInput,
} from "../types/superOver";

export const superOverApi = {
  create: (matchId: string, body: StartSuperOverInput) =>
    http.post<{ superOver: SuperOver; message: string }>(
      `/matches/${matchId}/super-overs`,
      body,
    ),

  list: (matchId: string) =>
    http.get<SuperOver[]>(`/matches/${matchId}/super-overs`),

  get: (matchId: string, superOverId: string) =>
    http.get<SuperOver>(`/matches/${matchId}/super-overs/${superOverId}`),

  begin: (matchId: string, superOverId: string) =>
    http.post<{ superOver: SuperOver; message: string }>(
      `/matches/${matchId}/super-overs/${superOverId}/begin`,
      {},
    ),

  ball: (matchId: string, input: SuperOverBallInput) =>
    http.post<{ superOver: SuperOver; message: string }>(
      `/matches/${matchId}/super-overs/${input.superOverId}/ball`,
      input,
    ),

  complete: (
    matchId: string,
    superOverId: string,
    body: { winningTeamId: string; margin: string },
  ) =>
    http.post<{ superOver: SuperOver; message: string }>(
      `/matches/${matchId}/super-overs/${superOverId}/complete`,
      body,
    ),

  abandon: (matchId: string, superOverId: string, reason: string, details?: string) =>
    http.post<{ superOver: SuperOver; message: string }>(
      `/matches/${matchId}/super-overs/${superOverId}/abandon`,
      { reason, details },
    ),
};
