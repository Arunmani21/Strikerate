import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

export enum TeamRole {
  CAPTAIN = 'captain',
  VICE_CAPTAIN = 'vice_captain',
  MANAGER = 'manager',
  PLAYER = 'player',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
