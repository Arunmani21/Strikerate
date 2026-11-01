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
exports.MatchService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const team_entity_1 = require("../team/team.entity");
const team_availability_entity_1 = require("./team-availability.entity");
const match_request_entity_1 = require("./match-request.entity");
const match_entity_1 = require("./match.entity");
const cricket_gateway_1 = require("../../gateway/cricket.gateway");
let MatchService = class MatchService {
    constructor(dataSource, cricketGateway) {
        this.dataSource = dataSource;
        this.cricketGateway = cricketGateway;
    }
    async postTeamAvailability(teamId, userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const teamAvailabilityRepository = queryRunner.manager.getRepository(team_availability_entity_1.TeamAvailability);
            const teamMemberRepository = queryRunner.manager.getRepository('TeamMember');
            const teamMember = await teamMemberRepository.findOne({
                where: { userId, teamId },
            });
            if (!teamMember || (teamMember.role !== 'captain' && teamMember.role !== 'vice_captain' && teamMember.role !== 'manager')) {
                throw new common_1.BadRequestException('Only captain, vice-captain, or manager can post team availability');
            }
            const availability = teamAvailabilityRepository.create({
                teamId,
                postedBy: userId,
                availableDate: new Date(dto.availableDate),
                availableFrom: dto.availableFrom,
                availableUntil: dto.availableUntil,
                venue: dto.venue,
                preferredOvers: dto.preferredOvers,
                notes: dto.notes,
                isOpen: dto.isOpen !== undefined ? dto.isOpen : true,
            });
            const savedAvailability = await teamAvailabilityRepository.save(availability);
            await queryRunner.commitTransaction();
            return savedAvailability;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getAvailableTeams(date) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        try {
            const teamAvailabilityRepository = queryRunner.manager.getRepository(team_availability_entity_1.TeamAvailability);
            const targetDate = new Date(date);
            const availabilities = await teamAvailabilityRepository.find({
                where: { availableDate: targetDate, isOpen: true },
                relations: ['team'],
            });
            return availabilities.map((av) => ({
                id: av.team.id,
                name: av.team.name,
                captainId: av.team.captainId,
                availableFrom: av.availableFrom,
                availableUntil: av.availableUntil,
                venue: av.venue,
                preferredOvers: av.preferredOvers,
                notes: av.notes,
                availabilityId: av.id,
            }));
        }
        finally {
            await queryRunner.release();
        }
    }
    async sendMatchRequest(teamId, userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matchRequestRepository = queryRunner.manager.getRepository(match_request_entity_1.MatchRequest);
            const teamAvailabilityRepository = queryRunner.manager.getRepository(team_availability_entity_1.TeamAvailability);
            const teamRepository = queryRunner.manager.getRepository(team_entity_1.Team);
            const team = await teamRepository.findOne({
                where: { id: teamId },
            });
            if (!team || team.captainId !== userId) {
                throw new common_1.BadRequestException('Only captain can send match requests');
            }
            const opponentAvailability = await teamAvailabilityRepository.findOne({
                where: {
                    teamId: dto.opponentTeamId,
                    availableDate: new Date(dto.matchDate),
                    isOpen: true,
                },
            });
            if (!opponentAvailability) {
                throw new common_1.BadRequestException('Opponent team is not available on this date');
            }
            const existingRequest = await matchRequestRepository.findOne({
                where: {
                    requestingTeamId: teamId,
                    opponentTeamId: dto.opponentTeamId,
                    matchDate: new Date(dto.matchDate),
                    status: match_request_entity_1.MatchRequestStatus.PENDING,
                },
            });
            if (existingRequest) {
                throw new common_1.ConflictException('A pending request already exists between these teams for this date');
            }
            const matchRequest = matchRequestRepository.create({
                requestingTeamId: teamId,
                opponentTeamId: dto.opponentTeamId,
                matchDate: new Date(dto.matchDate),
                matchTime: dto.matchTime,
                venue: dto.venue || opponentAvailability.venue,
                preferredOvers: dto.preferredOvers,
                requestedBy: userId,
                status: match_request_entity_1.MatchRequestStatus.PENDING,
            });
            const savedRequest = await matchRequestRepository.save(matchRequest);
            await queryRunner.commitTransaction();
            return savedRequest;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getTeamMatchRequests(teamId, userId) {
        const teamMemberRepository = this.dataSource.getRepository('TeamMember');
        const membership = await teamMemberRepository.findOne({
            where: { userId, teamId },
        });
        if (!membership) {
            throw new common_1.BadRequestException('You are not a member of this team');
        }
        const matchRequestRepository = this.dataSource.getRepository(match_request_entity_1.MatchRequest);
        return matchRequestRepository.find({
            where: [{ requestingTeamId: teamId }, { opponentTeamId: teamId }],
            relations: ['requestingTeam', 'opponentTeam'],
            order: { createdAt: 'DESC' },
        });
    }
    async respondToMatchRequest(requestId, userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matchRequestRepository = queryRunner.manager.getRepository(match_request_entity_1.MatchRequest);
            const matchRepository = queryRunner.manager.getRepository(match_entity_1.Match);
            const teamAvailabilityRepository = queryRunner.manager.getRepository(team_availability_entity_1.TeamAvailability);
            const matchRequest = await matchRequestRepository.findOne({
                where: { id: requestId },
            });
            if (!matchRequest) {
                throw new common_1.NotFoundException('Match request not found');
            }
            if (matchRequest.status !== match_request_entity_1.MatchRequestStatus.PENDING) {
                throw new common_1.BadRequestException('This match request has already been responded to');
            }
            const teamRepository = queryRunner.manager.getRepository(team_entity_1.Team);
            const team = await teamRepository.findOne({
                where: { id: matchRequest.opponentTeamId },
            });
            if (!team || team.captainId !== userId) {
                throw new common_1.BadRequestException('Only opponent captain can respond to match request');
            }
            if (dto.status === 'confirmed') {
                const match = matchRepository.create({
                    teamAId: matchRequest.requestingTeamId,
                    teamBId: matchRequest.opponentTeamId,
                    matchDate: matchRequest.matchDate,
                    matchTime: matchRequest.matchTime,
                    totalOvers: matchRequest.preferredOvers || 20,
                    venue: matchRequest.venue,
                    matchRequestId: matchRequest.id,
                    createdBy: userId,
                    status: match_entity_1.MatchStatus.SCHEDULED,
                });
                const savedMatch = await matchRepository.save(match);
                await teamAvailabilityRepository.update({
                    teamId: matchRequest.requestingTeamId,
                    availableDate: matchRequest.matchDate,
                }, { isOpen: false });
                await teamAvailabilityRepository.update({
                    teamId: matchRequest.opponentTeamId,
                    availableDate: matchRequest.matchDate,
                }, { isOpen: false });
                matchRequest.status = match_request_entity_1.MatchRequestStatus.CONFIRMED;
                matchRequest.respondedAt = new Date();
                matchRequest.respondedBy = userId;
                await matchRequestRepository.save(matchRequest);
                await queryRunner.commitTransaction();
                return savedMatch;
            }
            else {
                matchRequest.status = match_request_entity_1.MatchRequestStatus.REJECTED;
                matchRequest.respondedAt = new Date();
                matchRequest.respondedBy = userId;
                await matchRequestRepository.save(matchRequest);
                await queryRunner.commitTransaction();
                return { message: 'Match request rejected' };
            }
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async recordToss(matchId, userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const matchRepository = queryRunner.manager.getRepository(match_entity_1.Match);
            const match = await matchRepository.findOne({
                where: { id: matchId },
            });
            if (!match) {
                throw new common_1.NotFoundException('Match not found');
            }
            if (match.status !== match_entity_1.MatchStatus.SCHEDULED) {
                throw new common_1.BadRequestException('Toss can only be recorded for scheduled matches');
            }
            if (dto.tossWinnerId !== match.teamAId && dto.tossWinnerId !== match.teamBId) {
                throw new common_1.BadRequestException('Toss winner must be one of the match teams');
            }
            const teamRepository = queryRunner.manager.getRepository(team_entity_1.Team);
            const team = await teamRepository.findOne({
                where: { id: dto.tossWinnerId },
            });
            if (!team || team.captainId !== userId) {
                throw new common_1.BadRequestException('Only captain can record toss for their team');
            }
            match.tossWinnerId = dto.tossWinnerId;
            match.tossChoice = dto.tossChoice;
            match.status = match_entity_1.MatchStatus.TOSS_DONE;
            await matchRepository.save(match);
            await queryRunner.commitTransaction();
            const tossTeams = await this.dataSource.getRepository(team_entity_1.Team).find({
                where: [{ id: match.teamAId }, { id: match.teamBId }],
            });
            const tossTeamName = (teamId) => tossTeams.find(t => t.id === teamId)?.name || '';
            this.cricketGateway.emitTossResult(matchId, {
                tossWinner: {
                    id: match.tossWinnerId,
                    name: tossTeamName(match.tossWinnerId),
                },
                tossChoice: match.tossChoice,
                teamA: { id: match.teamAId, name: tossTeamName(match.teamAId) },
                teamB: { id: match.teamBId, name: tossTeamName(match.teamBId) },
            });
            return match;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getMatch(matchId) {
        const matchRepository = this.dataSource.getRepository(match_entity_1.Match);
        const match = await matchRepository.findOne({
            where: { id: matchId },
            relations: ['teamA', 'teamB'],
        });
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
        }
        return match;
    }
    async getLiveMatches() {
        const matchRepository = this.dataSource.getRepository(match_entity_1.Match);
        const matches = await matchRepository.find({
            where: [{ status: match_entity_1.MatchStatus.LIVE }, { status: match_entity_1.MatchStatus.TOSS_DONE }],
            relations: ['teamA', 'teamB'],
            order: { matchDate: 'ASC', matchTime: 'ASC' },
        });
        return matches;
    }
    async getUpcomingMatches(teamId) {
        const matchRepository = this.dataSource.getRepository(match_entity_1.Match);
        const matches = await matchRepository.find({
            where: [
                { status: match_entity_1.MatchStatus.SCHEDULED },
                { teamAId: teamId },
            ],
            relations: ['teamA', 'teamB', 'matchRequest'],
            order: { matchDate: 'ASC', matchTime: 'ASC' },
        });
        return matches;
    }
};
exports.MatchService = MatchService;
exports.MatchService = MatchService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        cricket_gateway_1.CricketGateway])
], MatchService);
//# sourceMappingURL=match.service.js.map