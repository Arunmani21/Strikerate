import { DataSource } from 'typeorm';
import { UserProfile } from './user-profile.entity';
import { CreateProfileDto } from './dto/create-profile.dto';
export declare class UserService {
    private dataSource;
    constructor(dataSource: DataSource);
    createProfile(userId: string, dto: CreateProfileDto): Promise<UserProfile>;
    updateProfile(userId: string, dto: CreateProfileDto): Promise<UserProfile>;
    getProfile(userId: string): Promise<UserProfile>;
    private validateProfileInput;
}
