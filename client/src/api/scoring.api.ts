import { http } from "../lib/api";
import type {
  OverSummaryOver,
  PlayerPerformance,
  RecordBallInput,
  RecordBallResult,
  Scorecard,
  ScorerPermission,
  TransferHistory,
} from "../types/scoring";
import type { RetirementReason, ScorerRole } from "../types/enums";

export const scoringApi = {
  recordBall: (input: RecordBallInput) =>
    http.post<RecordBallResult>("/scoring/ball", input),

  scorecard: (matchId: string) =>
    http.get<Scorecard>(`/scoring/scorecard/${matchId}`),

  overSummary: (inningsId: string) =>
    http.get<OverSummaryOver[]>(`/scoring/over-summary/${inningsId}`),

  canScore: (matchId: string) =>
    http.get<{ canScore: boolean; message: string }>(
      `/scoring/matches/${matchId}/can-score`,
    ),

  /* ---- retire hurt ---- */

  retireHurt: (
    inningsId: string,
    body: {
      playerId: string;
      reason: RetirementReason;
      description?: string;
      expectedToReturn?: boolean;
      notes?: string;
    },
  ) => http.post<{ message: string }>(`/scoring/innings/${inningsId}/retire-hurt`, body),

  returnFromRetirement: (
    inningsId: string,
    body: { playerId: string; notes?: string },
  ) =>
    http.post<{ message: string }>(
      `/scoring/innings/${inningsId}/return-from-retirement`,
      body,
    ),

  retiredHurtPlayers: (inningsId: string) =>
    http.get<PlayerPerformance[]>(`/scoring/innings/${inningsId}/retired-hurt-players`),

  canReturn: (inningsId: string, playerId: string) =>
    http.get<{ canReturn: boolean; reason: string }>(
      `/scoring/innings/${inningsId}/can-return/${playerId}`,
    ),

  /* ---- scorer transfer ---- */

  transferScorer: (
    matchId: string,
    body: { transferToUserId: string; reason?: string; role?: ScorerRole },
  ) =>
    http.post<{ transfer: ScorerPermission; message: string }>(
      `/scoring/matches/${matchId}/transfer-scorer`,
      body,
    ),

  acceptTransfer: (transferRequestId: string, activateImmediately = true) =>
    http.post<{ permission: ScorerPermission; message: string }>(
      "/scoring/accept-scorer-transfer",
      { transferRequestId, activateImmediately },
    ),

  rejectTransfer: (transferRequestId: string, reason: string) =>
    http.post<{ message: string }>("/scoring/reject-scorer-transfer", {
      transferRequestId,
      reason,
    }),

  revokeAccess: (matchId: string, userId: string, reason?: string) =>
    http.put<{ message: string }>(`/scoring/matches/${matchId}/revoke-scorer-access`, {
      userId,
      reason,
    }),

  grantAccess: (matchId: string, userId: string, role: ScorerRole, reason?: string) =>
    http.post<{ permission: ScorerPermission; message: string }>(
      `/scoring/matches/${matchId}/grant-scorer-access`,
      { userId, role, reason },
    ),

  updateScorerRole: (matchId: string, userId: string, role: ScorerRole) =>
    http.put<{ permission: ScorerPermission; message: string }>(
      `/scoring/matches/${matchId}/update-scorer-role`,
      { userId, role },
    ),

  scorers: (matchId: string) =>
    http.get<ScorerPermission[]>(`/scoring/matches/${matchId}/scorers`),

  activeScorers: (matchId: string) =>
    http.get<ScorerPermission[]>(`/scoring/matches/${matchId}/active-scorers`),

  pendingTransfers: () => http.get<ScorerPermission[]>("/scoring/pending-transfers"),

  transferHistory: (matchId: string) =>
    http.get<TransferHistory>(`/scoring/matches/${matchId}/transfer-history`),
};
