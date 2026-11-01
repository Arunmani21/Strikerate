import type { MatchStatus, TossChoice } from "./enums";
import type { Team } from "./team";

export interface Match {
  id: string;
  totalOvers: number;
  venue: string | null;
  matchDate: string;
  matchTime: string;
  tossWinnerId: string | null;
  tossChoice: TossChoice | null;
  status: MatchStatus;
  currentInnings: number;
  target: number;
  result: string | null;
  winningTeamId: string | null;
  marginOfVictory: string | null;
  marginType: string | null;
  abandonmentReason: string | null;
  weatherConditions: string | null;
  teamAId: string;
  teamA?: Team | null;
  teamBId: string;
  teamB?: Team | null;
  createdBy: string;
  matchRequestId: string | null;
  createdAt: string;
}

/** Flattened XI entry — id is the player/guest id, not the row id */
export type Playing11Entry =
  | { id: string; name: string; isGuest: false; jerseyNumber: number | null }
  | {
      id: string;
      name: string;
      isGuest: true;
      mobile: string | null;
      battingStyle: string | null;
      bowlingStyle: string | null;
      role: string | null;
    };

export interface SetPlaying11Result {
  matchId: string;
  teamId: string;
  regularPlayers: string[];
  guestPlayers: string[];
  totalPlayers: number;
  message: string;
}

export type MatchRequestStatus = "pending" | "confirmed" | "rejected" | "cancelled";

export interface MatchRequest {
  id: string;
  matchDate: string;
  matchTime: string;
  venue: string | null;
  preferredOvers: number | null;
  status: MatchRequestStatus;
  respondedAt: string | null;
  requestingTeamId: string;
  requestingTeam?: Team | null;
  opponentTeamId: string;
  opponentTeam?: Team | null;
  requestedBy: string;
  respondedBy: string | null;
  createdAt: string;
}

export interface TeamAvailability {
  id: string;
  availableDate: string | null;
  availableFrom: string | null;
  availableUntil: string | null;
  matchId: string | null;
  userId: string | null;
  isAvailable: boolean;
  venue: string | null;
  preferredOvers: number | null;
  notes: string | null;
  isOpen: boolean;
  teamId: string;
  postedBy: string;
  createdAt: string;
  updatedAt: string;
}
