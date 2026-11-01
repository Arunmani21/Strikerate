/**
 * Team Roles and Permissions System
 *
 * Hierarchy:
 * 1. CAPTAIN - Team creator, full control, match management
 * 2. VICE_CAPTAIN - Can manage members, match availability
 * 3. SCORER - Can update scores for live matches only
 * 4. PLAYER - View only, update own availability
 */

export enum TeamRole {
  CAPTAIN = 'captain',
  VICE_CAPTAIN = 'vice_captain',
  SCORER = 'scorer',
  PLAYER = 'player',
}

export enum TeamPermission {
  // Team Management
  UPDATE_TEAM_DETAILS = 'update_team_details',
  ADD_MEMBERS = 'add_members',
  REMOVE_MEMBERS = 'remove_members',
  UPDATE_MEMBER_ROLES = 'update_member_roles',
  TRANSFER_CAPTAINCY = 'transfer_captaincy',

  // Match Management
  SET_TEAM_AVAILABILITY = 'set_team_availability',
  MANAGE_LINEUP = 'manage_lineup',
  ACCEPT_MATCH_REQUESTS = 'accept_match_requests',
  SEND_MATCH_REQUESTS = 'send_match_requests',

  // Scoring
  UPDATE_LIVE_SCORES = 'update_live_scores',
  UPDATE_LIVE_WICKETS = 'update_live_wickets',
  VIEW_MATCH_STATS = 'view_match_stats',

  // Player Actions
  UPDATE_OWN_AVAILABILITY = 'update_own_availability',
  VIEW_TEAM_STATS = 'view_team_stats',
}

/**
 * Permission Matrix
 * Each role has specific permissions
 */
export const ROLE_PERMISSIONS: Record<TeamRole, TeamPermission[]> = {
  [TeamRole.CAPTAIN]: [
    // Full team management
    TeamPermission.UPDATE_TEAM_DETAILS,
    TeamPermission.ADD_MEMBERS,
    TeamPermission.REMOVE_MEMBERS,
    TeamPermission.UPDATE_MEMBER_ROLES,
    TeamPermission.TRANSFER_CAPTAINCY,

    // Full match management
    TeamPermission.SET_TEAM_AVAILABILITY,
    TeamPermission.MANAGE_LINEUP,
    TeamPermission.ACCEPT_MATCH_REQUESTS,
    TeamPermission.SEND_MATCH_REQUESTS,

    // Scoring
    TeamPermission.UPDATE_LIVE_SCORES,
    TeamPermission.UPDATE_LIVE_WICKETS,
    TeamPermission.VIEW_MATCH_STATS,

    // Viewing
    TeamPermission.VIEW_TEAM_STATS,
    TeamPermission.UPDATE_OWN_AVAILABILITY,
  ],

  [TeamRole.VICE_CAPTAIN]: [
    // Team management (limited)
    TeamPermission.ADD_MEMBERS,
    TeamPermission.REMOVE_MEMBERS,

    // Match management
    TeamPermission.SET_TEAM_AVAILABILITY,
    TeamPermission.MANAGE_LINEUP,

    // Scoring
    TeamPermission.UPDATE_LIVE_SCORES,
    TeamPermission.UPDATE_LIVE_WICKETS,
    TeamPermission.VIEW_MATCH_STATS,

    // Viewing
    TeamPermission.VIEW_TEAM_STATS,
    TeamPermission.UPDATE_OWN_AVAILABILITY,
  ],

  [TeamRole.SCORER]: [
    // Scoring only for live matches
    TeamPermission.UPDATE_LIVE_SCORES,
    TeamPermission.UPDATE_LIVE_WICKETS,
    TeamPermission.VIEW_MATCH_STATS,

    // Viewing
    TeamPermission.VIEW_TEAM_STATS,
    TeamPermission.UPDATE_OWN_AVAILABILITY,
  ],

  [TeamRole.PLAYER]: [
    // View only
    TeamPermission.VIEW_TEAM_STATS,
    TeamPermission.VIEW_MATCH_STATS,

    // Personal availability
    TeamPermission.UPDATE_OWN_AVAILABILITY,
  ],
};

/**
 * Role hierarchy for role upgrade/downgrade
 * Higher index = higher privilege
 */
export const ROLE_HIERARCHY: Record<TeamRole, number> = {
  [TeamRole.CAPTAIN]: 4,
  [TeamRole.VICE_CAPTAIN]: 3,
  [TeamRole.SCORER]: 2,
  [TeamRole.PLAYER]: 1,
};

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: TeamRole, permission: TeamPermission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) || false;
}

/**
 * Check if a role can manage another role
 * Can only manage roles with lower or equal hierarchy level
 */
export function canManageRole(managerRole: TeamRole, targetRole: TeamRole): boolean {
  return ROLE_HIERARCHY[managerRole] >= ROLE_HIERARCHY[targetRole];
}

/**
 * Check if user can perform action on team
 */
export function canPerformTeamAction(
  userRole: TeamRole,
  userTeamId: string,
  targetTeamId: string,
  requiredPermission: TeamPermission,
): boolean {
  // User must be member of the team
  if (userTeamId !== targetTeamId) {
    return false;
  }

  return hasPermission(userRole, requiredPermission);
}
