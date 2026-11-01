export type MatchStatus =
  | "scheduled"
  | "postponed"
  | "cancelled"
  | "toss_done"
  | "live"
  | "innings_break"
  | "rain_delayed"
  | "bad_light_delayed"
  | "umpire_decision_pending"
  | "completed"
  | "tied"
  | "draw"
  | "abandoned"
  | "no_result";

export type TeamRole = "captain" | "vice_captain" | "scorer" | "player";

export type ScorerRole =
  | "primary_scorer"
  | "secondary_scorer"
  | "temporary_scorer"
  | "viewer";

export type TransferStatus =
  | "pending"
  | "accepted"
  | "rejected"
  | "revoked"
  | "completed";

export type RetirementReason = "injury" | "illness" | "emergency" | "other";

export type DismissalType =
  | "bowled"
  | "caught"
  | "lbw"
  | "runout"
  | "stumped"
  | "caught_and_bowled"
  | "hit_wicket"
  | "retired_hurt";

export type BattingStyle = "right_hand" | "left_hand";
export type BowlingStyle =
  | "right_arm_fast"
  | "right_arm_spin"
  | "left_arm_fast"
  | "left_arm_spin";
export type ProfileRole = "batsman" | "bowler" | "allrounder" | "keeper";

export type TossChoice = "bat" | "bowl";

export type VictoryType = "runs" | "wickets" | "innings" | "forfeit";

export type AbandonReason =
  | "rain"
  | "bad_light"
  | "pitch_conditions"
  | "crowd_trouble"
  | "security"
  | "other";

/** Server only models rain and bad-light delays — other types have no status to map to */
export type DelayType = "rain" | "bad_light";

export type RetireHurtReason = "injury" | "illness" | "emergency" | "other";

export type LineupStrength =
  | "full-strength"
  | "weakened"
  | "experimental"
  | "mixed";
