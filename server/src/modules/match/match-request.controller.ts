import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MatchService } from './match.service';
import { RespondRequestDto } from './dto/match-request.dto';

@ApiTags('match-requests')
@Controller('match-request')
export class MatchRequestController {
  constructor(private readonly matchService: MatchService) {}

  @Get('team/:teamId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'List match requests for a team (sent and received)',
    description:
      'Returns all match requests where the team is the requesting team or the opponent, newest first. Only team members can view.',
  })
  @ApiParam({ name: 'teamId', description: 'Team ID', format: 'uuid' })
  @ApiResponse({ status: 200, description: 'Match requests retrieved successfully' })
  @ApiResponse({ status: 400, description: 'Caller is not a member of the team' })
  @HttpCode(HttpStatus.OK)
  async getTeamMatchRequests(
    @Param('teamId') teamId: string,
    @Req() req: any,
  ) {
    const requests = await this.matchService.getTeamMatchRequests(
      teamId,
      req.user.userId,
    );
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: requests,
      message: 'Match requests retrieved successfully',
    };
  }

  @Patch(':id/respond')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Respond to a match request (confirm/reject)' })
  @ApiResponse({ status: 200, description: 'Match request responded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Match request not found' })
  async respondToMatchRequest(
    @Param('id') requestId: string,
    @Req() req: any,
    @Body() dto: RespondRequestDto,
  ) {
    const result = await this.matchService.respondToMatchRequest(
      requestId,
      req.user.userId,
      dto,
    );

    if (dto.status === 'confirmed') {
      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: result,
        message: 'Match confirmed successfully',
      };
    } else {
      return {
        success: true,
        statusCode: HttpStatus.OK,
        data: result,
        message: 'Match request rejected',
      };
    }
  }
}
