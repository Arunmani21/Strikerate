import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { ListOrdered } from "lucide-react";

import { inningsApi } from "../../api/innings.api";
import { matchesApi } from "../../api/matches.api";
import { playing11Api } from "../../api/playing11.api";
import { scoringApi } from "../../api/scoring.api";
import { useMatchSocket } from "../../hooks/useMatchSocket";
import { formatOvers } from "../../lib/format";
import { qk } from "../../lib/queryKeys";
import {
  aggregateBatting,
  aggregateBowling,
  ballToken,
  chaseInfo,
  currentOverBalls,
  nameLookup,
  runRate,
} from "../../lib/scoring";
import { AppBar } from "../../components/ui/AppBar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { PageError } from "../../components/ui/PageError";
import { BallByBallStrip } from "../../components/domain/scoring/BallByBallStrip";
import { BallToken } from "../../components/domain/scoring/BallToken";
import { BatsmenStrip } from "../../components/domain/scoring/BatsmenStrip";
import { BowlerStrip } from "../../components/domain/scoring/BowlerStrip";
import { ScoreHeader } from "../../components/domain/scoring/ScoreHeader";

export function LiveMatchPage() {
  const { id = "" } = useParams();
  const { lastBall, connected } = useMatchSocket(id);

  const matchQ = useQuery({
    queryKey: qk.match(id),
    queryFn: () => matchesApi.get(id),
    enabled: Boolean(id),
  });
  const inningsQ = useQuery({
    queryKey: qk.inningsByMatch(id),
    queryFn: () => inningsApi.byMatch(id),
    enabled: Boolean(id),
  });
  const cardQ = useQuery({
    queryKey: qk.scorecard(id),
    queryFn: () => scoringApi.scorecard(id),
    enabled: Boolean(id),
  });

  const match = matchQ.data;
  const inningsList = inningsQ.data ?? [];
  const inn =
    inningsList.find((i) => !i.isCompleted) ?? inningsList[inningsList.length - 1];

  const xiBatQ = useQuery({
    queryKey: qk.playing11(id, inn?.battingTeamId ?? ""),
    queryFn: () => playing11Api.get(id, inn!.battingTeamId),
    enabled: Boolean(inn),
  });
  const xiBowlQ = useQuery({
    queryKey: qk.playing11(id, inn?.bowlingTeamId ?? ""),
    queryFn: () => playing11Api.get(id, inn!.bowlingTeamId),
    enabled: Boolean(inn),
  });

  if (matchQ.isPending) return <FullScreenSpinner />;
  if (matchQ.isError || !match)
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
        <AppBar title="Live" backTo={`/matches/${id}`} />
        <PageError error={matchQ.error} onRetry={matchQ.refetch} />
      </div>
    );

  const balls = cardQ.data?.innings.find((i) => i.id === inn?.id)?.balls ?? [];
  const nameOf = nameLookup([...(xiBatQ.data ?? []), ...(xiBowlQ.data ?? [])]);
  const battingRows = aggregateBatting(balls, nameOf);
  const bowlingRows = aggregateBowling(balls, nameOf);

  const teamName = (teamId: string) =>
    teamId === match.teamAId
      ? (match.teamA?.name ?? "Team A")
      : (match.teamB?.name ?? "Team B");

  const target =
    match.target && match.target > 0
      ? match.target
      : inn?.inningsNumber === 2
        ? (inningsList[0]?.totalRuns ?? null)
        : null;
  const { chase, rrr, targetNote } = chaseInfo(
    target,
    inn?.totalRuns ?? 0,
    inn?.totalBalls ?? 0,
    match.totalOvers,
  );

  const thisOver = currentOverBalls(balls);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <AppBar
        title="Live"
        backTo={`/matches/${id}`}
        right={
          <Link
            to={`/matches/${id}/scorecard`}
            className="rounded-full px-3 py-1.5 text-sm font-semibold text-accent active:bg-accent-soft"
          >
            Card
          </Link>
        }
      />

      <main className="flex-1 space-y-3 px-4 py-4 pb-12">
        <ScoreHeader
          teamName={inn ? teamName(inn.battingTeamId) : "—"}
          runs={inn?.totalRuns ?? 0}
          wickets={inn?.totalWickets ?? 0}
          oversText={formatOvers(inn?.totalBalls ?? 0)}
          crr={runRate(inn?.totalRuns ?? 0, inn?.totalBalls ?? 0)}
          rrr={rrr}
          targetNote={targetNote}
          chaseLine={chase}
          connected={connected}
        />

        {lastBall && (
          <div className="flex items-center gap-2 rounded-md border border-line-soft bg-elevated px-3 py-2.5">
            <span className="size-1.5 shrink-0 animate-pulse rounded-full bg-accent" />
            <p className="truncate text-sm font-semibold">{lastBall.lastBall}</p>
          </div>
        )}

        <BatsmenStrip
          rows={battingRows}
          strikerId={inn?.strikerId}
          nonStrikerId={inn?.nonStrikerId}
        />
        <BowlerStrip
          row={bowlingRows.find((r) => r.id === inn?.currentBowlerId) ?? null}
        />

        <Card className="space-y-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-faint">
              This over
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5">
              {thisOver.length === 0 ? (
                <p className="text-xs text-text-faint">Over starting</p>
              ) : (
                thisOver.map((b) => {
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
                })
              )}
            </div>
          </div>
          <div className="border-t border-line-soft pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-faint">
              Recent
            </p>
            <div className="mt-2">
              <BallByBallStrip balls={balls.slice(-10)} />
            </div>
          </div>
        </Card>

        <Link to={`/matches/${id}/scorecard`} className="block">
          <Button variant="secondary" fullWidth>
            <ListOrdered className="size-4" />
            Full scorecard
          </Button>
        </Link>
      </main>
    </div>
  );
}
