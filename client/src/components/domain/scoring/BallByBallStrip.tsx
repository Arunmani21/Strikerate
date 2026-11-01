import type { Ball } from "../../../types/scoring";
import { ballToken } from "../../../lib/scoring";
import { BallToken } from "./BallToken";

/** Most recent delivery rendered right-most, like a broadcast graphic */
export function BallByBallStrip({ balls }: { balls: Ball[] }) {
  if (!balls.length) {
    return <p className="text-xs text-text-faint">No balls bowled yet</p>;
  }
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {balls.map((b) => {
        const token = ballToken(b);
        return <BallToken key={b.id} label={token.label} tone={token.tone} title={token.title} size="sm" />;
      })}
    </div>
  );
}
