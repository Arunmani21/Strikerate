import { UserRole, BattingStyle, BowlingStyle } from '../user-profile.entity';
export declare class CreateProfileDto {
    role?: UserRole;
    battingStyle?: BattingStyle;
    bowlingStyle?: BowlingStyle;
    experienceYears?: number;
    bio?: string;
}
