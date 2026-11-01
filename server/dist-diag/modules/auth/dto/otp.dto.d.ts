export declare class SendOtpDto {
    identifier: string;
    type?: string;
}
export declare class VerifyOtpDto {
    identifier: string;
    otp: string;
    type?: string;
}
export declare class ResendOtpDto {
    identifier: string;
    type?: string;
}
export declare class VerifyEmailDto {
    email: string;
    otp: string;
}
export declare class VerifyMobileDto {
    mobile: string;
    otp: string;
}
