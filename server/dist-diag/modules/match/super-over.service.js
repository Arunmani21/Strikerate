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
exports.SuperOverService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const match_entity_1 = require("./match.entity");
const team_entity_1 = require("../team/team.entity");
const match_permission_service_1 = require("../../common/match-permission.service");
const super_over_entity_1 = require("./super-over.entity");
let SuperOverService = class SuperOverService {
    constructor(dataSource, matchPermission) {
        this.dataSource = dataSource;
        this.matchPermission = matchPermission;
    }
    async startSuperOver(matchId, dto, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matchRepository = queryRunner.manager.getRepository(match_entity_1.Match);
            const teamRepository = queryRunner.manager.getRepository(team_entity_1.Team);
            const superOverRepository = queryRunner.manager.getRepository(super_over_entity_1.SuperOver);
            const match = await matchRepository.findOne({ where: { id: matchId } });
            if (!match) {
                throw new common_1.NotFoundException('Match not found');
            }
            await this.matchPermission.assertCanManage(matchId, userId);
            if (match.status !== match_entity_1.MatchStatus.TIED) {
                throw new common_1.BadRequestException(`Cannot start super over for match with status ${match.status}. Match must be tied.`);
            }
            const teamA = await teamRepository.findOne({ where: { id: match.teamAId } });
            const teamB = await teamRepository.findOne({ where: { id: match.teamBId } });
            if (!teamA || !teamB) {
                throw new common_1.NotFoundException('One or both teams not found');
            }
            const existingSuperOvers = await superOverRepository.find({
                where: { matchId },
            });
            const superOverNumber = existingSuperOvers.length + 1;
            const type = superOverNumber > 1 ? super_over_entity_1.SuperOverType.TIE_BREAKER : super_over_entity_1.SuperOverType.STANDARD;
            if (dto.tossWinnerTeamId !== match.teamAId &&
                dto.tossWinnerTeamId !== match.teamBId) {
                throw new common_1.BadRequestException('Toss winner must be one of the teams playing this match');
            }
            const superOver = superOverRepository.create({
                matchId,
                teamAId: match.teamAId,
                teamBId: match.teamBId,
                type,
                status: super_over_entity_1.SuperOverStatus.SCHEDULED,
                tossWinnerTeamId: dto.tossWinnerTeamId,
                tossChoice: dto.tossChoice,
                targetRuns: dto.targetRuns,
                superOverNumber,
                createdBy: userId,
                metadata: dto.metadata,
            });
            const savedSuperOver = await superOverRepository.save(superOver);
            match.status = match_entity_1.MatchStatus.LIVE;
            match.statusChangedAt = new Date();
            match.statusChangedBy = userId;
            await matchRepository.save(match);
            await queryRunner.commitTransaction();
            return {
                superOver: savedSuperOver,
                message: `Super over ${superOverNumber} started. ${dto.tossChoice === 'bat' ? teamA.name : teamB.name} chose to ${dto.tossChoice} first`,
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
    async beginSuperOverInnings(superOverId, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const superOverRepository = queryRunner.manager.getRepository(super_over_entity_1.SuperOver);
            const superOver = await superOverRepository.findOne({
                where: { id: superOverId },
            });
            if (!superOver) {
                throw new common_1.NotFoundException('Super over not found');
            }
            if (superOver.status !== super_over_entity_1.SuperOverStatus.SCHEDULED) {
                throw new common_1.BadRequestException(`Cannot begin innings for super over with status ${superOver.status}`);
            }
            await this.matchPermission.assertCanManage(superOver.matchId, userId);
            let battingFirstTeamId;
            if (superOver.tossChoice === 'bat') {
                battingFirstTeamId = superOver.tossWinnerTeamId;
            }
            else {
                battingFirstTeamId =
                    superOver.tossWinnerTeamId === superOver.teamAId
                        ? superOver.teamBId
                        : superOver.teamAId;
            }
            superOver.teamABattingFirst =
                battingFirstTeamId === superOver.teamAId;
            superOver.status = super_over_entity_1.SuperOverStatus.IN_PROGRESS;
            superOver.statusChangedAt = new Date();
            superOver.statusChangedBy = userId;
            const savedSuperOver = await superOverRepository.save(superOver);
            await queryRunner.commitTransaction();
            return {
                superOver: savedSuperOver,
                message: `Super over innings began. Team batting first: ${battingFirstTeamId === superOver.teamAId ? 'Team A' : 'Team B'}`,
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
    async deliverSuperOverBall(superOverId, dto, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const superOverRepository = queryRunner.manager.getRepository(super_over_entity_1.SuperOver);
            const superOver = await superOverRepository.findOne({
                where: { id: superOverId },
            });
            if (!superOver) {
                throw new common_1.NotFoundException('Super over not found');
            }
            if (superOver.status !== super_over_entity_1.SuperOverStatus.IN_PROGRESS) {
                throw new common_1.BadRequestException(`Cannot deliver ball for super over with status ${superOver.status}`);
            }
            await this.matchPermission.assertCanManage(superOver.matchId, userId);
            const isFirstTeamBatting = (superOver.teamABattingFirst && superOver.currentOver === 0) ||
                (!superOver.teamABattingFirst && superOver.currentOver === 1);
            let runsToAdd = dto.runs;
            let wicketsToAdd = 0;
            if (dto.isWide) {
                runsToAdd += 1;
            }
            else if (dto.isNoBall) {
                runsToAdd += 1;
            }
            else {
                superOver.currentBall += 1;
            }
            if (dto.isWicket) {
                wicketsToAdd = 1;
            }
            if (isFirstTeamBatting) {
                if (superOver.teamABattingFirst) {
                    superOver.teamARuns += runsToAdd;
                    superOver.teamAWickets += wicketsToAdd;
                }
                else {
                    superOver.teamBRuns += runsToAdd;
                    superOver.teamBWickets += wicketsToAdd;
                }
            }
            else {
                if (superOver.teamABattingFirst) {
                    superOver.teamBRuns += runsToAdd;
                    superOver.teamBWickets += wicketsToAdd;
                }
                else {
                    superOver.teamARuns += runsToAdd;
                    superOver.teamAWickets += wicketsToAdd;
                }
            }
            let inningsComplete = false;
            let reason = '';
            const currentWickets = isFirstTeamBatting
                ? superOver.teamABattingFirst
                    ? superOver.teamAWickets
                    : superOver.teamBWickets
                : superOver.teamABattingFirst
                    ? superOver.teamBWickets
                    : superOver.teamAWickets;
            const currentRuns = isFirstTeamBatting
                ? superOver.teamABattingFirst
                    ? superOver.teamARuns
                    : superOver.teamBRuns
                : superOver.teamABattingFirst
                    ? superOver.teamBRuns
                    : superOver.teamARuns;
            if (currentWickets >= 2) {
                inningsComplete = true;
                reason = 'Innings complete - 2 wickets lost';
            }
            else if (superOver.currentBall >= 6) {
                inningsComplete = true;
                reason = 'Over complete - 6 balls bowled';
            }
            else if (!isFirstTeamBatting && superOver.targetRuns) {
                const firstTeamScore = superOver.teamABattingFirst
                    ? superOver.teamARuns
                    : superOver.teamBRuns;
                if (currentRuns > firstTeamScore) {
                    inningsComplete = true;
                    reason = 'Target exceeded - super over won';
                }
            }
            if (inningsComplete) {
                if (isFirstTeamBatting) {
                    superOver.currentOver = 1;
                    superOver.currentBall = 0;
                    superOver.targetRuns = currentRuns;
                    const savedSuperOver = await superOverRepository.save(superOver);
                    await queryRunner.commitTransaction();
                    return {
                        superOver: savedSuperOver,
                        message: `${reason}. Target set: ${currentRuns} runs. Next team to bat.`,
                    };
                }
                else {
                    const winner = this.determineSuperOverWinner(superOver);
                    superOver.status = super_over_entity_1.SuperOverStatus.COMPLETED;
                    superOver.wonByTeamId = winner.winningTeamId;
                    superOver.margin = winner.margin;
                    superOver.completedAt = new Date();
                    const savedSuperOver = await superOverRepository.save(superOver);
                    await this.updateMatchAfterSuperOver(queryRunner, superOver.matchId, winner.winningTeamId, userId);
                    await queryRunner.commitTransaction();
                    return {
                        superOver: savedSuperOver,
                        message: `Super over completed. ${winner.resultMessage}`,
                    };
                }
            }
            const savedSuperOver = await superOverRepository.save(superOver);
            await queryRunner.commitTransaction();
            return {
                superOver: savedSuperOver,
                message: `Ball recorded. Runs: ${runsToAdd}, Wickets: ${wicketsToAdd}`,
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
    async completeSuperOver(superOverId, dto, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const superOverRepository = queryRunner.manager.getRepository(super_over_entity_1.SuperOver);
            const superOver = await superOverRepository.findOne({
                where: { id: superOverId },
            });
            if (!superOver) {
                throw new common_1.NotFoundException('Super over not found');
            }
            if (superOver.status !== super_over_entity_1.SuperOverStatus.IN_PROGRESS) {
                throw new common_1.BadRequestException(`Cannot complete super over with status ${superOver.status}`);
            }
            await this.matchPermission.assertCanManage(superOver.matchId, userId);
            superOver.status = super_over_entity_1.SuperOverStatus.COMPLETED;
            superOver.wonByTeamId = dto.winningTeamId;
            superOver.margin = dto.margin;
            superOver.completedAt = new Date();
            superOver.statusChangedAt = new Date();
            superOver.statusChangedBy = userId;
            if (dto.details) {
                superOver.metadata = { ...superOver.metadata, ...dto.details };
            }
            const savedSuperOver = await superOverRepository.save(superOver);
            await this.updateMatchAfterSuperOver(queryRunner, superOver.matchId, dto.winningTeamId, userId);
            await queryRunner.commitTransaction();
            return {
                superOver: savedSuperOver,
                message: `Super over completed. Team won by ${dto.margin}`,
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
    async abandonSuperOver(superOverId, dto, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const superOverRepository = queryRunner.manager.getRepository(super_over_entity_1.SuperOver);
            const matchRepository = queryRunner.manager.getRepository(match_entity_1.Match);
            const superOver = await superOverRepository.findOne({
                where: { id: superOverId },
            });
            if (!superOver) {
                throw new common_1.NotFoundException('Super over not found');
            }
            if (superOver.status !== super_over_entity_1.SuperOverStatus.SCHEDULED &&
                superOver.status !== super_over_entity_1.SuperOverStatus.IN_PROGRESS) {
                throw new common_1.BadRequestException(`Cannot abandon super over with status ${superOver.status}`);
            }
            await this.matchPermission.assertCanManage(superOver.matchId, userId);
            superOver.status = super_over_entity_1.SuperOverStatus.ABANDONED;
            superOver.metadata = {
                ...superOver.metadata,
                abandonmentReason: dto.reason,
                abandonmentDetails: dto.details,
                matchSituation: dto.matchSituation,
            };
            superOver.statusChangedAt = new Date();
            superOver.statusChangedBy = userId;
            const savedSuperOver = await superOverRepository.save(superOver);
            const match = await matchRepository.findOne({
                where: { id: superOver.matchId },
            });
            if (match) {
                match.status = match_entity_1.MatchStatus.NO_RESULT;
                match.statusChangedAt = new Date();
                match.statusChangedBy = userId;
                match.abandonmentReason = dto.reason;
                match.abandonmentDetails = dto.details;
                await matchRepository.save(match);
            }
            await queryRunner.commitTransaction();
            return {
                superOver: savedSuperOver,
                message: `Super over abandoned due to ${dto.reason}`,
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
    async updateSuperOverStatus(superOverId, dto, userId) {
        const superOverRepository = this.dataSource.getRepository(super_over_entity_1.SuperOver);
        const superOver = await superOverRepository.findOne({
            where: { id: superOverId },
        });
        if (!superOver) {
            throw new common_1.NotFoundException('Super over not found');
        }
        this.validateSuperOverStatusTransition(superOver.status, dto.status);
        await this.matchPermission.assertCanManage(superOver.matchId, userId);
        superOver.status = dto.status;
        superOver.statusChangedAt = new Date();
        superOver.statusChangedBy = userId;
        superOver.metadata = {
            ...superOver.metadata,
            statusChangeReason: dto.reason,
        };
        const savedSuperOver = await superOverRepository.save(superOver);
        return {
            superOver: savedSuperOver,
            message: `Super over status updated to ${dto.status}`,
        };
    }
    async getSuperOver(superOverId) {
        const superOverRepository = this.dataSource.getRepository(super_over_entity_1.SuperOver);
        const superOver = await superOverRepository.findOne({
            where: { id: superOverId },
            relations: ['match', 'teamA', 'teamB'],
        });
        if (!superOver) {
            throw new common_1.NotFoundException('Super over not found');
        }
        return superOver;
    }
    async getMatchSuperOvers(matchId) {
        const superOverRepository = this.dataSource.getRepository(super_over_entity_1.SuperOver);
        return await superOverRepository.find({
            where: { matchId },
            relations: ['teamA', 'teamB'],
            order: { superOverNumber: 'ASC' },
        });
    }
    determineSuperOverWinner(superOver) {
        const teamAScore = superOver.teamARuns;
        const teamBScore = superOver.teamBRuns;
        const teamAWickets = superOver.teamAWickets;
        const teamBWickets = superOver.teamBWickets;
        if (teamAScore > teamBScore) {
            return {
                winningTeamId: superOver.teamAId,
                margin: `${teamAScore - teamBScore} runs`,
                resultMessage: `Team A won by ${teamAScore - teamBScore} runs (${teamAScore}-${teamAWickets} vs ${teamBScore}-${teamBWickets})`,
            };
        }
        else if (teamBScore > teamAScore) {
            return {
                winningTeamId: superOver.teamBId,
                margin: `${teamBScore - teamAScore} runs`,
                resultMessage: `Team B won by ${teamBScore - teamAScore} runs (${teamBScore}-${teamBWickets} vs ${teamAScore}-${teamAWickets})`,
            };
        }
        else {
            throw new common_1.BadRequestException('Super over is still tied. Another super over is needed.');
        }
    }
    async updateMatchAfterSuperOver(queryRunner, matchId, winningTeamId, userId) {
        const matchRepository = queryRunner.manager.getRepository(match_entity_1.Match);
        const match = await matchRepository.findOne({ where: { id: matchId } });
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
        }
        match.status = match_entity_1.MatchStatus.COMPLETED;
        match.winningTeamId = winningTeamId;
        match.result = 'Match won in super over';
        match.marginType = 'super over';
        match.statusChangedAt = new Date();
        match.statusChangedBy = userId;
        await matchRepository.save(match);
    }
    validateSuperOverStatusTransition(currentStatus, newStatus) {
        const validTransitions = {
            [super_over_entity_1.SuperOverStatus.SCHEDULED]: [
                super_over_entity_1.SuperOverStatus.IN_PROGRESS,
                super_over_entity_1.SuperOverStatus.ABANDONED,
            ],
            [super_over_entity_1.SuperOverStatus.IN_PROGRESS]: [
                super_over_entity_1.SuperOverStatus.COMPLETED,
                super_over_entity_1.SuperOverStatus.ABANDONED,
            ],
            [super_over_entity_1.SuperOverStatus.COMPLETED]: [],
            [super_over_entity_1.SuperOverStatus.ABANDONED]: [],
        };
        const allowedTransitions = validTransitions[currentStatus] || [];
        if (!allowedTransitions.includes(newStatus)) {
            throw new common_1.BadRequestException(`Cannot transition from ${currentStatus} to ${newStatus}. Allowed transitions: ${allowedTransitions.join(', ')}`);
        }
    }
};
exports.SuperOverService = SuperOverService;
exports.SuperOverService = SuperOverService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        match_permission_service_1.MatchPermissionService])
], SuperOverService);
//# sourceMappingURL=super-over.service.js.map