export declare class EmailService {
    private sendMail;
    sendOtpEmail(email: string, otp: string, userName?: string): Promise<any>;
    sendWelcomeEmail(email: string, userName?: string): Promise<any>;
    sendPasswordResetEmail(email: string, resetToken: string): Promise<any>;
}
