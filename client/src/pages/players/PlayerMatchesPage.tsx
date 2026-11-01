import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "react-router";
import { BarChart3, Star } from "lucide-react";

import { statsApi } from "../../api/stats.api";
import { formatDate, oversFromDecimal } from "../../lib/format";
import { qk } from "../../lib/queryKeys";
import { AppBar } from "../../components/ui/AppBar";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { FullScreenSpinner } from "../../components/ui/Spinner";

export function PlayerMatchesPage() {
  const { playerId = "" } = useParams();
  const location = useLocation();
  const name = (location.state as { name?: string } | null)?.name ?? "Player";

  const rowsQ = useQuery({
    queryKey: qk.playerMatches(playerId),
    queryFn: () => statsApi.playerMatches(playerId),
  });

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <AppBar title={`${name} · matches`} backTo={`/players/${playerId}`} />

      <main className="flex-1 space-y-3 px-4 py-4 pb-12">
        {rowsQ.isPending && <FullScreenSpinner />}
        {rowsQ.isError && (
          <EmptyState
            title="Couldn't load matches"
            hint="Pull to retry from the match page."
          />
        )}
        {rowsQ.data?.length === 0 && (
          <EmptyState
            icon={BarChart3}
            title="No matches yet"
            hint="Performed matches show up here once stats are calculated."
          />
        )}
        {rowsQ.data?.map((row) => (
          <PlayerMatchRowCard key={row.id} row={row} />
        ))}
      </main>
    </div>
  );
}

function PlayerMatchRowCard({ row }: { row: import("../../types/stats").PlayerMatchRow }) {
  const match = row.match;
  const teams =
    match.teamA?.name && match.teamB?.name
      ? `${match.teamA.name} vs ${match.teamB.name}`
      : "Match";
  const bowled = parseFloat(row.oversBowled) > 0;

  return (
    <Link to={`/matches/${match.id}`} className="block">
      <Card>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{teams}</p>
            <p className="mt-0.5 text-xs text-text-dim">{formatDate(match.matchDate)}</p>
          </div>
          {row.isPlayerOfMatch && (
            <span className="flex shrink-0 items-center gap-1 rounded-full bg-gold-soft px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-gold">
              <Star className="size-3" />
              POTM
            </span>
          )}
        </div>

        <p className="mt-2 text-sm tnum">
          <span className="font-display font-bold">{row.runsScored}</span>
          <span className="text-text-dim">
            {" "}
            ({row.ballsFaced} b{row.isOut ? "" : ", not out"})
          </span>
        </p>

        {bowled && (
          <p className="mt-1 text-xs text-text-dim tnum">
            {oversFromDecimal(parseFloat(row.oversBowled))}-{row.maidens}-
            {row.runsConceded}-{row.wicketsTaken}
          </p>
        )}
      </Card>
    </Link>
  );
}
