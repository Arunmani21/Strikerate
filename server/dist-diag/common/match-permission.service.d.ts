import { DataSource } from 'typeorm';
export declare class MatchPermissionService {
    private dataSource;
    constructor(dataSource: DataSource);
    canManage(matchId: string, userId: string): Promise<boolean>;
    assertCanManage(matchId: string, userId: string): Promise<void>;
}
