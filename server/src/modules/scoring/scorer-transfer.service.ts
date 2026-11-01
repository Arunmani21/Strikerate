import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { ScorerPermission, ScorerRole, TransferStatus } from './scorer-permission.entity';
import { User } from '../user/user.entity';
import { Match } from '../match/match.entity';
import { TeamMember } from '../team/team-member.entity';
import { TeamRole } from '../team/team-roles';
import {
  TransferScorerDto,
  AcceptScorerTransferDto,
  RejectScorerTransferDto,
  RevokeScorerAccessDto,
  GrantScorerAccessDto,
  UpdateScorerRoleDto,
} from './dto/scorer-transfer.dto';

@Injectable()
export class ScorerTransferService {
  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  /**
   * Transfer scoring permissions to another user
   * This is the main "Transfer Scorer" functionality
   */
  async transferScorer(
    matchId: string,
    fromUserId: string,
    dto: TransferScorerDto,
  ): Promise<{ transfer: ScorerPermission; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const scorerPermissionRepository = queryRunner.manager.getRepository(ScorerPermission);
      const matchRepository = queryRunner.manager.getRepository(Match);
      const userRepository = queryRunner.manager.getRepository(User);
      const teamMemberRepository = queryRunner.manager.getRepository(TeamMember);

      // Verify match exists
      const match = await matchRepository.findOne({ where: { id: matchId } });
      if (!match) {
        throw new NotFoundException('Match not found');
      }

      // Verify current user has scoring permissions (captains/VCs qualify
      // via canUserScore even without a permission row)
      const mayScore = await this.canUserScore(matchId, fromUserId);
      if (!mayScore) {
        throw new BadRequestException('You do not have active scoring permissions for this match');
      }

      // Verify target user exists
      const targetUser = await userRepository.findOne({
        where: { id: dto.transferToUserId },
      });

      if (!targetUser) {
        throw new NotFoundException('Target user not found');
      }

      // Verify target user is part of either team playing the match
      const isTeamMember = await teamMemberRepository.findOne({
        where: [
          { userId: dto.transferToUserId, teamId: match.teamAId },
          { userId: dto.transferToUserId, teamId: match.teamBId },
        ],
      });

      if (!isTeamMember) {
        throw new BadRequestException('Target user must be a member of one of the teams playing this match');
      }

      // Check if target user already has active scoring permissions
      const existingPermissions = await scorerPermissionRepository.findOne({
        where: {
          matchId,
          userId: dto.transferToUserId,
          isActive: true,
        },
      });

      if (existingPermissions && existingPermissions.canScore) {
        throw new ConflictException('Target user already has active scoring permissions');
      }

      // If revoking current scorer permissions, deactivate the transferor's row
      // (no-op when the transferor is a captain/VC who never had a row)
      if (dto.revokeCurrentPermissions) {
        const transferorRow = await scorerPermissionRepository.findOne({
          where: { matchId, userId: fromUserId, isActive: true },
        });
        if (transferorRow) {
          transferorRow.isActive = false;
          transferorRow.canScore = false;
          await scorerPermissionRepository.save(transferorRow);
        }
      }

      // Create new scorer permission record for target user
      const newPermission = scorerPermissionRepository.create({
        matchId,
        userId: dto.transferToUserId,
        role: dto.role || ScorerRole.PRIMARY_SCORER,
        isActive: false, // Will be activated when they accept
        canScore: false, // Will be enabled when they accept
        transferredFrom: fromUserId,
        transferredTo: dto.transferToUserId,
        transferStatus: TransferStatus.PENDING,
        transferredAt: new Date(),
        transferReason: dto.reason,
        metadata: dto.metadata || {},
      });

      const savedPermission = await scorerPermissionRepository.save(newPermission);

      await queryRunner.commitTransaction();

      return {
        transfer: savedPermission,
        message: `Scoring permissions transferred to ${targetUser.name}. Waiting for acceptance.`,
      };
    } catch (error) {
      // Skip rollback when the transaction is already committed or aborted
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Accept scorer transfer request
   */
  async acceptScorerTransfer(
    transferId: string,
    acceptingUserId: string,
    dto: AcceptScorerTransferDto,
  ): Promise<{ permission: ScorerPermission; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const scorerPermissionRepository = queryRunner.manager.getRepository(ScorerPermission);

      // Get the transfer request
      const transfer = await scorerPermissionRepository.findOne({
        where: { id: transferId },
      });

      if (!transfer) {
        throw new NotFoundException('Transfer request not found');
      }

      // Verify this transfer is for the accepting user
      if (transfer.userId !== acceptingUserId) {
        throw new BadRequestException('This transfer request is not for you');
      }

      // Check if transfer is still pending
      if (transfer.transferStatus !== TransferStatus.PENDING) {
        throw new BadRequestException(`Transfer is ${transfer.transferStatus}, cannot accept`);
      }

      // Update transfer status
      transfer.transferStatus = TransferStatus.ACCEPTED;
      transfer.acceptedAt = new Date();

      // Activate scoring permissions if requested
      if (dto.activateImmediately) {
        transfer.isActive = true;
        transfer.canScore = true;
      }

      // Add notes to metadata
      if (dto.notes) {
        transfer.metadata = {
          ...transfer.metadata,
          acceptanceNotes: dto.notes,
        };
      }

      transfer.updatedAt = new Date();

      const savedPermission = await scorerPermissionRepository.save(transfer);

      await queryRunner.commitTransaction();

      return {
        permission: savedPermission,
        message: dto.activateImmediately
          ? 'Scoring permissions activated successfully. You can now score this match.'
          : 'Transfer accepted. Scoring permissions will be activated by the transferor.',
      };
    } catch (error) {
      // Skip rollback when the transaction is already committed or aborted
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Reject scorer transfer request
   */
  async rejectScorerTransfer(
    transferId: string,
    rejectingUserId: string,
    dto: RejectScorerTransferDto,
  ): Promise<{ message: string }> {
    const scorerPermissionRepository = this.dataSource.getRepository(ScorerPermission);

    // Get the transfer request
    const transfer = await scorerPermissionRepository.findOne({
      where: { id: transferId },
    });

    if (!transfer) {
      throw new NotFoundException('Transfer request not found');
    }

    // Verify this transfer is for the rejecting user
    if (transfer.userId !== rejectingUserId) {
      throw new BadRequestException('This transfer request is not for you');
    }

    // Check if transfer is still pending
    if (transfer.transferStatus !== TransferStatus.PENDING) {
      throw new BadRequestException(`Transfer is ${transfer.transferStatus}, cannot reject`);
    }

    // Update transfer status
    transfer.transferStatus = TransferStatus.REJECTED;
    transfer.updatedAt = new Date();

    // Store rejection reason
    if (dto.reason) {
      transfer.metadata = {
        ...transfer.metadata,
        rejectionReason: dto.reason,
      };
    }

    await scorerPermissionRepository.save(transfer);

    return {
      message: 'Scorer transfer rejected successfully',
    };
  }

  /**
   * Revoke scoring access from a user
   */
  async revokeScorerAccess(
    matchId: string,
    fromUserId: string,
    dto: RevokeScorerAccessDto,
  ): Promise<{ message: string }> {
    const scorerPermissionRepository = this.dataSource.getRepository(ScorerPermission);

    // Verify revoker can score (captains/VCs qualify even without a permission row)
    const mayScore = await this.canUserScore(matchId, fromUserId);
    if (!mayScore) {
      throw new BadRequestException('You do not have permission to revoke scorer access');
    }

    // Get the permission to revoke
    const permissionToRevoke = await scorerPermissionRepository.findOne({
      where: {
        matchId,
        userId: dto.userId,
        isActive: true,
      },
    });

    if (!permissionToRevoke) {
      throw new NotFoundException('User does not have active scoring permissions');
    }

    // Revoke permissions
    permissionToRevoke.isActive = false;
    permissionToRevoke.canScore = false;
    permissionToRevoke.transferStatus = TransferStatus.REVOKED;
    permissionToRevoke.revokedAt = new Date();
    permissionToRevoke.updatedAt = new Date();

    // Store revocation reason
    if (dto.reason) {
      permissionToRevoke.metadata = {
        ...permissionToRevoke.metadata,
        revocationReason: dto.reason,
        revokedBy: fromUserId,
      };
    }

    await scorerPermissionRepository.save(permissionToRevoke);

    return {
      message: 'Scoring access revoked successfully',
    };
  }

  /**
   * Grant scoring access to a user
   */
  async grantScorerAccess(
    matchId: string,
    fromUserId: string,
    dto: GrantScorerAccessDto,
  ): Promise<{ permission: ScorerPermission; message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const scorerPermissionRepository = queryRunner.manager.getRepository(ScorerPermission);
      const userRepository = queryRunner.manager.getRepository(User);

      // Verify granter can score (captains/VCs qualify even without a permission row)
      const mayScore = await this.canUserScore(matchId, fromUserId);
      if (!mayScore) {
        throw new BadRequestException('You do not have permission to grant scorer access');
      }

      // Verify target user exists
      const targetUser = await userRepository.findOne({
        where: { id: dto.userId },
      });

      if (!targetUser) {
        throw new NotFoundException('Target user not found');
      }

      // Check if user already has active permissions
      const existingPermission = await scorerPermissionRepository.findOne({
        where: {
          matchId,
          userId: dto.userId,
          isActive: true,
        },
      });

      if (existingPermission) {
        throw new ConflictException('User already has active scoring permissions');
      }

      // Create new permission
      const newPermission = scorerPermissionRepository.create({
        matchId,
        userId: dto.userId,
        role: dto.role,
        isActive: true,
        canScore: dto.role !== ScorerRole.VIEWER,
        transferredFrom: fromUserId,
        transferredTo: dto.userId,
        transferStatus: TransferStatus.ACCEPTED,
        transferredAt: new Date(),
        acceptedAt: new Date(),
        transferReason: dto.reason,
        metadata: {
          grantedBy: fromUserId,
        },
      });

      const savedPermission = await scorerPermissionRepository.save(newPermission);

      await queryRunner.commitTransaction();

      return {
        permission: savedPermission,
        message: `Scoring access granted to ${targetUser.name}`,
      };
    } catch (error) {
      // Skip rollback when the transaction is already committed or aborted
      if (queryRunner.isTransactionActive) {
        await queryRunner.rollbackTransaction();
      }
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Update scorer role
   */
  async updateScorerRole(
    matchId: string,
    fromUserId: string,
    dto: UpdateScorerRoleDto,
  ): Promise<{ permission: ScorerPermission; message: string }> {
    const scorerPermissionRepository = this.dataSource.getRepository(ScorerPermission);

    // Verify updater can score (captains/VCs qualify even without a permission row)
    const mayScore = await this.canUserScore(matchId, fromUserId);
    if (!mayScore) {
      throw new BadRequestException('You do not have permission to update scorer roles');
    }

    // Get the permission to update
    const permissionToUpdate = await scorerPermissionRepository.findOne({
      where: {
        matchId,
        userId: dto.userId,
        isActive: true,
      },
    });

    if (!permissionToUpdate) {
      throw new NotFoundException('User does not have active scoring permissions');
    }

    // Update role and scoring permissions
    permissionToUpdate.role = dto.role;
    permissionToUpdate.canScore = dto.role !== ScorerRole.VIEWER;
    permissionToUpdate.updatedAt = new Date();

    // Store update reason
    if (dto.reason) {
      permissionToUpdate.metadata = {
        ...permissionToUpdate.metadata,
        roleUpdateReason: dto.reason,
        updatedBy: fromUserId,
      };
    }

    const savedPermission = await scorerPermissionRepository.save(permissionToUpdate);

    return {
      permission: savedPermission,
      message: 'Scorer role updated successfully',
    };
  }

  /**
   * Get all scorers for a match
   */
  async getMatchScorers(matchId: string): Promise<ScorerPermission[]> {
    const scorerPermissionRepository = this.dataSource.getRepository(ScorerPermission);

    return await scorerPermissionRepository.find({
      where: { matchId },
      relations: ['user', 'transferredFromUser', 'transferredToUser'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get active scorers for a match
   */
  async getActiveScorers(matchId: string): Promise<ScorerPermission[]> {
    const scorerPermissionRepository = this.dataSource.getRepository(ScorerPermission);

    return await scorerPermissionRepository.find({
      where: { matchId, isActive: true },
      relations: ['user'],
    });
  }

  /**
   * Get pending transfer requests for a user
   */
  async getPendingTransfers(userId: string): Promise<ScorerPermission[]> {
    const scorerPermissionRepository = this.dataSource.getRepository(ScorerPermission);

    return await scorerPermissionRepository.find({
      where: {
        userId,
        transferStatus: TransferStatus.PENDING,
      },
      relations: ['transferredFromUser', 'match'],
    });
  }

  /**
   * Check if user can score a match
   */
  async canUserScore(matchId: string, userId: string): Promise<boolean> {
    const scorerPermissionRepository = this.dataSource.getRepository(ScorerPermission);
    const matchRepository = this.dataSource.getRepository(Match);
    const teamMemberRepository = this.dataSource.getRepository(TeamMember);

    const rows = await scorerPermissionRepository.find({ where: { matchId, userId } });

    if (rows.some(r => r.canScore && r.isActive)) return true;

    // An explicit revocation or downgrade must not be undone by the bootstrap below
    if (rows.some(r => r.revokedAt)) return false;
    if (rows.some(r => r.isActive && !r.canScore)) return false;

    // The captain/vice-captain bootstrap only applies while nobody else holds scoring rights,
    // otherwise a transferred-away or revoked captain could score via team role alone.
    const activeScorer = await scorerPermissionRepository.findOne({
      where: { matchId, isActive: true, canScore: true },
    });
    if (activeScorer) return false;

    // Bootstrap: a captain or vice-captain of either team may score even with no
    // permission row — rows are otherwise only created by transfers, so no one
    // could ever become the first scorer of a match.
    const match = await matchRepository.findOne({ where: { id: matchId } });
    if (!match) return false;

    const membership = await teamMemberRepository.findOne({
      where: [
        { userId, teamId: match.teamAId },
        { userId, teamId: match.teamBId },
      ],
    });

    if (!membership) return false;
    return (
      membership.role === TeamRole.CAPTAIN || membership.role === TeamRole.VICE_CAPTAIN
    );
  }

  /**
   * Get transfer history for a match
   */
  async getTransferHistory(matchId: string): Promise<{
    totalTransfers: number;
    pendingTransfers: number;
    completedTransfers: number;
    rejectedTransfers: number;
    revokedTransfers: number;
    transfers: ScorerPermission[];
  }> {
    const scorerPermissionRepository = this.dataSource.getRepository(ScorerPermission);

    const transfers = await scorerPermissionRepository.find({
      where: { matchId },
      relations: ['transferredFromUser', 'transferredToUser', 'user'],
      order: { transferredAt: 'DESC' },
    });

    const pendingTransfers = transfers.filter(t => t.transferStatus === TransferStatus.PENDING).length;
    const completedTransfers = transfers.filter(t => t.transferStatus === TransferStatus.ACCEPTED).length;
    const rejectedTransfers = transfers.filter(t => t.transferStatus === TransferStatus.REJECTED).length;
    const revokedTransfers = transfers.filter(t => t.transferStatus === TransferStatus.REVOKED).length;

    return {
      totalTransfers: transfers.length,
      pendingTransfers,
      completedTransfers,
      rejectedTransfers,
      revokedTransfers,
      transfers,
    };
  }
}
