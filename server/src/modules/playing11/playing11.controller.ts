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
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Playing11Service } from './playing11.service';
import { SelectPlaying11Dto } from './dto/select-playing11.dto';

@ApiTags('playing11')
@Controller('matches')
export class Playing11Controller {
  constructor(private readonly playing11Service: Playing11Service) {}

  @Post(':matchId/playing11/:teamId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'Select playing 11 for a match',
    description: `
    Select the playing 11 for a match with support for guest players.

    **Important Notes:**
    - Total must be exactly 11 players (regular + guest combined)
    - Guest players don't need app registration
    - Perfect for last-minute substitutions or temporary players
    - Regular players must be available (checked against availability)
    - Guest players must be active and belong to the team

    **Example Request Body:**
    {
      "playerIds": ["regular-player-1", "regular-player-2", ...],
      "guestPlayerIds": ["guest-player-1", "guest-player-2"]
    }

    The total count of playerIds + guestPlayerIds must equal 11.
    `,
  })
  @ApiParam({ name: 'matchId', description: 'Match ID', format: 'uuid' })
  @ApiParam({ name: 'teamId', description: 'Team ID', format: 'uuid' })
  @ApiResponse({ status: 201, description: 'Playing 11 selected successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  @ApiResponse({ status: 404, description: 'Match or players not found' })
  async selectPlaying11(
    @Param('matchId') matchId: string,
    @Param('teamId') teamId: string,
    @Req() req: any,
    @Body() dto: SelectPlaying11Dto,
  ) {
    const result = await this.playing11Service.selectPlaying11(
      matchId,
      teamId,
      req.user.userId,
      dto,
    );
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      data: result,
      message: 'Playing 11 selected successfully',
    };
  }

  @Get(':matchId/playing11/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get playing 11 selection status for a match' })
  @ApiParam({ name: 'matchId', description: 'Match ID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Status retrieved successfully' })
  @HttpCode(HttpStatus.OK)
  async getPlaying11Status(@Param('matchId') matchId: string) {
    const status = await this.playing11Service.getPlaying11Status(matchId);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: status,
      message: 'Playing 11 status retrieved successfully',
    };
  }

  @Get(':matchId/playing11/:teamId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get playing 11 for a specific team in a match' })
  @ApiParam({ name: 'matchId', description: 'Match ID', format: 'uuid' })
  @ApiParam({ name: 'teamId', description: 'Team ID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Playing 11 retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Playing 11 not found' })
  @HttpCode(HttpStatus.OK)
  async getPlaying11(
    @Param('matchId') matchId: string,
    @Param('teamId') teamId: string,
  ) {
    const playing11 = await this.playing11Service.getPlaying11(
      matchId,
      teamId,
    );
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: playing11,
      message: 'Playing 11 retrieved successfully',
    };
  }
}
