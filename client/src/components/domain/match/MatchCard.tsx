import { Link } from "react-router";
import { Calendar, MapPin } from "lucide-react";

import type { Match } from "../../../types/match";
import { MATCH_STATUS_META } from "../../../lib/constants";
import { formatMatchWhen } from "../../../lib/format";
import { Chip } from "../../ui/Chip";

export function MatchCard({ match }: { match: Match }) {
  const meta = MATCH_STATUS_META[match.status];
  const teamAName = match.teamA?.name ?? "Team A";
  const teamBName = match.teamB?.name ?? "Team B";

  return (
    <Link
      to={`/matches/${match.id}`}
      className="block rounded-lg border border-line bg-surface p-4 active:bg-elevated"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="min-w-0 truncate font-display text-base font-bold leading-snug">
          {teamAName} <span className="text-text-faint">vs</span> {teamBName}
        </p>
        <Chip tone={meta.tone}>{meta.label}</Chip>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-dim">
        <span className="flex items-center gap-1">
          <Calendar className="size-3 shrink-0" />
          {formatMatchWhen(match.matchDate, match.matchTime)}
        </span>
        {match.venue && (
          <span className="flex min-w-0 items-center gap-1">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{match.venue}</span>
          </span>
        )}
        <span className="tnum">{match.totalOvers} ov</span>
      </div>

      {match.result && (
        <p className="mt-2 text-xs font-semibold text-accent">{match.result}</p>
      )}
    </Link>
  );
}
