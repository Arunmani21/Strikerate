export declare enum UserRole {
    BATSMAN = "batsman",
    BOWLER = "bowler",
    ALLROUNDER = "allrounder",
    KEEPER = "keeper"
}
export declare enum BattingStyle {
    RIGHT_HAND = "right_hand",
    LEFT_HAND = "left_hand"
}
export declare enum BowlingStyle {
    RIGHT_ARM_FAST = "right_arm_fast",
    RIGHT_ARM_SPIN = "right_arm_spin",
    LEFT_ARM_FAST = "left_arm_fast",
    LEFT_ARM_SPIN = "left_arm_spin"
}
export declare class UserProfile {
    id: string;
    role: UserRole;
    battingStyle: BattingStyle;
    bowlingStyle: BowlingStyle;
    experienceYears: number;
    bio: string;
    createdAt: Date;
    userId: string;
    user: any;
}
