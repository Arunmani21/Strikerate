export declare enum TeamRole {
    CAPTAIN = "captain",
    VICE_CAPTAIN = "vice_captain",
    SCORER = "scorer",
    PLAYER = "player"
}
export declare enum TeamPermission {
    UPDATE_TEAM_DETAILS = "update_team_details",
    ADD_MEMBERS = "add_members",
    REMOVE_MEMBERS = "remove_members",
    UPDATE_MEMBER_ROLES = "update_member_roles",
    TRANSFER_CAPTAINCY = "transfer_captaincy",
    SET_TEAM_AVAILABILITY = "set_team_availability",
    MANAGE_LINEUP = "manage_lineup",
    ACCEPT_MATCH_REQUESTS = "accept_match_requests",
    SEND_MATCH_REQUESTS = "send_match_requests",
    UPDATE_LIVE_SCORES = "update_live_scores",
    UPDATE_LIVE_WICKETS = "update_live_wickets",
    VIEW_MATCH_STATS = "view_match_stats",
    UPDATE_OWN_AVAILABILITY = "update_own_availability",
    VIEW_TEAM_STATS = "view_team_stats"
}
export declare const ROLE_PERMISSIONS: Record<TeamRole, TeamPermission[]>;
export declare const ROLE_HIERARCHY: Record<TeamRole, number>;
export declare function hasPermission(role: TeamRole, permission: TeamPermission): boolean;
export declare function canManageRole(managerRole: TeamRole, targetRole: TeamRole): boolean;
export declare function canPerformTeamAction(userRole: TeamRole, userTeamId: string, targetTeamId: string, requiredPermission: TeamPermission): boolean;
