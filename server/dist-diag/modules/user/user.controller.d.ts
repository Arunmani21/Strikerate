import { UserService } from './user.service';
import { CreateProfileDto } from './dto/create-profile.dto';
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    createProfile(req: any, dto: CreateProfileDto): Promise<{
        data: import("./user-profile.entity").UserProfile;
        message: string;
    }>;
    updateProfile(req: any, dto: CreateProfileDto): Promise<{
        data: import("./user-profile.entity").UserProfile;
        message: string;
    }>;
    getProfile(req: any): Promise<{
        data: import("./user-profile.entity").UserProfile;
        message: string;
    }>;
}
