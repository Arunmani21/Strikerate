import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    register(registerDto: RegisterDto): Promise<{
        data: {
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
            profile?: import("../user/user-profile.entity").UserProfile;
            teamMembers: import("../team/team-member.entity").TeamMember[];
        };
        message: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        data: {
            access_token: string;
            user: {
                id: string;
                name: string;
                email: string;
                emailVerified: boolean;
            };
        };
        message: string;
    }>;
    getMe(req: any): Promise<{
        data: {
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
            profile?: import("../user/user-profile.entity").UserProfile;
            teamMembers: import("../team/team-member.entity").TeamMember[];
        };
        message: string;
    }>;
    verifyEmail(body: {
        email: string;
        otp: string;
    }): Promise<{
        data: {
            success: boolean;
            message: string;
            user?: any;
        };
        message: string;
    }>;
    resendOTP(body: {
        email: string;
    }): Promise<{
        data: {
            success: boolean;
            message: string;
        };
        message: string;
    }>;
}
