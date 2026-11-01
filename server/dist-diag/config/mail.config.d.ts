export declare const mailConfig: {
    enabled: boolean;
    apiUrl: string;
    institution: string;
    clientUrl: string;
    devFallbackEmail: string;
    environment: string;
    getRecipientEmail(userEmail: string): string;
    logEmail(details: {
        originalRecipient: string;
        actualRecipient: string;
        subject: string;
        context?: any;
    }): void;
};
