export declare class CreateGuestPlayerDto {
    name: string;
    mobile?: string;
    email?: string;
    battingStyle?: string;
    bowlingStyle?: string;
    role?: string;
    metadata?: Record<string, any>;
}
export declare class UpdateGuestPlayerDto {
    name?: string;
    mobile?: string;
    email?: string;
    battingStyle?: string;
    bowlingStyle?: string;
    role?: string;
    metadata?: Record<string, any>;
}
export declare class ConvertGuestPlayerDto {
    email: string;
    password: string;
    mobile?: string;
}
