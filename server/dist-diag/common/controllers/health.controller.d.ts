export declare class HealthController {
    healthCheck(): {
        status: string;
        timestamp: string;
        uptime: number;
        environment: string;
        version: string;
    };
}
