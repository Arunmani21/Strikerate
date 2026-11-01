export interface Innings {
  id: string;
  inningsNumber: number;
  totalRuns: number;
  totalWickets: number;
  totalBalls: number;
  currentOver: number;
  isCompleted: boolean;
  matchId: string;
  battingTeamId: string;
  bowlingTeamId: string;
  strikerId: string | null;
  nonStrikerId: string | null;
  currentBowlerId: string | null;
}
