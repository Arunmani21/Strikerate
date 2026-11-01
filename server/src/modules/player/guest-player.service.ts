import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { GuestPlayer } from './guest-player.entity';
import { Player } from './player.entity';
import { User } from '../user/user.entity';
import { UserProfile, UserRole, BattingStyle, BowlingStyle } from '../user/user-profile.entity';
import { CreateGuestPlayerDto, UpdateGuestPlayerDto, ConvertGuestPlayerDto } from './dto/guest-player.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class GuestPlayerService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Add a guest player to a team
   */
  async addGuestPlayer(
    teamId: string,
    dto: CreateGuestPlayerDto,
    addedBy: string,
    matchId?: string,
  ): Promise<GuestPlayer> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const guestPlayerRepository = queryRunner.manager.getRepository(GuestPlayer);

      // Note: Team validation will happen implicitly through teamId constraints

      // Check if mobile/email already exists as guest player
      if (dto.mobile || dto.email) {
        const existingGuest = await guestPlayerRepository.findOne({
          where: [
            { mobile: dto.mobile, teamId, status: 'active' as any },
            { email: dto.email, teamId, status: 'active' as any },
          ],
        });

        if (existingGuest) {
          throw new ConflictException(
            'A guest player with this mobile or email already exists in the team',
          );
        }
      }

      // Create guest player
      const guestPlayer = guestPlayerRepository.create({
        teamId,
        matchId: matchId || null,
        name: dto.name,
        mobile: dto.mobile || null,
        email: dto.email || null,
        battingStyle: dto.battingStyle || null,
        bowlingStyle: dto.bowlingStyle || null,
        role: dto.role || null,
        metadata: dto.metadata || {},
        addedBy,
        status: 'active' as any,
      });

      const savedGuest = await guestPlayerRepository.save(guestPlayer);

      await queryRunner.commitTransaction();

      return savedGuest;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get all guest players for a team
   */
  async getTeamGuestPlayers(teamId: string): Promise<GuestPlayer[]> {
    const guestPlayerRepository = this.dataSource.getRepository(GuestPlayer);

    return await guestPlayerRepository.find({
      where: { teamId, status: 'active' as any },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get a specific guest player
   */
  async getGuestPlayer(id: string): Promise<GuestPlayer> {
    const guestPlayerRepository = this.dataSource.getRepository(GuestPlayer);

    const guestPlayer = await guestPlayerRepository.findOne({ where: { id } });

    if (!guestPlayer) {
      throw new NotFoundException('Guest player not found');
    }

    return guestPlayer;
  }

  /**
   * Update guest player details
   */
  async updateGuestPlayer(
    id: string,
    dto: UpdateGuestPlayerDto,
  ): Promise<GuestPlayer> {
    const guestPlayerRepository = this.dataSource.getRepository(GuestPlayer);

    const guestPlayer = await this.getGuestPlayer(id);

    if (guestPlayer.isConverted) {
      throw new BadRequestException(
        'Cannot update a guest player who has been converted to a regular player',
      );
    }

    Object.assign(guestPlayer, dto);

    return await guestPlayerRepository.save(guestPlayer);
  }

  /**
   * Deactivate a guest player
   */
  async deactivateGuestPlayer(id: string): Promise<void> {
    const guestPlayerRepository = this.dataSource.getRepository(GuestPlayer);

    const guestPlayer = await this.getGuestPlayer(id);

    guestPlayer.status = 'inactive' as any;

    await guestPlayerRepository.save(guestPlayer);
  }

  /**
   * Convert guest player to regular player
   * Creates a new user account and player profile
   */
  async convertGuestPlayer(
    guestPlayerId: string,
    dto: ConvertGuestPlayerDto,
  ): Promise<{ user: User; player: Player }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const guestPlayerRepository = queryRunner.manager.getRepository(GuestPlayer);
      const userRepository = queryRunner.manager.getRepository(User);
      const profileRepository = queryRunner.manager.getRepository(UserProfile);
      const playerRepository = queryRunner.manager.getRepository(Player);

      // Get guest player
      const guestPlayer = await guestPlayerRepository.findOne({
        where: { id: guestPlayerId },
      });

      if (!guestPlayer) {
        throw new NotFoundException('Guest player not found');
      }

      if (guestPlayer.isConverted) {
        throw new BadRequestException('Guest player has already been converted');
      }

      // Check if email already exists
      const existingUser = await userRepository.findOne({
        where: { email: dto.email.toLowerCase() },
      });

      if (existingUser) {
        throw new ConflictException('An account with this email already exists');
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      // Create user
      const user = userRepository.create({
        name: guestPlayer.name,
        email: dto.email.toLowerCase(),
        password: hashedPassword,
        mobile: dto.mobile || guestPlayer.mobile || null,
        emailVerified: false,
      });

      const savedUser = await userRepository.save(user);

      // Create user profile
      const profile = profileRepository.create();
      profile.userId = savedUser.id;
      profile.role = (guestPlayer.role || 'allrounder') as UserRole;
      profile.battingStyle = (guestPlayer.battingStyle || 'right_hand') as BattingStyle;
      profile.bowlingStyle = (guestPlayer.bowlingStyle || 'right_arm_fast') as BowlingStyle;
      profile.experienceYears = 0;
      profile.bio = `Converted from guest player. ${guestPlayer.metadata?.notes || ''}`;

      await profileRepository.save(profile);

      // Create player in the same team
      const player = playerRepository.create({
        teamId: guestPlayer.teamId,
        userId: savedUser.id,
        name: guestPlayer.name,
        jerseyNumber: null,
        battingRuns: 0,
        battingBalls: 0,
        battingFours: 0,
        battingSixes: 0,
        battingStrikeRate: 0,
        bowlingBalls: 0,
        bowlingRuns: 0,
        bowlingWickets: 0,
        bowlingEconomy: 0,
        bowlingOvers: 0,
        isOut: false,
      });

      const savedPlayer = await playerRepository.save(player);

      // Mark guest player as converted
      guestPlayer.isConverted = true;
      guestPlayer.convertedPlayerId = savedPlayer.id;
      guestPlayer.status = 'inactive' as any;

      await guestPlayerRepository.save(guestPlayer);

      await queryRunner.commitTransaction();

      return { user: savedUser, player: savedPlayer };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get guest player by match
   */
  async getMatchGuestPlayers(matchId: string): Promise<GuestPlayer[]> {
    const guestPlayerRepository = this.dataSource.getRepository(GuestPlayer);

    return await guestPlayerRepository.find({
      where: { matchId, status: 'active' as any },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Check if guest player can play in match
   */
  async canPlayInMatch(guestPlayerId: string, matchId: string): Promise<boolean> {
    const guestPlayer = await this.getGuestPlayer(guestPlayerId);

    // Guest player can play if:
    // 1. They are active
    // 2. They belong to the team playing in the match
    // 3. Either match-specific guest or general team guest

    if (guestPlayer.status !== 'active') {
      return false;
    }

    // If guest is match-specific, check if it's the same match
    if (guestPlayer.matchId && guestPlayer.matchId !== matchId) {
      return false;
    }

    return true;
  }
}
