import { http } from "../lib/api";
import type { TeamRole, BattingStyle, BowlingStyle } from "../types/enums";
import type { MyTeamRole, Team, TeamMember, TeamStats } from "../types/team";

export interface AddMemberInput {
  userId: string;
  role: TeamRole;
  jerseyNumber?: number;
  battingStyle?: BattingStyle;
  bowlingStyle?: BowlingStyle;
  playerType?: string;
}

export const teamsApi = {
  create: (name: string) => http.post<Team>("/team", { name }),

  myTeams: () => http.get<Team[]>("/team/my-teams"),

  get: (id: string) => http.get<Team>(`/team/${id}`),

  transferCaptaincy: (teamId: string, userId: string) =>
    http.patch<unknown>(`/team/${teamId}/transfer-captaincy`, { userId }),

  assignViceCaptain: (teamId: string, userId: string) =>
    http.patch<unknown>(`/team/${teamId}/assign-vice-captain`, { userId }),

  updateDetails: (
    teamId: string,
    body: {
      name?: string;
      homeGround?: string;
      description?: string;
      logoUrl?: string;
    },
  ) => http.put<Team>(`/teams/${teamId}/details`, body),

  addMember: (teamId: string, body: AddMemberInput) =>
    http.post<TeamMember>(`/teams/${teamId}/members`, body),

  removeMember: (teamId: string, userId: string) =>
    http.delete<unknown>(`/teams/${teamId}/members`, { userId }),

  updateMemberRole: (teamId: string, userId: string, role: TeamRole) =>
    http.put<unknown>(`/teams/${teamId}/members/${userId}/role`, { role }),

  members: (teamId: string) => http.get<TeamMember[]>(`/teams/${teamId}/members`),

  stats: (teamId: string) => http.get<TeamStats>(`/teams/${teamId}/stats`),

  myRole: (teamId: string) => http.get<MyTeamRole>(`/teams/${teamId}/my-role`),
};
