import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async createProfile(userId: string, dto: CreateProfileDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const profileRepository = queryRunner.manager.getRepository(UserProfile);

      // Check if profile exists
      const existingProfile = await profileRepository.findOne({
        where: { userId },
      });

      if (existingProfile) {
        throw new BadRequestException(
          'Profile already exists. Use PATCH to update.',
        );
      }

      // Validate input combinations
      this.validateProfileInput(dto);

      // Trim bio if provided
      const processedDto = {
        ...dto,
        bio: dto.bio?.trim(),
      };

      const profile = profileRepository.create({
        userId,
        ...processedDto,
      });

      const savedProfile = await profileRepository.save(profile);

      await queryRunner.commitTransaction();

      return savedProfile;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateProfile(userId: string, dto: CreateProfileDto) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const profileRepository = queryRunner.manager.getRepository(UserProfile);

      const profile = await profileRepository.findOne({
        where: { userId },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }

      // Validate input combinations
      this.validateProfileInput(dto);

      // Trim bio if provided
      const processedDto = {
        ...dto,
        bio: dto.bio?.trim(),
      };

      // Update profile
      Object.assign(profile, processedDto);

      const savedProfile = await profileRepository.save(profile);

      await queryRunner.commitTransaction();

      return savedProfile;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getProfile(userId: string) {
    const profileRepository = this.dataSource.getRepository(UserProfile);

    const profile = await profileRepository.findOne({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  private validateProfileInput(dto: CreateProfileDto): void {
    // Validate logical combinations
    if (dto.role && dto.battingStyle && dto.bowlingStyle) {
      if (dto.role === 'batsman' && dto.bowlingStyle) {
        throw new BadRequestException(
          'Batsman should not have a bowling style',
        );
      }
      if (dto.role === 'bowler' && dto.battingStyle) {
        throw new BadRequestException(
          'Bowler should not have a batting style',
        );
      }
    }

    // Validate experience years consistency
    if (dto.experienceYears !== undefined && dto.experienceYears < 0) {
      throw new BadRequestException(
        'Experience years cannot be negative',
      );
    }

    // Validate bio length after trimming
    if (dto.bio && dto.bio.trim().length === 0) {
      throw new BadRequestException('Bio cannot be empty or just whitespace');
    }
  }
}
