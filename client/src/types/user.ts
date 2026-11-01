import type { BattingStyle, BowlingStyle, ProfileRole } from "./enums";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  profile?: UserProfile | null;
}

export interface UserProfile {
  id: string;
  role?: ProfileRole | null;
  battingStyle?: BattingStyle | null;
  bowlingStyle?: BowlingStyle | null;
  experienceYears?: number | null;
  bio?: string | null;
}
