import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { StatsService } from './stats.service';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  @Patch('match/:matchId/calculate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Calculate statistics for a completed match' })
  @ApiResponse({ status: 200, description: 'Statistics calculated successfully' })
  @ApiResponse({ status: 400, description: 'Match must be completed first' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async calculateMatchPerformance(
    @Param('matchId') matchId: string,
    @Request() req: any,
  ) {
    const result = await this.statsService.calculateMatchPerformance(
      matchId,
      req.user.userId,
    );
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: result,
      message: 'Statistics calculated successfully',
    };
  }

  @Patch('match/:matchId/player-of-match/:playerId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Set player of the match' })
  @ApiResponse({ status: 200, description: 'Player of match updated successfully' })
  @ApiResponse({ status: 404, description: 'Performance not found' })
  async setPlayerOfMatch(
    @Param('matchId') matchId: string,
    @Param('playerId') playerId: string,
    @Request() req: any,
  ) {
    const result = await this.statsService.setPlayerOfMatch(
      matchId,
      playerId,
      req.user.userId,
    );
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: result,
      message: 'Player of match updated successfully',
    };
  }

  @Get('player/:playerId/career')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get career statistics for a player' })
  @ApiResponse({ status: 200, description: 'Career stats retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Career stats not found' })
  @HttpCode(HttpStatus.OK)
  async getPlayerCareerStats(@Param('playerId') playerId: string) {
    const stats = await this.statsService.getPlayerCareerStats(playerId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: stats,
      message: 'Career stats retrieved successfully',
    };
  }

  @Get('player/:playerId/matches')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get match history for a player' })
  @ApiResponse({ status: 200, description: 'Match history retrieved successfully' })
  @HttpCode(HttpStatus.OK)
  async getPlayerMatchHistory(@Param('playerId') playerId: string) {
    const performances = await this.statsService.getPlayerMatchHistory(playerId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: performances,
      message: 'Match history retrieved successfully',
    };
  }

  @Get('match/:matchId/performances')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all player performances for a match' })
  @ApiResponse({ status: 200, description: 'Match performances retrieved successfully' })
  @HttpCode(HttpStatus.OK)
  async getMatchPerformances(@Param('matchId') matchId: string) {
    const performances = await this.statsService.getMatchPerformances(matchId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: performances,
      message: 'Match performances retrieved successfully',
    };
  }

  @Get('team/:teamId/history')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get match history for a team' })
  @ApiResponse({ status: 200, description: 'Team history retrieved successfully' })
  @HttpCode(HttpStatus.OK)
  async getTeamHistory(@Param('teamId') teamId: string) {
    const history = await this.statsService.getTeamHistory(teamId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: history,
      message: 'Team history retrieved successfully',
    };
  }
}