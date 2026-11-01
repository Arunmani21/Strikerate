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
exports.Playing11Service = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const playing11_entity_1 = require("./playing11.entity");
const match_entity_1 = require("../match/match.entity");
const player_entity_1 = require("../player/player.entity");
const player_availability_entity_1 = require("../player/player-availability.entity");
const team_member_entity_1 = require("../team/team-member.entity");
const team_roles_1 = require("../team/team-roles");
const guest_player_entity_1 = require("../player/guest-player.entity");
const team_entity_1 = require("../team/team.entity");
const cricket_gateway_1 = require("../../gateway/cricket.gateway");
let Playing11Service = class Playing11Service {
    constructor(dataSource, cricketGateway) {
        this.dataSource = dataSource;
        this.cricketGateway = cricketGateway;
    }
    async selectPlaying11(matchId, teamId, userId, dto) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const playing11Repository = queryRunner.manager.getRepository(playing11_entity_1.Playing11);
            const matchRepository = queryRunner.manager.getRepository(match_entity_1.Match);
            const playerRepository = queryRunner.manager.getRepository(player_entity_1.Player);
            const playerAvailabilityRepository = queryRunner.manager.getRepository(player_availability_entity_1.PlayerAvailability);
            const teamMemberRepository = queryRunner.manager.getRepository(team_member_entity_1.TeamMember);
            const guestPlayerRepository = queryRunner.manager.getRepository(guest_player_entity_1.GuestPlayer);
            const match = await matchRepository.findOne({
                where: { id: matchId },
            });
            if (!match) {
                throw new common_1.NotFoundException('Match not found');
            }
            if (match.teamAId !== teamId && match.teamBId !== teamId) {
                throw new common_1.BadRequestException('Team is not part of this match');
            }
            const teamMember = await teamMemberRepository.findOne({
                where: { userId, teamId },
            });
            if (!teamMember || (teamMember.role !== team_roles_1.TeamRole.CAPTAIN && teamMember.role !== team_roles_1.TeamRole.VICE_CAPTAIN)) {
                throw new common_1.BadRequestException('Only captain or vice-captain can select playing 11');
            }
            const regularPlayerCount = dto.playerIds?.length || 0;
            const guestPlayerCount = dto.guestPlayerIds?.length || 0;
            const totalPlayers = regularPlayerCount + guestPlayerCount;
            if (totalPlayers !== 11) {
                throw new common_1.BadRequestException(`Exactly 11 players must be selected. You have selected ${totalPlayers} players (${regularPlayerCount} regular + ${guestPlayerCount} guest)`);
            }
            if (dto.playerIds && dto.playerIds.length > 0) {
                const players = await playerRepository.find({
                    where: dto.playerIds.map((id) => ({ id })),
                });
                if (players.length !== dto.playerIds.length) {
                    throw new common_1.BadRequestException('Some regular players do not exist');
                }
                const invalidPlayers = players.filter((p) => p.teamId !== teamId);
                if (invalidPlayers.length > 0) {
                    throw new common_1.BadRequestException('All regular players must belong to the same team');
                }
                const matchDate = new Date(match.matchDate).toISOString().split('T')[0];
                const availabilities = await playerAvailabilityRepository
                    .createQueryBuilder('pa')
                    .where('pa.playerId IN (:...playerIds)', { playerIds: dto.playerIds })
                    .andWhere('pa.availableDate = :matchDate', { matchDate: new Date(matchDate) })
                    .getMany();
                const unavailablePlayers = availabilities
                    .filter((a) => !a.isAvailable)
                    .map((a) => a.playerId);
                if (unavailablePlayers.length > 0) {
                    const unavailablePlayerEntities = await playerRepository.find({
                        where: unavailablePlayers.map((id) => ({ id })),
                    });
                    const unavailableNames = unavailablePlayerEntities.map((p) => p.name);
                    throw new common_1.BadRequestException(`The following players are not available on this date: ${unavailableNames.join(', ')}`);
                }
            }
            const otherTeamId = match.teamAId === teamId ? match.teamBId : match.teamAId;
            const existingPlaying11ForOtherTeam = await playing11Repository
                .createQueryBuilder('playing11')
                .where('playing11.matchId = :matchId', { matchId })
                .andWhere('playing11.teamId = :otherTeamId', { otherTeamId })
                .getMany();
            if (existingPlaying11ForOtherTeam.length > 0) {
                const otherTeamPlayerIds = existingPlaying11ForOtherTeam
                    .filter((p) => !p.isGuest)
                    .map((p) => p.playerId);
                const conflictingPlayers = dto.playerIds?.filter((id) => otherTeamPlayerIds.includes(id));
                if (conflictingPlayers && conflictingPlayers.length > 0) {
                    const conflictingPlayerEntities = await playerRepository.find({
                        where: conflictingPlayers.map((id) => ({ id })),
                    });
                    const conflictingNames = conflictingPlayerEntities.map((p) => p.name);
                    throw new common_1.BadRequestException(`The following players are already in Playing 11 for the opposing team: ${conflictingNames.join(', ')}. A player cannot play for both teams in the same match.`);
                }
            }
            if (dto.guestPlayerIds && dto.guestPlayerIds.length > 0) {
                const guestPlayers = await guestPlayerRepository.find({
                    where: dto.guestPlayerIds.map((id) => ({ id })),
                });
                if (guestPlayers.length !== dto.guestPlayerIds.length) {
                    throw new common_1.BadRequestException('Some guest players do not exist');
                }
                const invalidGuests = guestPlayers.filter((p) => p.teamId !== teamId);
                if (invalidGuests.length > 0) {
                    throw new common_1.BadRequestException('All guest players must belong to the same team');
                }
                const inactiveGuests = guestPlayers.filter((p) => p.status !== 'active');
                if (inactiveGuests.length > 0) {
                    const inactiveNames = inactiveGuests.map((p) => p.name);
                    throw new common_1.BadRequestException(`The following guest players are not active: ${inactiveNames.join(', ')}`);
                }
            }
            await playing11Repository.delete({
                matchId,
                teamId,
            });
            const playing11Records = [];
            if (dto.playerIds && dto.playerIds.length > 0) {
                const regularPlayerRecords = dto.playerIds.map((playerId) => playing11Repository.create({
                    matchId,
                    teamId,
                    playerId,
                    isGuest: false,
                    selectedBy: userId,
                }));
                playing11Records.push(...regularPlayerRecords);
            }
            if (dto.guestPlayerIds && dto.guestPlayerIds.length > 0) {
                const guestPlayerRecords = dto.guestPlayerIds.map((guestPlayerId) => playing11Repository.create({
                    matchId,
                    teamId,
                    playerId: null,
                    isGuest: true,
                    guestPlayerId,
                    selectedBy: userId,
                }));
                playing11Records.push(...guestPlayerRecords);
            }
            await playing11Repository.save(playing11Records);
            await queryRunner.commitTransaction();
            const [scoringTeam, selectedRegulars, selectedGuests] = await Promise.all([
                this.dataSource.getRepository(team_entity_1.Team).findOne({ where: { id: teamId } }),
                dto.playerIds?.length
                    ? this.dataSource.getRepository(player_entity_1.Player).find({ where: dto.playerIds.map((id) => ({ id })) })
                    : Promise.resolve([]),
                dto.guestPlayerIds?.length
                    ? this.dataSource.getRepository(guest_player_entity_1.GuestPlayer).find({ where: dto.guestPlayerIds.map((id) => ({ id })) })
                    : Promise.resolve([]),
            ]);
            this.cricketGateway.emitPlaying11Updated(matchId, {
                teamId,
                teamName: scoringTeam?.name || '',
                players: [
                    ...selectedRegulars.map((p) => ({ id: p.id, name: p.name, jerseyNumber: p.jerseyNumber })),
                    ...selectedGuests.map((g) => ({ id: g.id, name: g.name })),
                ],
            });
            return {
                matchId,
                teamId,
                regularPlayers: dto.playerIds || [],
                guestPlayers: dto.guestPlayerIds || [],
                totalPlayers,
                message: 'Playing 11 selected successfully',
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
    async getPlaying11(matchId, teamId) {
        const playing11Repository = this.dataSource.getRepository(playing11_entity_1.Playing11);
        const playing11 = await playing11Repository.find({
            where: { matchId, teamId },
            relations: ['player', 'guestPlayer'],
        });
        if (playing11.length === 0) {
            throw new common_1.NotFoundException('Playing 11 not found for this team');
        }
        return playing11.map((p) => {
            if (p.isGuest && p.guestPlayer) {
                return {
                    id: p.guestPlayer.id,
                    name: p.guestPlayer.name,
                    isGuest: true,
                    mobile: p.guestPlayer.mobile,
                    battingStyle: p.guestPlayer.battingStyle,
                    bowlingStyle: p.guestPlayer.bowlingStyle,
                    role: p.guestPlayer.role,
                };
            }
            else if (p.player) {
                return {
                    id: p.player.id,
                    name: p.player.name,
                    isGuest: false,
                    jerseyNumber: p.player.jerseyNumber,
                };
            }
            return null;
        }).filter(p => p !== null);
    }
    async getPlaying11Status(matchId) {
        const playing11Repository = this.dataSource.getRepository(playing11_entity_1.Playing11);
        const matchRepository = this.dataSource.getRepository(match_entity_1.Match);
        const match = await matchRepository.findOne({
            where: { id: matchId },
        });
        if (!match) {
            throw new common_1.NotFoundException('Match not found');
        }
        const teamACount = await playing11Repository.count({
            where: { matchId, teamId: match.teamAId },
        });
        const teamBCount = await playing11Repository.count({
            where: { matchId, teamId: match.teamBId },
        });
        return {
            matchId,
            teamAId: match.teamAId,
            teamBId: match.teamBId,
            teamACount,
            teamBCount,
            teamASelected: teamACount === 11,
            teamBSelected: teamBCount === 11,
            bothTeamsSelected: teamACount === 11 && teamBCount === 11,
            readyToStart: teamACount === 11 && teamBCount === 11,
        };
    }
};
exports.Playing11Service = Playing11Service;
exports.Playing11Service = Playing11Service = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectDataSource)()),
    __metadata("design:paramtypes", [typeorm_2.DataSource,
        cricket_gateway_1.CricketGateway])
], Playing11Service);
//# sourceMappingURL=playing11.service.js.map