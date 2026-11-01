import { useQuery } from "@tanstack/react-query";

import { scoringApi } from "../api/scoring.api";
import { qk } from "../lib/queryKeys";

/** {canScore, message} for the logged-in user on this match (captains/VCs + granted scorers) */
export function useCanScore(matchId: string) {
  return useQuery({
    queryKey: qk.canScore(matchId),
    queryFn: () => scoringApi.canScore(matchId),
    enabled: Boolean(matchId),
  });
}
