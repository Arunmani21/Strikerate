import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { History } from "lucide-react";

import { statsApi } from "../../api/stats.api";
import { formatDate, oversFromDecimal } from "../../lib/format";
import { qk } from "../../lib/queryKeys";
import type { HistoryResult } from "../../types/stats";
import { AppBar } from "../../components/ui/AppBar";
import { Card } from "../../components/ui/Card";
import { Chip } from "../../components/ui/Chip";
import { EmptyState } from "../../components/ui/EmptyState";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { PageError } from "../../components/ui/PageError";
import { StatTile } from "../../components/ui/StatTile";

const RESULT_META: Record<HistoryResult, { label: string; tone: "accent" | "wicket" | "gold" | "dim" }> = {
  won: { label: "Won", tone: "accent" },
  lost: { label: "Lost", tone: "wicket" },
  tied: { label: "Tied", tone: "gold" },
  abandoned: { label: "No result", tone: "dim" },
};

export function TeamHistoryPage() {
  const { id = "" } = useParams();

  const historyQ = useQuery({
    queryKey: qk.teamHistory(id),
    queryFn: () => statsApi.teamHistory(id),
  });

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <AppBar title="Team history" backTo={`/teams/${id}`} />

      <main className="flex-1 space-y-3 px-4 py-4 pb-12">
        {historyQ.isPending && <FullScreenSpinner />}
        {historyQ.isError && (
          <PageError error={historyQ.error} onRetry={historyQ.refetch} />
        )}
        {historyQ.data?.length === 0 && (
          <EmptyState
            icon={History}
            title="No matches recorded"
            hint="Results appear once matches complete and stats are calculated."
          />
        )}
        {historyQ.data && historyQ.data.length > 0 && (
          <>
            <Tally rows={historyQ.data} />
            {[...historyQ.data]
              .sort((a, b) => b.matchDate.localeCompare(a.matchDate))
              .map((row) => (
                <HistoryRowCard key={row.id} row={row} />
              ))}
          </>
        )}
      </main>
    </div>
  );
}

function Tally({ rows }: { rows: import("../../types/stats").TeamHistoryRow[] }) {
  const count = (r: HistoryResult) => rows.filter((x) => x.result === r).length;
  return (
    <div className="grid grid-cols-4 gap-2">
      <StatTile label="W" value={String(count("won"))} tone="accent" />
      <StatTile label="L" value={String(count("lost"))} tone="wicket" />
      <StatTile label="T" value={String(count("tied"))} tone="gold" />
      <StatTile label="NR" value={String(count("abandoned"))} />
    </div>
  );
}

function HistoryRowCard({ row }: { row: import("../../types/stats").TeamHistoryRow }) {
  const meta = RESULT_META[row.result];
  const overs = oversFromDecimal(parseFloat(row.oversPlayed));

  return (
    <Link to={`/matches/${row.matchId}`} className="block">
      <Card>
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-sm font-semibold">vs {row.opponent.name}</p>
          <Chip tone={meta.tone}>{meta.label}</Chip>
        </div>
        <p className="mt-1.5 text-sm text-text-dim tnum">
          {row.runsScored}/{row.wicketsLost} ({overs} ov)
          {row.result !== "abandoned" &&
            ` · opp ${row.runsConceded}/${row.wicketsTaken}`}
        </p>
        <p className="mt-1 text-xs text-text-faint">{formatDate(row.matchDate)}</p>
      </Card>
    </Link>
  );
}
