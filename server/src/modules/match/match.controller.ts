import {
  Controller,
  Get,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MatchService } from './match.service';

@ApiTags('matches')
@Controller('matches')
export class MatchController {
  constructor(private readonly matchService: MatchService) {}

  // Declared before @Get(':id') so 'live' isn't captured as a match id
  @Get('live')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all live matches' })
  @ApiResponse({ status: 200, description: 'Live matches retrieved successfully' })
  @HttpCode(HttpStatus.OK)
  async getLiveMatches() {
    const matches = await this.matchService.getLiveMatches();
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: matches,
      message: 'Live matches retrieved successfully',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get match by ID' })
  @ApiResponse({ status: 200, description: 'Match retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async getMatch(@Param('id') matchId: string) {
    const match = await this.matchService.getMatch(matchId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: match,
      message: 'Match retrieved successfully',
    };
  }
}
