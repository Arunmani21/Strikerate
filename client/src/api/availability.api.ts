import { http } from "../lib/api";
import type { TeamAvailability } from "../types/match";

export interface PostAvailabilityInput {
  availableDate: string;
  availableFrom: string;
  availableUntil: string;
  venue?: string;
  preferredOvers?: number;
  notes?: string;
  isOpen?: boolean;
}

export const availabilityApi = {
  /** Date-based "our team is open for matches" post — what opponents request against */
  post: (teamId: string, body: PostAvailabilityInput) =>
    http.post<TeamAvailability>(`/team/${teamId}/availability`, body),
};
