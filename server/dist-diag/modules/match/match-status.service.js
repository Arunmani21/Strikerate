"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchStatusService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const match_entity_1 = require("./match.entity");
const team_entity_1 = require("../team/team.entity");
const match_permission_service_1 = require("../../common/match-permission.service");
let MatchStatusService = class MatchStatusService {
    constructor(dataSource, matchPermission) {
        this.dataSource = dataSource;
        this.matchPermission = matchPermission;
    }
    async updateMatchStatus(matchId, dto, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matchRepository = queryRunner.manager.getRepository(match_entity_1.Match);
            const teamRepository = queryRunner.manager.getRepository(team_entity_1.Team);
            const match = await matchRepository.findOne({ where: { id: matchId } });
            if (!match) {
                throw new common_1.NotFoundException('Match not found');
            }
            this.validateStatusTransition(match.status, dto.status);
            match.status = dto.status;
            match.statusChangedAt = new Date();
            match.statusChangedBy = userId;
            if (dto.winningTeamId) {
                const winningTeam = await teamRepository.findOne({
                    where: { id: dto.winningTeamId },
                });
                if (!winningTeam) {
                    throw new common_1.NotFoundException('Winning team not found');
                }
                match.winningTeamId = dto.winningTeamId;
            }
            if (dto.marginOfVictory) {
                match.marginOfVictory = dto.marginOfVictory;
            }
            if (dto.marginType) {
                match.marginType = dto.marginType;
            }
            if (dto.weatherConditions) {
                match.weatherConditions = dto.weatherConditions;
            }
            if (dto.oversBowled) {
                match.oversBowled = dto.oversBowled;
            }
            if (dto.totalOversBowled) {
                match.totalOversBowled = dto.totalOversBowled;
            }
            const savedMatch = await matchRepository.save(match);
            await queryRunner.commitTransaction();
            return {
                match: savedMatch,
                message: `Match status updated to ${dto.status}`,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async abandonMatch(matchId, dto, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matchRepository = queryRunner.manager.getRepository(match_entity_1.Match);
            const match = await matchRepository.findOne({ where: { id: matchId } });
            if (!match) {
                throw new common_1.NotFoundException('Match not found');
            }
            await this.matchPermission.assertCanManage(matchId, userId);
            if (match.status !== match_entity_1.MatchStatus.LIVE &&
                match.status !== match_entity_1.MatchStatus.RAIN_DELAYED &&
                match.status !== match_entity_1.MatchStatus.BAD_LIGHT_DELAYED &&
                match.status !== match_entity_1.MatchStatus.INNINGS_BREAK &&
                match.status !== match_entity_1.MatchStatus.SCHEDULED) {
                throw new common_1.BadRequestException(`Cannot abandon match with status ${match.status}`);
            }
            match.status = match_entity_1.MatchStatus.ABANDONED;
            match.statusChangedAt = new Date();
            match.statusChangedBy = userId;
            match.abandonmentReason = dto.reason;
            match.abandonmentDetails = dto.details;
            match.weatherConditions = dto.weatherConditions;
            match.oversBowled = dto.oversBowled;
            match.totalOversBowled = dto.totalOvers || match.totalOvers;
            const savedMatch = await matchRepository.save(match);
            await queryRunner.commitTransaction();
            return {
                match: savedMatch,
                message: `Match abandoned due to ${dto.reason}`,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async completeMatch(matchId, dto, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matchRepository = queryRunner.manager.getRepository(match_entity_1.Match);
            const teamRepository = queryRunner.manager.getRepository(team_entity_1.Team);
            const match = await matchRepository.findOne({ where: { id: matchId } });
            if (!match) {
                throw new common_1.NotFoundException('Match not found');
            }
            await this.matchPermission.assertCanManage(matchId, userId);
            if (match.status !== match_entity_1.MatchStatus.LIVE &&
                match.status !== match_entity_1.MatchStatus.INNINGS_BREAK) {
                throw new common_1.BadRequestException(`Cannot complete match with status ${match.status}`);
            }
            const winningTeam = await teamRepository.findOne({
                where: { id: dto.winningTeamId },
            });
            if (!winningTeam) {
                throw new common_1.NotFoundException('Winning team not found');
            }
            if (match.teamAId !== dto.winningTeamId &&
                match.teamBId !== dto.winningTeamId) {
                throw new common_1.BadRequestException('Winning team must be one of the teams playing this match');
            }
            match.status = match_entity_1.MatchStatus.COMPLETED;
            match.winningTeamId = dto.winningTeamId;
            match.marginOfVictory = `${dto.margin} ${dto.victoryType}`;
            match.marginType = dto.victoryType;
            match.statusChangedAt = new Date();
            match.statusChangedBy = userId;
            if (dto.resultDescription) {
                match.result = dto.resultDescription;
            }
            else {
                match.result = `${winningTeam.name} won by ${dto.margin} ${dto.victoryType}`;
            }
            const savedMatch = await matchRepository.save(match);
            await queryRunner.commitTransaction();
            return {
                match: savedMatch,
                message: `Match completed. ${winningTeam.name} won by ${dto.margin} ${dto.victoryType}`,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async declareMatchTied(matchId, dto, userId) {
        const matchRepository = this.dataSource.getRepository(match_entity_1.Match);
        const match = await matchRepository.findOne({ where: { id: matchId } });
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
        }
        await this.matchPermission.assertCanManage(matchId, userId);
        if (match.status !== match_entity_1.MatchStatus.LIVE &&
            match.status !== match_entity_1.MatchStatus.INNINGS_BREAK) {
            throw new common_1.BadRequestException(`Cannot declare tie for match with status ${match.status}`);
        }
        match.status = match_entity_1.MatchStatus.TIED;
        match.statusChangedAt = new Date();
        match.statusChangedBy = userId;
        match.result = dto.description || 'Match tied';
        const savedMatch = await matchRepository.save(match);
        return {
            match: savedMatch,
            message: 'Match declared as tied. You can now choose to play a super over or declare as draw.',
            canPlaySuperOver: true,
        };
    }
    async declareMatchDraw(matchId, dto, userId) {
        const matchRepository = this.dataSource.getRepository(match_entity_1.Match);
        const match = await matchRepository.findOne({ where: { id: matchId } });
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
        }
        await this.matchPermission.assertCanManage(matchId, userId);
        if (match.status !== match_entity_1.MatchStatus.LIVE &&
            match.status !== match_entity_1.MatchStatus.INNINGS_BREAK) {
            throw new common_1.BadRequestException(`Cannot declare draw for match with status ${match.status}`);
        }
        match.status = match_entity_1.MatchStatus.DRAW;
        match.statusChangedAt = new Date();
        match.statusChangedBy = userId;
        match.result = dto.description || 'Match drawn';
        match.abandonmentDetails = dto.reason;
        const savedMatch = await matchRepository.save(match);
        return {
            match: savedMatch,
            message: 'Match declared as drawn',
        };
    }
    async delayMatch(matchId, dto, userId) {
        const matchRepository = this.dataSource.getRepository(match_entity_1.Match);
        const match = await matchRepository.findOne({ where: { id: matchId } });
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
        }
        await this.matchPermission.assertCanManage(matchId, userId);
        if (match.status !== match_entity_1.MatchStatus.LIVE) {
            throw new common_1.BadRequestException(`Cannot delay match with status ${match.status}`);
        }
        const delayStatus = dto.delayType === 'rain'
            ? match_entity_1.MatchStatus.RAIN_DELAYED
            : match_entity_1.MatchStatus.BAD_LIGHT_DELAYED;
        match.status = delayStatus;
        match.statusChangedAt = new Date();
        match.statusChangedBy = userId;
        match.weatherConditions = dto.weatherConditions;
        match.abandonmentDetails = dto.description;
        const savedMatch = await matchRepository.save(match);
        return {
            match: savedMatch,
            message: `Match delayed due to ${dto.delayType}. Expected to resume in ${dto.estimatedDuration} minutes`,
        };
    }
    async resumeMatch(matchId, dto, userId) {
        const matchRepository = this.dataSource.getRepository(match_entity_1.Match);
        const match = await matchRepository.findOne({ where: { id: matchId } });
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
        }
        await this.matchPermission.assertCanManage(matchId, userId);
        if (match.status !== match_entity_1.MatchStatus.RAIN_DELAYED &&
            match.status !== match_entity_1.MatchStatus.BAD_LIGHT_DELAYED) {
            throw new common_1.BadRequestException(`Cannot resume match with status ${match.status}`);
        }
        match.status = match_entity_1.MatchStatus.LIVE;
        match.statusChangedAt = new Date();
        match.statusChangedBy = userId;
        const savedMatch = await matchRepository.save(match);
        return {
            match: savedMatch,
            message: `Match resumed${dto.timeLost ? ` after ${dto.timeLost} minutes delay` : ''}`,
        };
    }
    async postponeMatch(matchId, dto, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matchRepository = queryRunner.manager.getRepository(match_entity_1.Match);
            const match = await matchRepository.findOne({ where: { id: matchId } });
            if (!match) {
                throw new common_1.NotFoundException('Match not found');
            }
            await this.matchPermission.assertCanManage(matchId, userId);
            if (match.status !== match_entity_1.MatchStatus.SCHEDULED) {
                throw new common_1.BadRequestException(`Cannot postpone match with status ${match.status}`);
            }
            match.status = match_entity_1.MatchStatus.POSTPONED;
            match.statusChangedAt = new Date();
            match.statusChangedBy = userId;
            match.abandonmentReason = dto.reason;
            match.abandonmentDetails = `Rescheduled to ${dto.rescheduledDate} at ${dto.rescheduledTime}`;
            const savedMatch = await matchRepository.save(match);
            await queryRunner.commitTransaction();
            return {
                match: savedMatch,
                message: `Match postponed to ${dto.rescheduledDate} at ${dto.rescheduledTime}`,
            };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async cancelMatch(matchId, dto, userId) {
        const matchRepository = this.dataSource.getRepository(match_entity_1.Match);
        const match = await matchRepository.findOne({ where: { id: matchId } });
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
        }
        await this.matchPermission.assertCanManage(matchId, userId);
        if (match.status !== match_entity_1.MatchStatus.SCHEDULED) {
            throw new common_1.BadRequestException(`Cannot cancel match with status ${match.status}`);
        }
        match.status = match_entity_1.MatchStatus.CANCELLED;
        match.statusChangedAt = new Date();
        match.statusChangedBy = userId;
        match.abandonmentReason = 'cancelled';
        match.abandonmentDetails = dto.reason;
        const savedMatch = await matchRepository.save(match);
        return {
            match: savedMatch,
            message: 'Match cancelled successfully',
        };
    }
    async getMatchesByStatus(status) {
        const matchRepository = this.dataSource.getRepository(match_entity_1.Match);
        return await matchRepository.find({
            where: { status },
            relations: ['teamA', 'teamB', 'winningTeam'],
            order: { matchDate: 'DESC', matchTime: 'DESC' },
        });
    }
    async getLiveMatches() {
        return await this.getMatchesByStatus(match_entity_1.MatchStatus.LIVE);
    }
    async getUpcomingMatches() {
        return await this.getMatchesByStatus(match_entity_1.MatchStatus.SCHEDULED);
    }
    async getCompletedMatches() {
        const matchRepository = this.dataSource.getRepository(match_entity_1.Match);
        return await matchRepository.find({
            where: { status: match_entity_1.MatchStatus.COMPLETED },
            relations: ['teamA', 'teamB', 'winningTeam'],
            order: { matchDate: 'DESC', matchTime: 'DESC' },
        });
    }
    validateStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            [match_entity_1.MatchStatus.SCHEDULED]: [
                match_entity_1.MatchStatus.POSTPONED,
                match_entity_1.MatchStatus.CANCELLED,
                match_entity_1.MatchStatus.TOSS_DONE,
                match_entity_1.MatchStatus.LIVE,
            ],
            [match_entity_1.MatchStatus.TOSS_DONE]: [match_entity_1.MatchStatus.LIVE, match_entity_1.MatchStatus.CANCELLED],
            [match_entity_1.MatchStatus.LIVE]: [
                match_entity_1.MatchStatus.COMPLETED,
                match_entity_1.MatchStatus.TIED,
                match_entity_1.MatchStatus.DRAW,
                match_entity_1.MatchStatus.ABANDONED,
                match_entity_1.MatchStatus.RAIN_DELAYED,
                match_entity_1.MatchStatus.BAD_LIGHT_DELAYED,
                match_entity_1.MatchStatus.INNINGS_BREAK,
                match_entity_1.MatchStatus.NO_RESULT,
                match_entity_1.MatchStatus.UMPIRE_DECISION_PENDING,
            ],
            [match_entity_1.MatchStatus.INNINGS_BREAK]: [
                match_entity_1.MatchStatus.LIVE,
                match_entity_1.MatchStatus.COMPLETED,
                match_entity_1.MatchStatus.TIED,
                match_entity_1.MatchStatus.DRAW,
                match_entity_1.MatchStatus.ABANDONED,
                match_entity_1.MatchStatus.NO_RESULT,
            ],
            [match_entity_1.MatchStatus.RAIN_DELAYED]: [
                match_entity_1.MatchStatus.LIVE,
                match_entity_1.MatchStatus.ABANDONED,
                match_entity_1.MatchStatus.POSTPONED,
                match_entity_1.MatchStatus.NO_RESULT,
            ],
            [match_entity_1.MatchStatus.BAD_LIGHT_DELAYED]: [
                match_entity_1.MatchStatus.LIVE,
                match_entity_1.MatchStatus.ABANDONED,
                match_entity_1.MatchStatus.POSTPONED,
                match_entity_1.MatchStatus.NO_RESULT,
            ],
            [match_entity_1.MatchStatus.UMPIRE_DECISION_PENDING]: [
                match_entity_1.MatchStatus.LIVE,
                match_entity_1.MatchStatus.ABANDONED,
                match_entity_1.MatchStatus.NO_RESULT,
            ],
            [match_entity_1.MatchStatus.COMPLETED]: [],
            [match_entity_1.MatchStatus.TIED]: [],
            [match_entity_1.MatchStatus.DRAW]: [],
            [match_entity_1.MatchStatus.ABANDONED]: [],
            [match_entity_1.MatchStatus.POSTPONED]: [match_entity_1.MatchStatus.SCHEDULED],
            [match_entity_1.MatchStatus.CANCELLED]: [],
            [match_entity_1.MatchStatus.NO_RESULT]: [],
        };
        const allowedTransitions = validTransitions[currentStatus] || [];
        if (!allowedTransitions.includes(newStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions.join(', ')}`);
        }
    }
};
exports.MatchStatusService = MatchStatusService;
exports.MatchStatusService = MatchStatusService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        match_permission_service_1.MatchPermissionService])
], MatchStatusService);
//# sourceMappingURL=match-status.service.js.map