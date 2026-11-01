import { http } from "../lib/api";
import type { Innings } from "../types/innings";

export interface StartInningsInput {
  battingTeamId: string;
  bowlingTeamId: string;
  inningsNumber: number;
}

export const inningsApi = {
  start: (matchId: string, body: StartInningsInput) =>
    http.post<Innings>(`/innings/match/${matchId}/start`, body),

  setBatsmen: (inningsId: string, strikerId: string, nonStrikerId: string) =>
    http.patch<Innings>(`/innings/${inningsId}/set-batsmen`, { strikerId, nonStrikerId }),

  setBowler: (inningsId: string, bowlerId: string) =>
    http.patch<Innings>(`/innings/${inningsId}/set-bowler`, { bowlerId }),

  byMatch: (matchId: string) => http.get<Innings[]>(`/innings/match/${matchId}`),

  get: (id: string) => http.get<Innings>(`/innings/${id}`),
};
