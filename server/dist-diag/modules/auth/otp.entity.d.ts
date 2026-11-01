export declare enum OtpType {
    EMAIL_VERIFICATION = "email_verification",
    PASSWORD_RESET = "password_reset",
    MOBILE_VERIFICATION = "mobile_verification"
}
export declare enum OtpStatus {
    PENDING = "pending",
    VERIFIED = "verified",
    EXPIRED = "expired",
    USED = "used"
}
export declare class Otp {
    id: string;
    userId: string;
    email: string;
    mobile: string;
    otp: string;
    type: OtpType;
    status: OtpStatus;
    expiresAt: Date;
    verifiedAt: Date;
    attempts: number;
    maxAttempts: number;
    createdAt: Date;
}
