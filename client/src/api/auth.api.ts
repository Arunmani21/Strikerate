import { http } from "../lib/api";
import type { AuthUser, UserProfile } from "../types/user";
import type {
  BattingStyle,
  BowlingStyle,
  ProfileRole,
} from "../types/enums";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: ProfileRole;
  battingStyle?: BattingStyle;
  bowlingStyle?: BowlingStyle;
  experienceYears?: number;
  bio?: string;
}

export interface ProfileInput {
  role?: ProfileRole;
  battingStyle?: BattingStyle;
  bowlingStyle?: BowlingStyle;
  experienceYears?: number;
  bio?: string;
}

export const authApi = {
  register: (body: RegisterInput) =>
    http.post<AuthUser>("/auth/register", body),

  login: (email: string, password: string) =>
    http.post<{ access_token: string; user: AuthUser }>("/auth/login", {
      email,
      password,
    }),

  me: () => http.get<AuthUser>("/auth/me"),

  verifyEmail: (email: string, otp: string) =>
    http.post<unknown>("/auth/verify-email", { email, otp }),

  resendOtp: (email: string) =>
    http.post<unknown>("/auth/resend-otp", { email }),

  getProfile: () => http.get<UserProfile>("/user/profile"),

  createProfile: (body: ProfileInput) =>
    http.post<UserProfile>("/user/profile", body),

  updateProfile: (body: ProfileInput) =>
    http.patch<UserProfile>("/user/profile", body),
};
