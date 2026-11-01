import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MatchService } from './match.service';
import { MatchRequestDto } from './dto/match-request.dto';

@ApiTags('team-matches')
@Controller('team')
export class TeamMatchesController {
  constructor(private readonly matchService: MatchService) {}

  @Post(':teamId/match-request')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Send match request to another team' })
  @ApiResponse({ status: 201, description: 'Match request sent successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'Conflict - pending request already exists' })
  async sendMatchRequest(
    @Param('teamId') teamId: string,
    @Req() req: any,
    @Body() dto: MatchRequestDto,
  ) {
    const matchRequest = await this.matchService.sendMatchRequest(
      teamId,
      req.user.userId,
      dto,
    );
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      data: matchRequest,
      message: 'Match request sent successfully',
    };
  }

  @Get(':teamId/matches/upcoming')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get upcoming matches for a team' })
  @ApiResponse({ status: 200, description: 'Upcoming matches retrieved successfully' })
  @HttpCode(HttpStatus.OK)
  async getUpcomingMatches(@Param('teamId') teamId: string) {
    const matches = await this.matchService.getUpcomingMatches(teamId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: matches,
      message: 'Upcoming matches retrieved successfully',
    };
  }
}
