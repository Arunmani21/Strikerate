import { UserRole, BattingStyle, BowlingStyle } from '../../user/user-profile.entity';
export declare class RegisterDto {
    name: string;
    email: string;
    password: string;
    role?: UserRole;
    battingStyle?: BattingStyle;
    bowlingStyle?: BowlingStyle;
    experienceYears?: number;
    bio?: string;
}
