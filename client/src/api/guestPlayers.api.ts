import { http } from "../lib/api";
import type { BattingStyle, BowlingStyle } from "../types/enums";
import type { GuestPlayer } from "../types/team";

export interface GuestPlayerInput {
  name: string;
  mobile?: string;
  email?: string;
  battingStyle?: BattingStyle;
  bowlingStyle?: BowlingStyle;
  role?: "batsman" | "bowler" | "allrounder" | "wicketkeeper";
}

export const guestPlayersApi = {
  create: (teamId: string, body: GuestPlayerInput, matchId?: string) =>
    http.post<GuestPlayer>(`/guest-player/team/${teamId}`, body, {
      params: matchId ? { matchId } : undefined,
    }),

  listByTeam: (teamId: string) =>
    http.get<GuestPlayer[]>(`/guest-player/team/${teamId}`),

  listByMatch: (matchId: string) =>
    http.get<GuestPlayer[]>(`/guest-player/match/${matchId}`),

  update: (id: string, body: Partial<GuestPlayerInput>) =>
    http.put<GuestPlayer>(`/guest-player/${id}`, body),

  remove: (id: string) => http.delete<unknown>(`/guest-player/${id}`),
};
