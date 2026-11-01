import type {
  DismissalType,
  MatchStatus,
  TeamRole,
  BattingStyle,
  BowlingStyle,
  ProfileRole,
} from "../types/enums";
import type { SuperOverStatus } from "../types/superOver";

interface StatusMeta {
  label: string;
  tone: "accent" | "info" | "warn" | "gold" | "wicket" | "dim";
}

export const MATCH_STATUS_META: Record<MatchStatus, StatusMeta> = {
  scheduled: { label: "Scheduled", tone: "info" },
  postponed: { label: "Postponed", tone: "warn" },
  cancelled: { label: "Cancelled", tone: "dim" },
  toss_done: { label: "Toss done", tone: "info" },
  live: { label: "Live", tone: "accent" },
  innings_break: { label: "Innings break", tone: "warn" },
  rain_delayed: { label: "Rain delay", tone: "warn" },
  bad_light_delayed: { label: "Bad light", tone: "warn" },
  umpire_decision_pending: { label: "Umpire review", tone: "warn" },
  completed: { label: "Completed", tone: "dim" },
  tied: { label: "Tied", tone: "gold" },
  draw: { label: "Draw", tone: "dim" },
  abandoned: { label: "Abandoned", tone: "wicket" },
  no_result: { label: "No result", tone: "dim" },
};

export const SO_STATUS_META: Record<SuperOverStatus, StatusMeta> = {
  scheduled: { label: "Ready", tone: "info" },
  in_progress: { label: "Live", tone: "accent" },
  completed: { label: "Done", tone: "dim" },
  abandoned: { label: "Abandoned", tone: "wicket" },
};

export const TEAM_ROLE_LABELS: Record<TeamRole, string> = {
  captain: "Captain",
  vice_captain: "Vice-captain",
  scorer: "Scorer",
  player: "Player",
};

export const DISMISSAL_LABELS: Record<DismissalType, string> = {
  bowled: "Bowled",
  caught: "Caught",
  lbw: "LBW",
  runout: "Run out",
  stumped: "Stumped",
  caught_and_bowled: "Caught & bowled",
  hit_wicket: "Hit wicket",
  retired_hurt: "Retired hurt",
};

export const PROFILE_ROLE_LABELS: Record<ProfileRole, string> = {
  batsman: "Batsman",
  bowler: "Bowler",
  allrounder: "All-rounder",
  keeper: "Wicket-keeper",
};

export const BATTING_STYLE_LABELS: Record<BattingStyle, string> = {
  right_hand: "Right-hand bat",
  left_hand: "Left-hand bat",
};

export const BOWLING_STYLE_LABELS: Record<BowlingStyle, string> = {
  right_arm_fast: "Right-arm fast",
  right_arm_spin: "Right-arm spin",
  left_arm_fast: "Left-arm fast",
  left_arm_spin: "Left-arm spin",
};
