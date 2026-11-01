import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import { UserProfile } from '../user/user-profile.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { OtpService } from './otp.service';
import { EmailService } from './email.service';
export declare class AuthService {
    private dataSource;
    private jwtService;
    private otpService;
    private emailService;
    constructor(dataSource: DataSource, jwtService: JwtService, otpService: OtpService, emailService: EmailService);
    register(dto: RegisterDto): Promise<{
        message: string;
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        emailVerifiedAt: Date;
        mobile: string;
        mobileVerified: boolean;
        mobileVerifiedAt: Date;
        isActive: boolean;
        createdAt: Date;
        profile?: UserProfile;
        teamMembers: import("../team/team-member.entity").TeamMember[];
    }>;
    login(dto: LoginDto): Promise<{
        access_token: string;
        user: {
            id: string;
            name: string;
            email: string;
            emailVerified: boolean;
        };
    }>;
    getMe(userId: string): Promise<{
        id: string;
        name: string;
        email: string;
        emailVerified: boolean;
        emailVerifiedAt: Date;
        mobile: string;
        mobileVerified: boolean;
        mobileVerifiedAt: Date;
        isActive: boolean;
        createdAt: Date;
        profile?: UserProfile;
        teamMembers: import("../team/team-member.entity").TeamMember[];
    }>;
    verifyEmailOTP(email: string, otp: string): Promise<{
        success: boolean;
        message: string;
        user?: any;
    }>;
    resendOTP(email: string): Promise<{
        success: boolean;
        message: string;
    }>;
    private validatePasswordStrength;
}
