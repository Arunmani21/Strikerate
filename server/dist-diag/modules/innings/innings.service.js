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
exports.InningsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const innings_entity_1 = require("./innings.entity");
const match_entity_1 = require("../match/match.entity");
const playing11_entity_1 = require("../playing11/playing11.entity");
const player_entity_1 = require("../player/player.entity");
let InningsService = class InningsService {
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async startInnings(matchId, userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const inningsRepository = queryRunner.manager.getRepository(innings_entity_1.Innings);
            const matchRepository = queryRunner.manager.getRepository(match_entity_1.Match);
            const playing11Repository = queryRunner.manager.getRepository(playing11_entity_1.Playing11);
            const match = await matchRepository.findOne({
                where: { id: matchId },
            });
            if (!match) {
                throw new common_1.NotFoundException('Match not found');
            }
            if (dto.inningsNumber === 2) {
                if (match.status !== match_entity_1.MatchStatus.INNINGS_BREAK) {
                    throw new common_1.BadRequestException('Second innings can only start after the first innings is completed');
                }
                const firstInnings = await inningsRepository.findOne({
                    where: { matchId, inningsNumber: 1 },
                });
                if (!firstInnings || !firstInnings.isCompleted) {
                    throw new common_1.BadRequestException('First innings must be completed before starting second innings');
                }
            }
            else if (match.status !== match_entity_1.MatchStatus.TOSS_DONE) {
                throw new common_1.BadRequestException('Toss must be done before starting innings');
            }
            if (match.teamAId !== dto.battingTeamId &&
                match.teamAId !== dto.bowlingTeamId) {
                throw new common_1.BadRequestException('Teams must be part of the match');
            }
            if (dto.battingTeamId === dto.bowlingTeamId) {
                throw new common_1.BadRequestException('Batting and bowling teams must be different');
            }
            const teamAPlaying11 = await playing11Repository.count({
                where: { matchId, teamId: match.teamAId },
            });
            const teamBPlaying11 = await playing11Repository.count({
                where: { matchId, teamId: match.teamBId },
            });
            if (teamAPlaying11 !== 11 || teamBPlaying11 !== 11) {
                throw new common_1.BadRequestException('Both teams must select playing 11 before starting innings');
            }
            const existingInnings = await inningsRepository.findOne({
                where: {
                    matchId,
                    inningsNumber: dto.inningsNumber,
                },
            });
            if (existingInnings) {
                throw new common_1.BadRequestException('Innings already exists');
            }
            const innings = inningsRepository.create({
                matchId,
                inningsNumber: dto.inningsNumber,
                battingTeamId: dto.battingTeamId,
                bowlingTeamId: dto.bowlingTeamId,
                totalRuns: 0,
                totalWickets: 0,
                totalBalls: 0,
                currentOver: 0,
                isCompleted: false,
            });
            const savedInnings = await inningsRepository.save(innings);
            match.status = match_entity_1.MatchStatus.LIVE;
            match.currentInnings = dto.inningsNumber;
            await matchRepository.save(match);
            await queryRunner.commitTransaction();
            return savedInnings;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async setBatsmen(inningsId, userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const inningsRepository = queryRunner.manager.getRepository(innings_entity_1.Innings);
            const playerRepository = queryRunner.manager.getRepository(player_entity_1.Player);
            const innings = await inningsRepository.findOne({
                where: { id: inningsId },
            });
            if (!innings) {
                throw new common_1.NotFoundException('Innings not found');
            }
            if (innings.isCompleted) {
                throw new common_1.BadRequestException('Cannot set batsmen for completed innings');
            }
            const striker = await playerRepository.findOne({
                where: { id: dto.strikerId },
            });
            const nonStriker = await playerRepository.findOne({
                where: { id: dto.nonStrikerId },
            });
            if (!striker || !nonStriker) {
                throw new common_1.NotFoundException('One or both players not found');
            }
            if (striker.teamId !== innings.battingTeamId || nonStriker.teamId !== innings.battingTeamId) {
                throw new common_1.BadRequestException('Both batsmen must be from the batting team');
            }
            if (dto.strikerId === dto.nonStrikerId) {
                throw new common_1.BadRequestException('Striker and non-striker must be different players');
            }
            innings.strikerId = dto.strikerId;
            innings.nonStrikerId = dto.nonStrikerId;
            await inningsRepository.save(innings);
            await queryRunner.commitTransaction();
            return innings;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async setBowler(inningsId, userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const inningsRepository = queryRunner.manager.getRepository(innings_entity_1.Innings);
            const playerRepository = queryRunner.manager.getRepository(player_entity_1.Player);
            const innings = await inningsRepository.findOne({
                where: { id: inningsId },
            });
            if (!innings) {
                throw new common_1.NotFoundException('Innings not found');
            }
            if (innings.isCompleted) {
                throw new common_1.BadRequestException('Cannot set bowler for completed innings');
            }
            const bowler = await playerRepository.findOne({
                where: { id: dto.bowlerId },
            });
            if (!bowler) {
                throw new common_1.NotFoundException('Bowler not found');
            }
            if (bowler.teamId !== innings.bowlingTeamId) {
                throw new common_1.BadRequestException('Bowler must be from the bowling team');
            }
            innings.currentBowlerId = dto.bowlerId;
            await inningsRepository.save(innings);
            await queryRunner.commitTransaction();
            return innings;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getInnings(inningsId) {
        const inningsRepository = this.dataSource.getRepository(innings_entity_1.Innings);
        const innings = await inningsRepository.findOne({
            where: { id: inningsId },
        });
        if (!innings) {
            throw new common_1.NotFoundException('Innings not found');
        }
        return innings;
    }
    async getMatchInnings(matchId) {
        const inningsRepository = this.dataSource.getRepository(innings_entity_1.Innings);
        const innings = await inningsRepository.find({
            where: { matchId },
            order: { inningsNumber: 'ASC' },
        });
        return innings;
    }
};
exports.InningsService = InningsService;
exports.InningsService = InningsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource])
], InningsService);
//# sourceMappingURL=innings.service.js.map