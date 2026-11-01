import { useQuery } from "@tanstack/react-query";
import { Link, useLocation, useParams } from "react-router";
import { BarChart3, ChevronRight } from "lucide-react";

import { statsApi } from "../../api/stats.api";
import { twoDecimal } from "../../lib/format";
import { qk } from "../../lib/queryKeys";
import { AppBar } from "../../components/ui/AppBar";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { StatTile } from "../../components/ui/StatTile";

export function PlayerCareerPage() {
  const { playerId = "" } = useParams();
  const location = useLocation();
  const name = (location.state as { name?: string } | null)?.name ?? "Player";

  const careerQ = useQuery({
    queryKey: qk.playerCareer(playerId),
    queryFn: () => statsApi.career(playerId),
    retry: false,
  });

  if (careerQ.isPending) return <FullScreenSpinner />;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <AppBar title={name} onBack={() => window.history.back()} />
      <main className="flex-1 space-y-4 px-4 py-4 pb-12">
        {careerQ.isError || !careerQ.data ? (
          <EmptyState
            icon={BarChart3}
            title="No career stats yet"
            hint="Stats appear after a match captain runs the calculation."
          />
        ) : (
          <CareerBody playerId={playerId} s={careerQ.data} />
        )}
      </main>
    </div>
  );
}

function CareerBody({ playerId, s }: { playerId: string; s: import("../../types/stats").CareerStats }) {
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <StatTile label="Matches" value={String(s.totalMatches)} />
        <StatTile label="Runs" value={String(s.totalRuns)} tone="accent" />
        <StatTile label="Average" value={twoDecimal(parseFloat(s.careerBattingAvg))} />
        <StatTile label="Strike rate" value={twoDecimal(parseFloat(s.careerStrikeRate))} />
        <StatTile label="Highest" value={String(s.highestScore)} />
        <StatTile
          label="50s / 100s"
          value={`${s.totalFifties} / ${s.totalHundreds}`}
          tone="gold"
        />
        <StatTile label="Wickets" value={String(s.totalWickets)} tone="info" />
        <StatTile
          label="Best bowling"
          value={s.bestBowling ?? "–"}
          sub={s.totalWickets > 0 ? `${twoDecimal(parseFloat(s.careerEconomy))} econ` : undefined}
        />
      </div>

      <Card>
        <p className="text-xs leading-relaxed text-text-dim tnum">
          {s.totalInnings} inns · {s.totalNotOuts} not out · {s.totalDucks} ducks ·{" "}
          {s.totalFours}×4 · {s.totalSixes}×6
        </p>
        <p className="mt-1 text-xs leading-relaxed text-text-dim tnum">
          {parseFloat(s.totalOversBowled).toFixed(1)} ov bowled · {s.totalRunsConceded}{" "}
          conceded · {s.totalMaidens} maidens · {s.fiveWicketHauls}× five-for
        </p>
      </Card>

      <Link to={`/players/${playerId}/matches`} state={{ name }}>
        <Card className="flex items-center justify-between active:bg-elevated">
          <span className="text-sm font-semibold">Match by match</span>
          <ChevronRight className="size-4 text-text-dim" />
        </Card>
      </Link>
    </>
  );
}
