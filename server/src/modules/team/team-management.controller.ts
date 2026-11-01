import {
  Controller,
  Get,
  Put,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TeamManagementService } from './team-management.service';
import {
  UpdateTeamDetailsDto,
  UpdateMemberRoleDto,
  AddTeamMemberDto,
  RemoveTeamMemberDto,
  UpdateTeamAvailabilityDto,
  UpdatePersonalAvailabilityDto,
  SetCaptainDto,
} from './dto/team-management.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';

@ApiTags('Team Management')
@Controller('teams')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class TeamManagementController {
  constructor(
    private readonly teamManagementService: TeamManagementService,
  ) {}

  /**
   * Update team details
   * Only OWNER and ADMIN can update team details
   */
  @Put(':teamId/details')
  @ApiOperation({
    summary: 'Update team details',
    description: 'Only OWNER and ADMIN can update team details. Includes name, logo, venue, contact info.',
  })
  @ApiResponse({ status: 200, description: 'Team details updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  async updateTeamDetails(
    @Param('teamId') teamId: string,
    @Body() updateTeamDetailsDto: UpdateTeamDetailsDto,
    @Request() req,
  ) {
    return await this.teamManagementService.updateTeamDetails(
      teamId,
      updateTeamDetailsDto,
      req.user.userId,
    );
  }

  /**
   * Update team member role
   * Only OWNER and ADMIN can update member roles
   */
  @Put(':teamId/members/:userId/role')
  @ApiOperation({
    summary: 'Update team member role',
    description: 'Only CAPTAIN can update member roles. Can only assign VICE_CAPTAIN role.',
  })
  @ApiResponse({ status: 200, description: 'Member role updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Team or member not found' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  @ApiParam({ name: 'userId', description: 'User ID' })
  async updateMemberRole(
    @Param('teamId') teamId: string,
    @Param('userId') userId: string,
    @Body() updateMemberRoleDto: UpdateMemberRoleDto,
    @Request() req,
  ) {
    return await this.teamManagementService.updateMemberRole(
      teamId,
      userId,
      updateMemberRoleDto,
      req.user.userId,
    );
  }

  /**
   * Add member to team
   * Only OWNER and ADMIN can add members
   */
  @Post(':teamId/members')
  @ApiOperation({
    summary: 'Add member to team',
    description: 'Only CAPTAIN and VICE_CAPTAIN can add members. User will be added with specified role.',
  })
  @ApiResponse({ status: 201, description: 'Member added successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Team or user not found' })
  @ApiResponse({ status: 400, description: 'User already a member' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  async addTeamMember(
    @Param('teamId') teamId: string,
    @Body() addTeamMemberDto: AddTeamMemberDto,
    @Request() req,
  ) {
    return await this.teamManagementService.addTeamMember(
      teamId,
      addTeamMemberDto,
      req.user.userId,
    );
  }

  /**
   * Remove member from team
   * Only OWNER and ADMIN can remove members
   */
  @Delete(':teamId/members')
  @ApiOperation({
    summary: 'Remove member from team',
    description: 'Only CAPTAIN and VICE_CAPTAIN can remove members. Cannot remove CAPTAIN if they are the only captain.',
  })
  @ApiResponse({ status: 200, description: 'Member removed successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Team or member not found' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  async removeTeamMember(
    @Param('teamId') teamId: string,
    @Body() removeTeamMemberDto: RemoveTeamMemberDto,
    @Request() req,
  ) {
    return await this.teamManagementService.removeTeamMember(
      teamId,
      removeTeamMemberDto,
      req.user.userId,
    );
  }

  /**
   * Set captain and vice-captain
   * Only CAPTAIN can set captain/vice-captain
   */
  @Post(':teamId/captain')
  @ApiOperation({
    summary: 'Set captain and vice-captain',
    description: 'Only CAPTAIN can set captain and vice-captain. Previous captain/vice-captain will be demoted to PLAYER.',
  })
  @ApiResponse({ status: 200, description: 'Captain set successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Team or user not found' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  async setCaptain(
    @Param('teamId') teamId: string,
    @Body() setCaptainDto: SetCaptainDto,
    @Request() req,
  ) {
    return await this.teamManagementService.setCaptain(
      teamId,
      setCaptainDto,
      req.user.userId,
    );
  }

  /**
   * Update team availability for a match
   * CAPTAIN and VICE_CAPTAIN can set team availability
   */
  @Put(':teamId/availability')
  @ApiOperation({
    summary: 'Update team availability for a match',
    description: 'CAPTAIN and VICE_CAPTAIN can set team availability for upcoming matches.',
  })
  @ApiResponse({ status: 200, description: 'Team availability updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Team or match not found' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  async updateTeamAvailability(
    @Param('teamId') teamId: string,
    @Body() updateTeamAvailabilityDto: UpdateTeamAvailabilityDto,
    @Request() req,
  ) {
    return await this.teamManagementService.updateTeamAvailability(
      teamId,
      updateTeamAvailabilityDto,
      req.user.userId,
    );
  }

  /**
   * Update personal availability for a match
   * All members can update their own availability
   */
  @Put(':teamId/personal-availability')
  @ApiOperation({
    summary: 'Update personal availability for a match',
    description: 'All members can update their own availability for upcoming matches.',
  })
  @ApiResponse({ status: 200, description: 'Personal availability updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - not a team member' })
  @ApiResponse({ status: 404, description: 'Team or match not found' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  async updatePersonalAvailability(
    @Param('teamId') teamId: string,
    @Body() updatePersonalAvailabilityDto: UpdatePersonalAvailabilityDto,
    @Request() req,
  ) {
    return await this.teamManagementService.updatePersonalAvailability(
      teamId,
      updatePersonalAvailabilityDto,
      req.user.userId,
    );
  }

  /**
   * Get team members with their roles
   */
  @Get(':teamId/members')
  @ApiOperation({
    summary: 'Get team members with their roles',
    description: 'Returns all active team members with their roles and details.',
  })
  @ApiResponse({ status: 200, description: 'Team members retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  async getTeamMembers(@Param('teamId') teamId: string) {
    return await this.teamManagementService.getTeamMembers(teamId);
  }

  /**
   * Get team statistics
   */
  @Get(':teamId/stats')
  @ApiOperation({
    summary: 'Get team statistics',
    description: 'Returns team statistics including total matches, wins, losses, and win percentage.',
  })
  @ApiResponse({ status: 200, description: 'Team statistics retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Team not found' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  async getTeamStats(@Param('teamId') teamId: string) {
    return await this.teamManagementService.getTeamStats(teamId);
  }

  /**
   * Get user's role in a team
   */
  @Get(':teamId/my-role')
  @ApiOperation({
    summary: 'Get user\'s role in a team',
    description: 'Returns the current user\'s role and permissions in the specified team.',
  })
  @ApiResponse({ status: 200, description: 'User role retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Team not found or user not a member' })
  @ApiParam({ name: 'teamId', description: 'Team ID' })
  async getMyRole(@Param('teamId') teamId: string, @Request() req) {
    const teamMember = await this.teamManagementService.getUserRole(
      teamId,
      req.user.userId,
    );

    if (!teamMember) {
      return {
        role: null,
        isMember: false,
        message: 'You are not a member of this team',
      };
    }

    return {
      role: teamMember.role,
      isMember: true,
      joinedAt: teamMember.joinedAt,
      permissions: this.getPermissionsForRole(teamMember.role),
    };
  }

  /**
   * Helper method to get permissions for a role
   */
  private getPermissionsForRole(role: string): string[] {
    const { ROLE_PERMISSIONS } = require('./team-roles');
    return ROLE_PERMISSIONS[role] || [];
  }
}
