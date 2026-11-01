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
exports.StatsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const player_match_performance_entity_1 = require("./player-match-performance.entity");
const player_career_stats_entity_1 = require("./player-career-stats.entity");
const team_match_history_entity_1 = require("./team-match-history.entity");
const match_entity_1 = require("../match/match.entity");
const innings_entity_1 = require("../innings/innings.entity");
const ball_entity_1 = require("../scoring/ball.entity");
const playing11_entity_1 = require("../playing11/playing11.entity");
const player_entity_1 = require("../player/player.entity");
const match_permission_service_1 = require("../../common/match-permission.service");
let StatsService = class StatsService {
    constructor(dataSource, matchPermission) {
        this.dataSource = dataSource;
        this.matchPermission = matchPermission;
    }
    async calculateMatchPerformance(matchId, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matchRepository = queryRunner.manager.getRepository(match_entity_1.Match);
            const inningsRepository = queryRunner.manager.getRepository(innings_entity_1.Innings);
            const ballRepository = queryRunner.manager.getRepository(ball_entity_1.Ball);
            const playing11Repository = queryRunner.manager.getRepository(playing11_entity_1.Playing11);
            const performanceRepository = queryRunner.manager.getRepository(player_match_performance_entity_1.PlayerMatchPerformance);
            const careerStatsRepository = queryRunner.manager.getRepository(player_career_stats_entity_1.PlayerCareerStats);
            const teamHistoryRepository = queryRunner.manager.getRepository(team_match_history_entity_1.TeamMatchHistory);
            const playerRepository = queryRunner.manager.getRepository(player_entity_1.Player);
            const match = await matchRepository.findOne({
                where: { id: matchId },
            });
            if (!match) {
                throw new common_1.NotFoundException('Match not found');
            }
            if (match.status !== match_entity_1.MatchStatus.COMPLETED) {
                throw new common_1.BadRequestException('Match must be completed before calculating stats');
            }
            await this.matchPermission.assertCanManage(matchId, userId);
            const innings = await inningsRepository.find({
                where: { matchId },
                order: { inningsNumber: 'ASC' },
            });
            const teamAPlaying11 = await playing11Repository.find({
                where: { matchId, teamId: match.teamAId },
                relations: ['player'],
            });
            const teamBPlaying11 = await playing11Repository.find({
                where: { matchId, teamId: match.teamBId },
                relations: ['player'],
            });
            for (const playing11 of [...teamAPlaying11, ...teamBPlaying11]) {
                const player = playing11.player;
                const battingBalls = await ballRepository.find({
                    where: { matchId, batsmanId: player.id },
                });
                const bowlingBalls = await ballRepository.find({
                    where: { matchId, bowlerId: player.id },
                });
                const runsScored = battingBalls.reduce((sum, ball) => {
                    if (ball.isBye || ball.isLegBye)
                        return sum;
                    return sum + ball.runs;
                }, 0);
                const ballsFaced = battingBalls.filter((ball) => !ball.isWide && !ball.isNoBall).length;
                const fours = battingBalls.filter((ball) => ball.runs === 4 && !ball.isBye && !ball.isLegBye).length;
                const sixes = battingBalls.filter((ball) => ball.runs === 6 && !ball.isBye && !ball.isLegBye).length;
                const strikeRate = ballsFaced > 0 ? (runsScored / ballsFaced) * 100 : 0;
                const dismissalBall = battingBalls.find((ball) => ball.isWicket && ball.dismissedPlayerId === player.id);
                const isOut = !!dismissalBall;
                const wicketType = dismissalBall?.wicketType;
                const legalBallsBowled = bowlingBalls.filter((ball) => !ball.isWide && !ball.isNoBall).length;
                const oversBowled = legalBallsBowled / 6;
                const runsConceded = bowlingBalls.reduce((sum, ball) => sum + ball.runs + (ball.isWide ? 1 : 0) + (ball.isNoBall ? 1 : 0), 0);
                const wicketsTaken = bowlingBalls.filter((ball) => ball.isWicket && ball.wicketType !== 'runout').length;
                const economy = oversBowled > 0 ? runsConceded / oversBowled : 0;
                const wides = bowlingBalls.filter((ball) => ball.isWide).length;
                const noBalls = bowlingBalls.filter((ball) => ball.isNoBall).length;
                const maidens = await this.calculateMaidens(innings, player.id, queryRunner);
                let performance = await performanceRepository.findOne({
                    where: { playerId: player.id, matchId },
                });
                if (!performance) {
                    performance = performanceRepository.create({
                        playerId: player.id,
                        matchId,
                        teamId: player.teamId,
                    });
                }
                performance.runsScored = runsScored;
                performance.ballsFaced = ballsFaced;
                performance.fours = fours;
                performance.sixes = sixes;
                performance.strikeRate = strikeRate;
                performance.isOut = isOut;
                performance.wicketType = wicketType;
                performance.oversBowled = oversBowled;
                performance.runsConceded = runsConceded;
                performance.wicketsTaken = wicketsTaken;
                performance.economy = economy;
                performance.maidens = maidens;
                performance.wides = wides;
                performance.noBalls = noBalls;
                await performanceRepository.save(performance);
            }
            for (const playing11 of [...teamAPlaying11, ...teamBPlaying11]) {
                await this.recalculateCareerStats(playing11.player.id, queryRunner);
            }
            await this.createTeamMatchHistory(match, innings, queryRunner);
            await queryRunner.commitTransaction();
            return { message: 'Statistics calculated successfully' };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async calculateMaidens(innings, bowlerId, queryRunner) {
        let maidens = 0;
        for (const singleInnings of innings) {
            const balls = await queryRunner.manager.getRepository(ball_entity_1.Ball).find({
                where: { inningsId: singleInnings.id, bowlerId },
                order: { overNumber: 'ASC', ballNumber: 'ASC' },
            });
            const oversMap = new Map();
            for (const ball of balls) {
                if (!ball.isWide && !ball.isNoBall) {
                    if (!oversMap.has(ball.overNumber)) {
                        oversMap.set(ball.overNumber, []);
                    }
                    const totalRuns = ball.runs + (ball.isBye || ball.isLegBye ? ball.extraRuns || 0 : 0);
                    oversMap.get(ball.overNumber).push(totalRuns);
                }
            }
            for (const [, runs] of oversMap) {
                const overTotal = runs.reduce((sum, r) => sum + r, 0);
                if (overTotal === 0) {
                    maidens++;
                }
            }
        }
        return maidens;
    }
    async recalculateCareerStats(playerId, queryRunner) {
        const careerStatsRepository = queryRunner.manager.getRepository(player_career_stats_entity_1.PlayerCareerStats);
        const performanceRepository = queryRunner.manager.getRepository(player_match_performance_entity_1.PlayerMatchPerformance);
        const playerRepository = queryRunner.manager.getRepository(player_entity_1.Player);
        const player = await playerRepository.findOne({
            where: { id: playerId },
        });
        if (!player) {
            throw new common_1.NotFoundException('Player not found');
        }
        const performances = await performanceRepository.find({ where: { playerId } });
        let careerStats = await careerStatsRepository.findOne({
            where: { playerId },
        });
        if (!careerStats) {
            careerStats = careerStatsRepository.create({
                playerId,
                userId: player.userId || '',
            });
        }
        const batted = performances.filter((p) => p.ballsFaced > 0);
        const totalRuns = performances.reduce((sum, p) => sum + p.runsScored, 0);
        const totalBallsFaced = batted.reduce((sum, p) => sum + p.ballsFaced, 0);
        const totalNotOuts = batted.filter((p) => !p.isOut).length;
        careerStats.totalMatches = performances.length;
        careerStats.totalInnings = batted.length;
        careerStats.totalRuns = totalRuns;
        careerStats.highestScore = performances.reduce((max, p) => Math.max(max, p.runsScored), 0);
        careerStats.totalFours = performances.reduce((sum, p) => sum + p.fours, 0);
        careerStats.totalSixes = performances.reduce((sum, p) => sum + p.sixes, 0);
        careerStats.totalFifties = performances.filter((p) => p.runsScored >= 50 && p.runsScored < 100).length;
        careerStats.totalHundreds = performances.filter((p) => p.runsScored >= 100).length;
        careerStats.totalNotOuts = totalNotOuts;
        careerStats.totalDucks = performances.filter((p) => p.runsScored === 0 && p.isOut).length;
        const dismissals = careerStats.totalInnings - careerStats.totalNotOuts;
        careerStats.careerBattingAvg = dismissals > 0 ? totalRuns / dismissals : 0;
        careerStats.careerStrikeRate = totalBallsFaced > 0 ? (totalRuns / totalBallsFaced) * 100 : 0;
        careerStats.totalWickets = performances.reduce((sum, p) => sum + p.wicketsTaken, 0);
        careerStats.totalOversBowled = performances.reduce((sum, p) => sum + Number(p.oversBowled), 0);
        careerStats.totalRunsConceded = performances.reduce((sum, p) => sum + p.runsConceded, 0);
        careerStats.totalMaidens = performances.reduce((sum, p) => sum + p.maidens, 0);
        const bowlingFigures = performances.filter((p) => p.wicketsTaken > 0);
        if (bowlingFigures.length > 0) {
            const best = bowlingFigures.reduce((best, p) => p.wicketsTaken > best.wicketsTaken ||
                (p.wicketsTaken === best.wicketsTaken && p.runsConceded < best.runsConceded)
                ? p
                : best);
            careerStats.bestBowling = `${best.wicketsTaken}/${best.runsConceded}`;
        }
        else {
            careerStats.bestBowling = null;
        }
        careerStats.fiveWicketHauls = performances.filter((p) => p.wicketsTaken >= 5).length;
        careerStats.careerEconomy =
            Number(careerStats.totalOversBowled) > 0
                ? careerStats.totalRunsConceded / Number(careerStats.totalOversBowled)
                : 0;
        careerStats.updatedAt = new Date();
        await careerStatsRepository.save(careerStats);
    }
    async createTeamMatchHistory(match, innings, queryRunner) {
        const teamHistoryRepository = queryRunner.manager.getRepository(team_match_history_entity_1.TeamMatchHistory);
        const teamAInnings = innings.find((inn) => inn.battingTeamId === match.teamAId);
        const teamBInnings = innings.find((inn) => inn.battingTeamId === match.teamBId);
        let teamAResult;
        let teamBResult;
        if (match.winningTeamId === match.teamAId) {
            teamAResult = 'won';
            teamBResult = 'lost';
        }
        else if (match.winningTeamId === match.teamBId) {
            teamAResult = 'lost';
            teamBResult = 'won';
        }
        else if (match.result?.toLowerCase().includes('tied')) {
            teamAResult = 'tied';
            teamBResult = 'tied';
        }
        else {
            teamAResult = 'abandoned';
            teamBResult = 'abandoned';
        }
        const upsertHistory = async (teamId, opponentId, result, own, opp) => {
            let row = await teamHistoryRepository.findOne({
                where: { teamId, matchId: match.id },
            });
            if (!row) {
                row = teamHistoryRepository.create({ teamId, matchId: match.id, opponentId });
            }
            row.result = result;
            row.matchDate = match.matchDate;
            row.runsScored = own?.totalRuns || 0;
            row.wicketsLost = own?.totalWickets || 0;
            row.oversPlayed = own ? own.totalBalls / 6 : 0;
            row.runsConceded = opp?.totalRuns || 0;
            row.wicketsTaken = opp?.totalWickets || 0;
            await teamHistoryRepository.save(row);
        };
        await upsertHistory(match.teamAId, match.teamBId, teamAResult, teamAInnings, teamBInnings);
        await upsertHistory(match.teamBId, match.teamAId, teamBResult, teamBInnings, teamAInnings);
    }
    async getPlayerCareerStats(playerId) {
        const careerStatsRepository = this.dataSource.getRepository(player_career_stats_entity_1.PlayerCareerStats);
        const stats = await careerStatsRepository.findOne({
            where: { playerId },
        });
        if (!stats) {
            throw new common_1.NotFoundException('Career stats not found for this player');
        }
        return stats;
    }
    async getPlayerMatchHistory(playerId) {
        const performanceRepository = this.dataSource.getRepository(player_match_performance_entity_1.PlayerMatchPerformance);
        const performances = await performanceRepository.find({
            where: { playerId },
            relations: ['match'],
            order: { createdAt: 'DESC' },
        });
        return performances;
    }
    async getMatchPerformances(matchId) {
        const performanceRepository = this.dataSource.getRepository(player_match_performance_entity_1.PlayerMatchPerformance);
        const performances = await performanceRepository.find({
            where: { matchId },
            relations: ['player', 'team'],
        });
        return performances;
    }
    async getTeamHistory(teamId) {
        const teamHistoryRepository = this.dataSource.getRepository(team_match_history_entity_1.TeamMatchHistory);
        const history = await teamHistoryRepository.find({
            where: { teamId },
            relations: ['match', 'opponent'],
            order: { matchDate: 'DESC' },
        });
        return history;
    }
    async setPlayerOfMatch(matchId, playerId, userId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const performanceRepository = queryRunner.manager.getRepository(player_match_performance_entity_1.PlayerMatchPerformance);
            await this.matchPermission.assertCanManage(matchId, userId);
            await performanceRepository.update({ matchId }, { isPlayerOfMatch: false });
            const result = await performanceRepository.update({ matchId, playerId }, { isPlayerOfMatch: true });
            if (result.affected === 0) {
                throw new common_1.NotFoundException('Performance not found for this player in this match');
            }
            await queryRunner.commitTransaction();
            return { message: 'Player of match updated successfully' };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
};
exports.StatsService = StatsService;
exports.StatsService = StatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        match_permission_service_1.MatchPermissionService])
], StatsService);
//# sourceMappingURL=stats.service.js.map