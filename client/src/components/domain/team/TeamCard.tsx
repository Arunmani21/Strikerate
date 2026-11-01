import { Link } from "react-router";
import { ChevronRight, MapPin } from "lucide-react";
import type { Team } from "../../../types/team";

export function TeamCard({ team }: { team: Team }) {
  return (
    <Link
      to={`/teams/${team.id}`}
      className="flex items-center gap-3 rounded-lg border border-line bg-surface p-4 active:bg-elevated"
    >
      <div className="flex size-11 shrink-0 items-center justify-center rounded-md bg-accent-soft font-display text-base font-bold text-accent">
        {team.name.slice(0, 2).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-base font-bold">{team.name}</p>
        {team.homeGround && (
          <p className="mt-0.5 flex items-center gap-1 text-xs text-text-dim">
            <MapPin className="size-3 shrink-0" />
            <span className="truncate">{team.homeGround}</span>
          </p>
        )}
      </div>
      <ChevronRight className="size-4 shrink-0 text-text-faint" />
    </Link>
  );
}
