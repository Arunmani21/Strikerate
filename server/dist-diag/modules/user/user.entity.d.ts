import { UserProfile } from './user-profile.entity';
import { TeamMember } from '../team/team-member.entity';
export declare class User {
    id: string;
    name: string;
    email: string;
    password: string;
    emailVerified: boolean;
    emailVerifiedAt: Date;
    mobile: string;
    mobileVerified: boolean;
    mobileVerifiedAt: Date;
    isActive: boolean;
    createdAt: Date;
    profile?: UserProfile;
    teamMembers: TeamMember[];
}
