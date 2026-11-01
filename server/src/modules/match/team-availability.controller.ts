import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MatchService } from './match.service';
import { TeamAvailabilityDto } from './dto/team-availability.dto';

@ApiTags('team-availability')
@Controller()
export class TeamAvailabilityController {
  constructor(private readonly matchService: MatchService) {}

  @Post('team/:teamId/availability')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Post team availability for matches' })
  @ApiResponse({ status: 201, description: 'Team availability posted successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - validation failed' })
  @ApiResponse({ status: 403, description: 'Forbidden - insufficient permissions' })
  async postTeamAvailability(
    @Param('teamId') teamId: string,
    @Req() req: any,
    @Body() dto: TeamAvailabilityDto,
  ) {
    const availability = await this.matchService.postTeamAvailability(
      teamId,
      req.user.userId,
      dto,
    );
    return {
      success: true,
      statusCode: HttpStatus.CREATED,
      data: availability,
      message: 'Team availability posted successfully',
    };
  }

  // Own path prefix so it can't be shadowed by the team controller's @Get(':id')
  @Get('team-availability/available')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all teams open for match requests on a date' })
  @ApiQuery({ name: 'date', description: 'Date to look up (YYYY-MM-DD)', example: '2024-03-25' })
  @ApiResponse({ status: 200, description: 'Available teams retrieved successfully' })
  @HttpCode(HttpStatus.OK)
  async getAvailableTeams(@Query('date') date: string) {
    const teams = await this.matchService.getAvailableTeams(date);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: teams,
      message: 'Available teams retrieved successfully',
    };
  }
}
