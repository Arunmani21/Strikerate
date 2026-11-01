import { OtpService } from './otp.service';
import { SendOtpDto, VerifyOtpDto, ResendOtpDto } from './dto/otp.dto';
export declare class OtpController {
    private otpService;
    constructor(otpService: OtpService);
    sendOtp(dto: SendOtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
    verifyOtp(dto: VerifyOtpDto): Promise<{
        success: boolean;
        message: string;
        userId?: string;
    }>;
    resendOtp(dto: ResendOtpDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
