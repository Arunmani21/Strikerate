import { http, isApiError } from "../lib/api";
import type { Playing11Entry, SetPlaying11Result } from "../types/match";

export const playing11Api = {
  /** 404 when the XI hasn't been picked yet — surfaces as an empty list */
  get: async (matchId: string, teamId: string): Promise<Playing11Entry[]> => {
    try {
      return await http.get<Playing11Entry[]>(`/matches/${matchId}/playing11/${teamId}`);
    } catch (e) {
      if (isApiError(e) && e.status === 404) return [];
      throw e;
    }
  },

  set: (
    matchId: string,
    teamId: string,
    body: { playerIds: string[]; guestPlayerIds?: string[] },
  ) => http.post<SetPlaying11Result>(`/matches/${matchId}/playing11/${teamId}`, body),
};
