import type { BattingStyle, BowlingStyle, TeamRole } from "./enums";

export interface Team {
  id: string;
  name: string;
  homeGround?: string | null;
  logoUrl?: string | null;
  description?: string | null;
  captainId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamMember {
  id: string;
  role: TeamRole;
  jerseyNumber?: number | null;
  battingStyle?: BattingStyle | null;
  bowlingStyle?: BowlingStyle | null;
  playerType?: string | null;
  teamId: string;
  userId: string;
  isActive: boolean;
  joinedAt: string;
  user?: { id: string; name: string; email: string };
}

export interface Player {
  id: string;
  name: string;
  jerseyNumber?: number | null;
  userId?: string | null;
  battingRuns: number;
  battingBalls: number;
  battingFours: number;
  battingSixes: number;
  battingStrikeRate: number;
  bowlingBalls: number;
  bowlingRuns: number;
  bowlingWickets: number;
  bowlingEconomy: number;
  bowlingOvers: number;
  isOut: boolean;
  teamId: string;
}

export interface GuestPlayer {
  id: string;
  teamId: string;
  matchId?: string | null;
  name: string;
  mobile?: string | null;
  email?: string | null;
  battingStyle?: BattingStyle | null;
  bowlingStyle?: BowlingStyle | null;
  role?: string | null;
  status: "active" | "inactive";
  isConverted: boolean;
  convertedPlayerId?: string | null;
  createdAt: string;
}

export interface MyTeamRole {
  role: TeamRole | null;
  isMember: boolean;
  joinedAt?: string | null;
  permissions?: string[];
}

export interface TeamStats {
  totalMatches: number;
  wonMatches: number;
  lostMatches: number;
  winPercentage: number;
}
