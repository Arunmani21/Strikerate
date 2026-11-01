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
exports.RetireHurtService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const player_match_performance_entity_1 = require("../stats/player-match-performance.entity");
const innings_entity_1 = require("../innings/innings.entity");
const scorer_transfer_service_1 = require("./scorer-transfer.service");
let RetireHurtService = class RetireHurtService {
    constructor(dataSource, scorerTransferService) {
        this.dataSource = dataSource;
        this.scorerTransferService = scorerTransferService;
    }
    async retireHurt(inningsId, userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const performanceRepository = queryRunner.manager.getRepository(player_match_performance_entity_1.PlayerMatchPerformance);
            const inningsRepository = queryRunner.manager.getRepository(innings_entity_1.Innings);
            const innings = await inningsRepository.findOne({ where: { id: inningsId } });
            if (!innings) {
                throw new common_1.NotFoundException('Innings not found');
            }
            const canScore = await this.scorerTransferService.canUserScore(innings.matchId, userId);
            if (!canScore) {
                throw new common_1.ForbiddenException('You do not have permission to score this match');
            }
            let performance = await performanceRepository.findOne({
                where: {
                    playerId: dto.playerId,
                    matchId: innings.matchId,
                    teamId: innings.battingTeamId,
                },
            });
            if (!performance) {
                performance = performanceRepository.create({
                    playerId: dto.playerId,
                    matchId: innings.matchId,
                    teamId: innings.battingTeamId,
                    runsScored: 0,
                    ballsFaced: 0,
                    fours: 0,
                    sixes: 0,
                    strikeRate: 0,
                    isOut: false,
                });
            }
            if (performance.isOut) {
                throw new common_1.BadRequestException('Player is already out and cannot retire hurt');
            }
            if (performance.isRetiredHurt) {
                throw new common_1.BadRequestException('Player is already retired hurt');
            }
            performance.isRetiredHurt = true;
            performance.retiredHurtAt = new Date();
            performance.retiredHurtBallNumber = innings.totalBalls;
            if (!performance.matchRating) {
                performance.matchRating = 0;
            }
            const savedPerformance = await performanceRepository.save(performance);
            await queryRunner.commitTransaction();
            return {
                performance: savedPerformance,
                message: `${dto.reason.charAt(0).toUpperCase() + dto.reason.slice(1)} - Player retired hurt`,
            };
        }
        catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async returnFromRetirement(inningsId, userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const performanceRepository = queryRunner.manager.getRepository(player_match_performance_entity_1.PlayerMatchPerformance);
            const inningsRepository = queryRunner.manager.getRepository(innings_entity_1.Innings);
            const innings = await inningsRepository.findOne({ where: { id: inningsId } });
            if (!innings) {
                throw new common_1.NotFoundException('Innings not found');
            }
            const canScore = await this.scorerTransferService.canUserScore(innings.matchId, userId);
            if (!canScore) {
                throw new common_1.ForbiddenException('You do not have permission to score this match');
            }
            const performance = await performanceRepository.findOne({
                where: {
                    playerId: dto.playerId,
                    matchId: innings.matchId,
                    teamId: innings.battingTeamId,
                },
            });
            if (!performance) {
                throw new common_1.NotFoundException('Player performance not found');
            }
            if (!performance.isRetiredHurt) {
                throw new common_1.BadRequestException('Player is not retired hurt');
            }
            if (performance.returnedFromRetirement) {
                throw new common_1.BadRequestException('Player has already returned from retirement');
            }
            if (performance.isOut) {
                throw new common_1.BadRequestException('Player cannot return as they are already out');
            }
            performance.returnedFromRetirement = true;
            performance.returnedAtBall = innings.totalBalls;
            const savedPerformance = await performanceRepository.save(performance);
            await queryRunner.commitTransaction();
            return {
                performance: savedPerformance,
                message: 'Player has returned from retirement and can continue batting',
            };
        }
        catch (error) {
            if (queryRunner.isTransactionActive) {
                await queryRunner.rollbackTransaction();
            }
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getRetiredHurtPlayers(inningsId) {
        const performanceRepository = this.dataSource.getRepository(player_match_performance_entity_1.PlayerMatchPerformance);
        const inningsRepository = this.dataSource.getRepository(innings_entity_1.Innings);
        const innings = await inningsRepository.findOne({ where: { id: inningsId } });
        if (!innings) {
            throw new common_1.NotFoundException('Innings not found');
        }
        const retiredPlayers = await performanceRepository.find({
            where: {
                matchId: innings.matchId,
                teamId: innings.battingTeamId,
                isRetiredHurt: true,
                returnedFromRetirement: false,
                isOut: false,
            },
        });
        return retiredPlayers;
    }
    async handleSubstituteFielder(matchId, dto) {
        throw new common_1.NotImplementedException('Substitute fielder tracking is not implemented');
    }
    async canPlayerReturn(inningsId, playerId) {
        const performanceRepository = this.dataSource.getRepository(player_match_performance_entity_1.PlayerMatchPerformance);
        const inningsRepository = this.dataSource.getRepository(innings_entity_1.Innings);
        const innings = await inningsRepository.findOne({ where: { id: inningsId } });
        if (!innings) {
            return false;
        }
        const performance = await performanceRepository.findOne({
            where: {
                playerId,
                matchId: innings.matchId,
                teamId: innings.battingTeamId,
                isRetiredHurt: true,
                returnedFromRetirement: false,
                isOut: false,
            },
        });
        return !!performance;
    }
    async getRetirementStats(matchId) {
        const performanceRepository = this.dataSource.getRepository(player_match_performance_entity_1.PlayerMatchPerformance);
        const retiredPlayers = await performanceRepository.find({
            where: { matchId, isRetiredHurt: true },
        });
        const returnedPlayers = retiredPlayers.filter(p => p.returnedFromRetirement).length;
        const currentlyRetired = retiredPlayers.filter(p => !p.returnedFromRetirement && !p.isOut);
        return {
            totalRetirements: retiredPlayers.length,
            returnedPlayers,
            currentlyRetired,
        };
    }
};
exports.RetireHurtService = RetireHurtService;
exports.RetireHurtService = RetireHurtService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        scorer_transfer_service_1.ScorerTransferService])
], RetireHurtService);
//# sourceMappingURL=retire-hurt.service.js.map