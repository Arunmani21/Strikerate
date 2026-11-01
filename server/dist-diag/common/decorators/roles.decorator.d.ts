export declare enum UserRole {
    ADMIN = "admin",
    USER = "user"
}
export declare enum TeamRole {
    CAPTAIN = "captain",
    VICE_CAPTAIN = "vice_captain",
    MANAGER = "manager",
    PLAYER = "player"
}
export declare const ROLES_KEY = "roles";
export declare const Roles: (...roles: string[]) => import("@nestjs/common").CustomDecorator<string>;
