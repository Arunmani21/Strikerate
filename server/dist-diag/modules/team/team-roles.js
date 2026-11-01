"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_HIERARCHY = exports.ROLE_PERMISSIONS = exports.TeamPermission = exports.TeamRole = void 0;
exports.hasPermission = hasPermission;
exports.canManageRole = canManageRole;
exports.canPerformTeamAction = canPerformTeamAction;
var TeamRole;
(function (TeamRole) {
    TeamRole["CAPTAIN"] = "captain";
    TeamRole["VICE_CAPTAIN"] = "vice_captain";
    TeamRole["SCORER"] = "scorer";
    TeamRole["PLAYER"] = "player";
})(TeamRole || (exports.TeamRole = TeamRole = {}));
var TeamPermission;
(function (TeamPermission) {
    TeamPermission["UPDATE_TEAM_DETAILS"] = "update_team_details";
    TeamPermission["ADD_MEMBERS"] = "add_members";
    TeamPermission["REMOVE_MEMBERS"] = "remove_members";
    TeamPermission["UPDATE_MEMBER_ROLES"] = "update_member_roles";
    TeamPermission["TRANSFER_CAPTAINCY"] = "transfer_captaincy";
    TeamPermission["SET_TEAM_AVAILABILITY"] = "set_team_availability";
    TeamPermission["MANAGE_LINEUP"] = "manage_lineup";
    TeamPermission["ACCEPT_MATCH_REQUESTS"] = "accept_match_requests";
    TeamPermission["SEND_MATCH_REQUESTS"] = "send_match_requests";
    TeamPermission["UPDATE_LIVE_SCORES"] = "update_live_scores";
    TeamPermission["UPDATE_LIVE_WICKETS"] = "update_live_wickets";
    TeamPermission["VIEW_MATCH_STATS"] = "view_match_stats";
    TeamPermission["UPDATE_OWN_AVAILABILITY"] = "update_own_availability";
    TeamPermission["VIEW_TEAM_STATS"] = "view_team_stats";
})(TeamPermission || (exports.TeamPermission = TeamPermission = {}));
exports.ROLE_PERMISSIONS = {
    [TeamRole.CAPTAIN]: [
        TeamPermission.UPDATE_TEAM_DETAILS,
        TeamPermission.ADD_MEMBERS,
        TeamPermission.REMOVE_MEMBERS,
        TeamPermission.UPDATE_MEMBER_ROLES,
        TeamPermission.TRANSFER_CAPTAINCY,
        TeamPermission.SET_TEAM_AVAILABILITY,
        TeamPermission.MANAGE_LINEUP,
        TeamPermission.ACCEPT_MATCH_REQUESTS,
        TeamPermission.SEND_MATCH_REQUESTS,
        TeamPermission.UPDATE_LIVE_SCORES,
        TeamPermission.UPDATE_LIVE_WICKETS,
        TeamPermission.VIEW_MATCH_STATS,
        TeamPermission.VIEW_TEAM_STATS,
        TeamPermission.UPDATE_OWN_AVAILABILITY,
    ],
    [TeamRole.VICE_CAPTAIN]: [
        TeamPermission.ADD_MEMBERS,
        TeamPermission.REMOVE_MEMBERS,
        TeamPermission.SET_TEAM_AVAILABILITY,
        TeamPermission.MANAGE_LINEUP,
        TeamPermission.UPDATE_LIVE_SCORES,
        TeamPermission.UPDATE_LIVE_WICKETS,
        TeamPermission.VIEW_MATCH_STATS,
        TeamPermission.VIEW_TEAM_STATS,
        TeamPermission.UPDATE_OWN_AVAILABILITY,
    ],
    [TeamRole.SCORER]: [
        TeamPermission.UPDATE_LIVE_SCORES,
        TeamPermission.UPDATE_LIVE_WICKETS,
        TeamPermission.VIEW_MATCH_STATS,
        TeamPermission.VIEW_TEAM_STATS,
        TeamPermission.UPDATE_OWN_AVAILABILITY,
    ],
    [TeamRole.PLAYER]: [
        TeamPermission.VIEW_TEAM_STATS,
        TeamPermission.VIEW_MATCH_STATS,
        TeamPermission.UPDATE_OWN_AVAILABILITY,
    ],
};
exports.ROLE_HIERARCHY = {
    [TeamRole.CAPTAIN]: 4,
    [TeamRole.VICE_CAPTAIN]: 3,
    [TeamRole.SCORER]: 2,
    [TeamRole.PLAYER]: 1,
};
function hasPermission(role, permission) {
    return exports.ROLE_PERMISSIONS[role]?.includes(permission) || false;
}
function canManageRole(managerRole, targetRole) {
    return exports.ROLE_HIERARCHY[managerRole] >= exports.ROLE_HIERARCHY[targetRole];
}
function canPerformTeamAction(userRole, userTeamId, targetTeamId, requiredPermission) {
    if (userTeamId !== targetTeamId) {
        return false;
    }
    return hasPermission(userRole, requiredPermission);
}
//# sourceMappingURL=team-roles.js.map