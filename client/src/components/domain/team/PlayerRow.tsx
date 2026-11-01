import type { ReactNode } from "react";
import { Link } from "react-router";
import type { Player } from "../../../types/team";

export function PlayerRow({
  player,
  right,
  to,
}: {
  player: Player;
  right?: ReactNode;
  to?: string;
}) {
  const hasBatting = player.battingBalls > 0;
  const hasBowling = player.bowlingBalls > 0;

  const inner = (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-elevated font-display text-sm font-bold text-text-dim tnum">
        {player.jerseyNumber ?? "–"}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{player.name}</p>
        {(hasBatting || hasBowling) && (
          <p className="mt-0.5 text-xs text-text-dim tnum">
            {hasBatting && `${player.battingRuns} runs`}
            {hasBatting && hasBowling && " · "}
            {hasBowling && `${player.bowlingWickets} wkts`}
          </p>
        )}
      </div>
      {right}
    </div>
  );

  if (!to) return inner;

  return (
    <Link to={to} state={{ name: player.name }} className="block active:bg-elevated">
      {inner}
    </Link>
  );
}
