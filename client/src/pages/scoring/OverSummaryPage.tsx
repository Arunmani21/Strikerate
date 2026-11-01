import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { scoringApi } from "../../api/scoring.api";
import { qk } from "../../lib/queryKeys";
import { ballToken, groupOvers } from "../../lib/scoring";
import { AppBar } from "../../components/ui/AppBar";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { PageError } from "../../components/ui/PageError";
import { EmptyState } from "../../components/ui/EmptyState";
import { BallToken } from "../../components/domain/scoring/BallToken";

export function OverSummaryPage() {
  const { id = "", inningsId = "" } = useParams();

  const cardQ = useQuery({
    queryKey: qk.scorecard(id),
    queryFn: () => scoringApi.scorecard(id),
    enabled: Boolean(id),
  });
  const card = cardQ.data;
  const inn = card?.innings.find((i) => i.id === inningsId);

  if (cardQ.isPending) return <FullScreenSpinner />;
  if (cardQ.isError || !card)
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
        <AppBar title="Overs" backTo={`/matches/${id}`} />
        <PageError error={cardQ.error} onRetry={cardQ.refetch} />
      </div>
    );

  const overs = groupOvers(inn?.balls ?? []).slice().reverse();

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <AppBar
        title={inn ? `Overs · Innings ${inn.inningsNumber}` : "Overs"}
        backTo={`/matches/${id}/scorecard`}
      />

      <main className="flex-1 space-y-2 px-4 py-4 pb-12">
        {overs.length === 0 ? (
          <EmptyState title="No overs yet" hint="Overs appear here as they're bowled." />
        ) : (
          overs.map((g) => (
            <div
              key={g.overIndex}
              className="rounded-lg border border-line bg-surface px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-display text-sm font-bold uppercase tracking-wide tnum">
                  Over {g.overIndex + 1}
                </p>
                <p className="text-xs text-text-dim tnum">
                  {g.runs} run{g.runs === 1 ? "" : "s"}
                  {g.wickets > 0 ? ` · ${g.wickets} wicket${g.wickets > 1 ? "s" : ""}` : ""}
                </p>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-1.5">
                {g.balls.map((b) => {
                  const token = ballToken(b);
                  return (
                    <BallToken
                      key={b.id}
                      label={token.label}
                      tone={token.tone}
                      title={token.title}
                      size="sm"
                    />
                  );
                })}
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
}
