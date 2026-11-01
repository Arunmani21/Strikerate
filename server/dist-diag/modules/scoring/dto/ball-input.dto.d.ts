import { DismissalType } from '../ball.entity';
export declare class BallInputDto {
    inningsId: string;
    batsmanId: string;
    bowlerId: string;
    runs: number;
    extraRuns?: number;
    isWide?: boolean;
    isNoBall?: boolean;
    isBye?: boolean;
    isLegBye?: boolean;
    isWicket?: boolean;
    wicketType?: DismissalType;
    dismissedPlayerId?: string;
    commentary?: string;
}
