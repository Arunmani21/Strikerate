export const qk = {
  me: ["auth", "me"] as const,

  myTeams: ["teams", "mine"] as const,
  team: (id: string) => ["team", id] as const,
  teamMembers: (id: string) => ["team", id, "members"] as const,
  teamPlayers: (id: string) => ["team", id, "players"] as const,
  teamGuests: (id: string) => ["team", id, "guest-players"] as const,
  teamMyRole: (id: string) => ["team", id, "my-role"] as const,
  teamStats: (id: string) => ["team", id, "stats"] as const,
  teamHistory: (id: string) => ["team", id, "history"] as const,

  matchesByStatus: (status: string) => ["matches", "status", status] as const,
  match: (id: string) => ["match", id] as const,
  playing11: (matchId: string, teamId: string) =>
    ["playing11", matchId, teamId] as const,
  matchRequests: (teamId: string) => ["match-requests", "team", teamId] as const,

  inningsByMatch: (matchId: string) => ["innings", "match", matchId] as const,
  innings: (id: string) => ["innings", id] as const,
  scorecard: (matchId: string) => ["scorecard", matchId] as const,
  overSummary: (inningsId: string) => ["over-summary", inningsId] as const,
  live: (matchId: string) => ["live", matchId] as const,
  canScore: (matchId: string) => ["can-score", matchId] as const,
  scorers: (matchId: string) => ["scorers", matchId] as const,
  transferHistory: (matchId: string) => ["transfer-history", matchId] as const,
  pendingTransfers: ["pending-transfers"] as const,

  playerCareer: (playerId: string) => ["stats", "player", playerId, "career"] as const,
  playerMatches: (playerId: string) =>
    ["stats", "player", playerId, "matches"] as const,
  matchPerformances: (matchId: string) => ["stats", "match", matchId] as const,

  superOvers: (matchId: string) => ["super-overs", matchId] as const,
};
