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
exports.ScoringService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const ball_entity_1 = require("./ball.entity");
const innings_entity_1 = require("../innings/innings.entity");
const match_entity_1 = require("../match/match.entity");
const player_entity_1 = require("../player/player.entity");
const team_entity_1 = require("../team/team.entity");
const playing11_entity_1 = require("../playing11/playing11.entity");
const cricket_gateway_1 = require("../../gateway/cricket.gateway");
const scorer_transfer_service_1 = require("./scorer-transfer.service");
let ScoringService = class ScoringService {
    constructor(dataSource, cricketGateway, scorerTransferService) {
        this.dataSource = dataSource;
        this.cricketGateway = cricketGateway;
        this.scorerTransferService = scorerTransferService;
    }
    async deliverBall(userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const ballRepository = queryRunner.manager.getRepository(ball_entity_1.Ball);
            const inningsRepository = queryRunner.manager.getRepository(innings_entity_1.Innings);
            const matchRepository = queryRunner.manager.getRepository(match_entity_1.Match);
            const playerRepository = queryRunner.manager.getRepository(player_entity_1.Player);
            const teamRepository = queryRunner.manager.getRepository(team_entity_1.Team);
            const innings = await inningsRepository.findOne({
                where: { id: dto.inningsId },
            });
            if (!innings) {
                throw new common_1.NotFoundException('Innings not found');
            }
            if (innings.isCompleted) {
                throw new common_1.BadRequestException('Innings is completed');
            }
            const match = await matchRepository.findOne({
                where: { id: innings.matchId },
            });
            if (!match) {
                throw new common_1.NotFoundException('Match not found');
            }
            const scheduledStatuses = [match_entity_1.MatchStatus.SCHEDULED, match_entity_1.MatchStatus.TOSS_DONE];
            if (match.status !== match_entity_1.MatchStatus.LIVE && !scheduledStatuses.includes(match.status)) {
                throw new common_1.BadRequestException('Match is not live');
            }
            const canScore = await this.scorerTransferService.canUserScore(match.id, userId);
            if (!canScore) {
                throw new common_1.ForbiddenException('You do not have permission to score this match');
            }
            const batsman = await playerRepository.findOne({
                where: { id: dto.batsmanId },
            });
            const bowler = await playerRepository.findOne({
                where: { id: dto.bowlerId },
            });
            if (!batsman || !bowler) {
                throw new common_1.NotFoundException('Batsman or bowler not found');
            }
            if (batsman.teamId !== innings.battingTeamId) {
                throw new common_1.BadRequestException('Batsman must be from batting team');
            }
            if (bowler.teamId !== innings.bowlingTeamId) {
                throw new common_1.BadRequestException('Bowler must be from bowling team');
            }
            if (dto.isWicket && !dto.wicketType) {
                throw new common_1.BadRequestException('Wicket type is required when isWicket is true');
            }
            if (dto.wicketType === ball_entity_1.DismissalType.RUNOUT && !dto.dismissedPlayerId) {
                throw new common_1.BadRequestException('Dismissed player ID is required for run out');
            }
            const isExtra = dto.isWide || dto.isNoBall;
            const isBye = dto.isBye || dto.isLegBye;
            const legalBallCount = isExtra ? 0 : 1;
            const countsAsBallFaced = !dto.isWide;
            const batsmanRuns = isBye || dto.isWide ? 0 : dto.runs;
            const totalRuns = dto.runs + (dto.extraRuns || 0) + (dto.isWide ? 1 : 0) + (dto.isNoBall ? 1 : 0);
            const bowlerRuns = dto.isWide
                ? totalRuns
                : dto.isNoBall
                    ? 1 + (dto.extraRuns || 0)
                    : isBye
                        ? 0
                        : dto.runs;
            batsman.battingRuns += batsmanRuns;
            if (countsAsBallFaced) {
                batsman.battingBalls += 1;
            }
            if (batsmanRuns === 4)
                batsman.battingFours++;
            if (batsmanRuns === 6)
                batsman.battingSixes++;
            if (batsman.battingBalls > 0) {
                batsman.battingStrikeRate = (batsman.battingRuns / batsman.battingBalls) * 100;
            }
            bowler.bowlingRuns += bowlerRuns;
            bowler.bowlingBalls += legalBallCount;
            if (bowler.bowlingBalls > 0) {
                bowler.bowlingEconomy = bowler.bowlingRuns / (bowler.bowlingBalls / 6);
            }
            let dismissedPlayer = null;
            if (dto.isWicket) {
                if (dto.wicketType === ball_entity_1.DismissalType.RUNOUT) {
                    dismissedPlayer = await playerRepository.findOne({
                        where: { id: dto.dismissedPlayerId },
                    });
                    if (!dismissedPlayer) {
                        throw new common_1.NotFoundException('Dismissed player not found');
                    }
                    dismissedPlayer.isOut = true;
                }
                else {
                    batsman.isOut = true;
                    dismissedPlayer = batsman;
                }
                if (dto.wicketType !== ball_entity_1.DismissalType.RUNOUT) {
                    bowler.bowlingWickets++;
                }
                innings.totalWickets++;
            }
            const shouldSwapStrike = dto.runs % 2 === 1;
            const currentBallsInOver = innings.totalBalls % 6;
            const overOfThisBall = innings.currentOver;
            const isOverComplete = currentBallsInOver === 5 && !isExtra;
            if (isOverComplete) {
                innings.currentOver++;
            }
            if (shouldSwapStrike) {
                const temp = innings.strikerId;
                innings.strikerId = innings.nonStrikerId;
                innings.nonStrikerId = temp;
            }
            if (isOverComplete) {
                const temp = innings.strikerId;
                innings.strikerId = innings.nonStrikerId;
                innings.nonStrikerId = temp;
            }
            innings.totalBalls += legalBallCount;
            innings.totalRuns += totalRuns;
            let matchCompleted = false;
            let inningsCompleted = false;
            let matchStarted = false;
            const maxOvers = match.totalOvers;
            const totalBallsBowled = innings.totalBalls;
            const totalOversBowled = Math.floor(totalBallsBowled / 6);
            if (scheduledStatuses.includes(match.status)) {
                if (totalBallsBowled > 0) {
                    match.status = match_entity_1.MatchStatus.LIVE;
                    match.statusChangedAt = new Date();
                    match.statusChangedBy = userId;
                    matchStarted = true;
                }
            }
            const maxWickets = await this.getMaxWickets(queryRunner, match.id, innings.battingTeamId);
            if (innings.totalWickets >= maxWickets || totalOversBowled >= maxOvers) {
                innings.isCompleted = true;
                inningsCompleted = true;
                if (match.currentInnings === 2) {
                    matchCompleted = true;
                    match.statusChangedAt = new Date();
                    match.statusChangedBy = userId;
                    const targetRuns = match.target + 1;
                    if (innings.totalRuns >= targetRuns) {
                        const battingTeam = await teamRepository.findOne({
                            where: { id: innings.battingTeamId },
                        });
                        match.status = match_entity_1.MatchStatus.COMPLETED;
                        match.winningTeamId = innings.battingTeamId;
                        match.marginOfVictory = `${maxWickets - innings.totalWickets} wickets`;
                        match.marginType = 'wickets';
                        match.result = `${battingTeam?.name || 'Batting team'} won by ${maxWickets - innings.totalWickets} wickets`;
                    }
                    else if (innings.totalRuns < match.target) {
                        const otherTeamId = match.teamAId === innings.battingTeamId ? match.teamBId : match.teamAId;
                        const bowlingTeam = await teamRepository.findOne({
                            where: { id: otherTeamId },
                        });
                        match.status = match_entity_1.MatchStatus.COMPLETED;
                        match.winningTeamId = otherTeamId;
                        match.marginOfVictory = `${match.target - innings.totalRuns} runs`;
                        match.marginType = 'runs';
                        match.result = `${bowlingTeam?.name || 'Bowling team'} won by ${match.target - innings.totalRuns} runs`;
                    }
                    else {
                        match.status = match_entity_1.MatchStatus.TIED;
                        match.result = 'Match tied - Scores are level';
                    }
                }
                else {
                    match.status = match_entity_1.MatchStatus.INNINGS_BREAK;
                    match.statusChangedAt = new Date();
                    match.statusChangedBy = userId;
                    match.target = innings.totalRuns;
                    match.currentInnings = 2;
                }
            }
            const ball = ballRepository.create({
                overNumber: overOfThisBall,
                ballNumber: currentBallsInOver + 1,
                runs: dto.runs,
                extraRuns: dto.extraRuns || 0,
                isWide: dto.isWide || false,
                isNoBall: dto.isNoBall || false,
                isBye: dto.isBye || false,
                isLegBye: dto.isLegBye || false,
                isWicket: dto.isWicket || false,
                wicketType: dto.wicketType,
                inningsId: dto.inningsId,
                matchId: match.id,
                batsmanId: dto.batsmanId,
                bowlerId: dto.bowlerId,
                dismissedPlayerId: dto.dismissedPlayerId,
                commentary: dto.commentary,
            });
            const savedBall = await ballRepository.save(ball);
            await playerRepository.save(batsman);
            await playerRepository.save(bowler);
            if (dismissedPlayer && dismissedPlayer.id !== batsman.id) {
                await playerRepository.save(dismissedPlayer);
            }
            await inningsRepository.save(innings);
            await matchRepository.save(match);
            await queryRunner.commitTransaction();
            const readPlayerRepository = this.dataSource.getRepository(player_entity_1.Player);
            const [strikerRow, nonStrikerRow] = await Promise.all([
                innings.strikerId
                    ? readPlayerRepository.findOne({ where: { id: innings.strikerId } })
                    : Promise.resolve(null),
                innings.nonStrikerId
                    ? readPlayerRepository.findOne({ where: { id: innings.nonStrikerId } })
                    : Promise.resolve(null),
            ]);
            const currentRunRate = innings.totalBalls > 0
                ? (innings.totalRuns / innings.totalBalls) * 6
                : 0;
            let requiredRunRate = 0;
            if (match.currentInnings === 2 && match.target > 0) {
                const remainingBalls = (match.totalOvers * 6) - innings.totalBalls;
                const remainingRuns = match.target - innings.totalRuns + 1;
                requiredRunRate = remainingBalls > 0
                    ? (remainingRuns / remainingBalls) * 6
                    : 99.99;
            }
            const completedOvers = Math.floor(innings.totalBalls / 6);
            if (matchStarted) {
                const startingTeams = await this.dataSource.getRepository(team_entity_1.Team).find({
                    where: [{ id: match.teamAId }, { id: match.teamBId }],
                });
                this.cricketGateway.emitMatchStarted(match.id, {
                    matchId: match.id,
                    teamA: {
                        id: match.teamAId,
                        name: startingTeams.find(t => t.id === match.teamAId)?.name || '',
                    },
                    teamB: {
                        id: match.teamBId,
                        name: startingTeams.find(t => t.id === match.teamBId)?.name || '',
                    },
                    totalOvers: match.totalOvers,
                    venue: match.venue || '',
                });
            }
            this.cricketGateway.emitBallUpdated(match.id, {
                overNumber: overOfThisBall,
                ballNumber: currentBallsInOver + 1,
                totalRuns: innings.totalRuns,
                totalWickets: innings.totalWickets,
                currentOvers: completedOvers,
                currentRunRate: parseFloat(currentRunRate.toFixed(2)),
                requiredRunRate: match.currentInnings === 2 ? parseFloat(requiredRunRate.toFixed(2)) : undefined,
                target: match.currentInnings === 2 ? match.target : undefined,
                striker: this.batterBlock(strikerRow),
                nonStriker: this.batterBlock(nonStrikerRow),
                bowler: {
                    id: bowler.id,
                    name: bowler.name,
                    overs: this.oversFromBalls(bowler.bowlingBalls),
                    runs: bowler.bowlingRuns,
                    wickets: bowler.bowlingWickets,
                    economy: this.roundRate(bowler.bowlingEconomy),
                },
                extras: (dto.extraRuns || 0) + (dto.isWide ? 1 : 0) + (dto.isNoBall ? 1 : 0),
                lastBall: this.generateLastBallSummary(dto),
            });
            if (dto.isWicket && dismissedPlayer) {
                this.cricketGateway.emitWicket(match.id, {
                    dismissedPlayer: {
                        id: dismissedPlayer.id,
                        name: dismissedPlayer.name,
                        runs: dismissedPlayer.battingRuns,
                        balls: dismissedPlayer.battingBalls,
                        fours: dismissedPlayer.battingFours,
                        sixes: dismissedPlayer.battingSixes,
                    },
                    wicketType: dto.wicketType,
                    wicketNumber: innings.totalWickets,
                    totalWickets: innings.totalWickets,
                    totalRuns: innings.totalRuns,
                    currentOvers: completedOvers,
                });
            }
            if (isOverComplete) {
                const overBalls = await ballRepository.find({
                    where: {
                        inningsId: dto.inningsId,
                        overNumber: overOfThisBall,
                    },
                });
                const overRuns = overBalls.reduce((sum, ball) => sum + ball.runs + ball.extraRuns + (ball.isWide ? 1 : 0) + (ball.isNoBall ? 1 : 0), 0);
                this.cricketGateway.emitOverComplete(match.id, {
                    overNumber: overOfThisBall,
                    overRuns,
                    totalRuns: innings.totalRuns,
                    totalWickets: innings.totalWickets,
                    currentOvers: completedOvers,
                    currentRunRate: parseFloat(currentRunRate.toFixed(2)),
                    requiredRunRate: match.currentInnings === 2 ? parseFloat(requiredRunRate.toFixed(2)) : undefined,
                    target: match.currentInnings === 2 ? match.target : undefined,
                    bowlerSummary: {
                        bowlerName: bowler.name,
                        overs: this.oversFromBalls(bowler.bowlingBalls),
                        runs: bowler.bowlingRuns,
                        wickets: bowler.bowlingWickets,
                        maidens: 0,
                        economy: this.roundRate(bowler.bowlingEconomy),
                    },
                });
            }
            if (inningsCompleted) {
                const inningsEndTeams = await this.dataSource.getRepository(team_entity_1.Team).find({
                    where: [{ id: innings.battingTeamId }, { id: innings.bowlingTeamId }],
                });
                this.cricketGateway.emitInningsEnd(match.id, {
                    inningsNumber: innings.inningsNumber,
                    totalRuns: innings.totalRuns,
                    totalWickets: innings.totalWickets,
                    totalOvers: completedOvers,
                    target: innings.inningsNumber === 1 ? innings.totalRuns + 1 : undefined,
                    battingTeam: {
                        id: innings.battingTeamId,
                        name: inningsEndTeams.find(t => t.id === innings.battingTeamId)?.name || '',
                    },
                    bowlingTeam: {
                        id: innings.bowlingTeamId,
                        name: inningsEndTeams.find(t => t.id === innings.bowlingTeamId)?.name || '',
                    },
                });
            }
            if (matchCompleted) {
                const [allInnings, resultTeams] = await Promise.all([
                    this.dataSource.getRepository(innings_entity_1.Innings).find({
                        where: { matchId: match.id },
                        order: { inningsNumber: 'ASC' },
                    }),
                    this.dataSource.getRepository(team_entity_1.Team).find({
                        where: [{ id: match.teamAId }, { id: match.teamBId }],
                    }),
                ]);
                const resultTeamName = (teamId) => resultTeams.find(t => t.id === teamId)?.name || '';
                const scoreFor = (battingTeamId) => {
                    const inn = allInnings.find(i => i.battingTeamId === battingTeamId);
                    return {
                        teamName: resultTeamName(battingTeamId),
                        runs: inn?.totalRuns ?? 0,
                        wickets: inn?.totalWickets ?? 0,
                        overs: Math.floor((inn?.totalBalls ?? 0) / 6),
                    };
                };
                this.cricketGateway.emitMatchResult(match.id, {
                    result: match.result,
                    winningTeam: match.winningTeamId
                        ? { id: match.winningTeamId, name: resultTeamName(match.winningTeamId) }
                        : undefined,
                    margin: match.marginOfVictory || undefined,
                    teamAScore: scoreFor(match.teamAId),
                    teamBScore: scoreFor(match.teamBId),
                });
            }
            return {
                ball: savedBall,
                innings: await inningsRepository.findOne({ where: { id: dto.inningsId } }),
                matchCompleted,
                inningsCompleted,
                overCompleted: isOverComplete,
                wicket: dto.isWicket ? {
                    type: dto.wicketType,
                    batsman: dismissedPlayer?.name || batsman.name,
                    bowler: bowler.name,
                } : undefined,
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
    generateLastBallSummary(dto) {
        if (dto.isWicket)
            return `WICKET! ${dto.wicketType}`;
        if (dto.isWide)
            return dto.runs > 0 ? `Wide + ${dto.runs}` : 'Wide';
        if (dto.isNoBall)
            return dto.runs > 0 ? `No ball - ${dto.runs} run(s)` : 'No ball';
        if (dto.runs === 6)
            return 'SIX!';
        if (dto.runs === 4)
            return 'FOUR!';
        if (dto.runs === 0)
            return 'Dot ball';
        return `${dto.runs} run(s)`;
    }
    oversFromBalls(balls) {
        return `${Math.floor(balls / 6)}.${balls % 6}`;
    }
    roundRate(value) {
        const n = Number(value ?? 0);
        return Number.isFinite(n) ? Number(n.toFixed(2)) : 0;
    }
    batterBlock(player) {
        if (!player) {
            return { id: '', name: '', runs: 0, balls: 0, fours: 0, sixes: 0, strikeRate: 0 };
        }
        return {
            id: player.id,
            name: player.name,
            runs: player.battingRuns,
            balls: player.battingBalls,
            fours: player.battingFours,
            sixes: player.battingSixes,
            strikeRate: this.roundRate(player.battingStrikeRate),
        };
    }
    async getMaxWickets(queryRunner, matchId, battingTeamId) {
        const xiSize = await queryRunner.manager
            .getRepository(playing11_entity_1.Playing11)
            .count({ where: { matchId, teamId: battingTeamId } });
        return xiSize > 0 ? xiSize - 1 : 10;
    }
    async getScorecard(matchId) {
        const matchRepository = this.dataSource.getRepository(match_entity_1.Match);
        const inningsRepository = this.dataSource.getRepository(innings_entity_1.Innings);
        const ballRepository = this.dataSource.getRepository(ball_entity_1.Ball);
        const match = await matchRepository.findOne({
            where: { id: matchId },
        });
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
        }
        const innings = await inningsRepository.find({
            where: { matchId },
            order: { inningsNumber: 'ASC' },
        });
        const scorecard = {
            match,
            innings: [],
        };
        for (const inn of innings) {
            const balls = await ballRepository.find({
                where: { inningsId: inn.id },
                order: { overNumber: 'ASC', ballNumber: 'ASC', createdAt: 'ASC' },
            });
            scorecard.innings.push({
                ...inn,
                balls,
            });
        }
        return scorecard;
    }
    async getOverSummary(inningsId) {
        const ballRepository = this.dataSource.getRepository(ball_entity_1.Ball);
        const balls = await ballRepository.find({
            where: { inningsId },
            order: { overNumber: 'ASC', ballNumber: 'ASC', createdAt: 'ASC' },
        });
        const overSummary = {};
        balls.forEach((ball) => {
            if (!overSummary[ball.overNumber]) {
                overSummary[ball.overNumber] = {
                    overNumber: ball.overNumber,
                    balls: [],
                    totalRuns: 0,
                    wickets: 0,
                };
            }
            overSummary[ball.overNumber].balls.push({
                ballNumber: ball.ballNumber,
                runs: ball.runs,
                extraRuns: ball.extraRuns,
                isWide: ball.isWide,
                isNoBall: ball.isNoBall,
                isBye: ball.isBye,
                isLegBye: ball.isLegBye,
                isWicket: ball.isWicket,
            });
            overSummary[ball.overNumber].totalRuns +=
                ball.runs + ball.extraRuns + (ball.isWide ? 1 : 0) + (ball.isNoBall ? 1 : 0);
            if (ball.isWicket)
                overSummary[ball.overNumber].wickets++;
        });
        return Object.values(overSummary);
    }
};
exports.ScoringService = ScoringService;
exports.ScoringService = ScoringService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        cricket_gateway_1.CricketGateway,
        scorer_transfer_service_1.ScorerTransferService])
], ScoringService);
//# sourceMappingURL=scoring.service.js.map