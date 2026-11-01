import { DataSource } from 'typeorm';
import { OtpType } from './otp.entity';
import { EmailService } from './email.service';
export declare class OtpService {
    private dataSource;
    private emailService;
    constructor(dataSource: DataSource, emailService: EmailService);
    generateEmailOtp(email: string, userId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    generateMobileOtp(mobile: string, userId?: string): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyOtp(identifier: string, otpCode: string, type?: OtpType): Promise<{
        success: boolean;
        message: string;
        userId?: string;
    }>;
    resendOtp(identifier: string, type?: OtpType): Promise<{
        success: boolean;
        message: string;
    }>;
    cleanupExpiredOtps(): Promise<void>;
}
