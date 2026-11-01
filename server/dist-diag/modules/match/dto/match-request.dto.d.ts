export declare class MatchRequestDto {
    opponentTeamId: string;
    matchDate: string;
    matchTime: string;
    venue?: string;
    preferredOvers?: number;
}
export declare class RespondRequestDto {
    status: 'confirmed' | 'rejected';
}
