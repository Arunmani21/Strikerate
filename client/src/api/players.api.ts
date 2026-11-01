import { http } from "../lib/api";
import type { Player } from "../types/team";

export const playersApi = {
  create: (teamId: string, body: { name: string; jerseyNumber?: number; userId?: string }) =>
    http.post<Player>(`/team/${teamId}/player`, body),

  remove: (teamId: string, playerId: string) =>
    http.delete<unknown>(`/team/${teamId}/player/${playerId}`),

  list: (teamId: string) => http.get<Player[]>(`/team/${teamId}/player`),

  available: (teamId: string, date: string) =>
    http.get<Player[]>(`/team/${teamId}/player/available`, { params: { date } }),
};
