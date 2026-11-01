import {
  Controller,
  Patch,
  Param,
  Body,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MatchService } from './match.service';
import { TossDto } from './dto/toss.dto';

@ApiTags('toss')
@Controller('matches')
export class TossController {
  constructor(private readonly matchService: MatchService) {}

  @Patch(':matchId/toss')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Record toss for a match' })
  @ApiResponse({ status: 200, description: 'Toss recorded successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Match not found' })
  async recordToss(
    @Param('matchId') matchId: string,
    @Req() req: any,
    @Body() dto: TossDto,
  ) {
    const match = await this.matchService.recordToss(matchId, req.user.userId, dto);
    return {
      success: true,
      statusCode: HttpStatus.OK,
      data: match,
      message: 'Toss recorded successfully',
    };
  }
}
