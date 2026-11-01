import { useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";

import { playing11Api } from "../../api/playing11.api";
import { matchesApi } from "../../api/matches.api";
import { scoringApi } from "../../api/scoring.api";
import { formatOvers } from "../../lib/format";
import { qk } from "../../lib/queryKeys";
import {
  aggregateBatting,
  aggregateBowling,
  ballToken,
  groupOvers,
  nameLookup,
  type BattingRow,
  type BowlingRow,
} from "../../lib/scoring";
import type { Innings } from "../../types/innings";
import { AppBar } from "../../components/ui/AppBar";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { PageError } from "../../components/ui/PageError";
import { BallToken } from "../../components/domain/scoring/BallToken";

export function ScorecardPage() {
  const { id = "" } = useParams();

  const matchQ = useQuery({
    queryKey: qk.match(id),
    queryFn: () => matchesApi.get(id),
    enabled: Boolean(id),
  });
  const cardQ = useQuery({
    queryKey: qk.scorecard(id),
    queryFn: () => scoringApi.scorecard(id),
    enabled: Boolean(id),
  });

  const match = matchQ.data;
  const xiAQ = useQuery({
    queryKey: qk.playing11(id, match?.teamAId ?? ""),
    queryFn: () => playing11Api.get(id, match!.teamAId),
    enabled: Boolean(match),
  });
  const xiBQ = useQuery({
    queryKey: qk.playing11(id, match?.teamBId ?? ""),
    queryFn: () => playing11Api.get(id, match!.teamBId),
    enabled: Boolean(match),
  });

  if (matchQ.isPending) return <FullScreenSpinner />;
  if (matchQ.isError || !match)
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
        <AppBar title="Scorecard" backTo={`/matches/${id}`} />
        <PageError error={matchQ.error} onRetry={matchQ.refetch} />
      </div>
    );

  const teamName = (teamId: string) =>
    teamId === match.teamAId
      ? (match.teamA?.name ?? "Team A")
      : (match.teamB?.name ?? "Team B");

  const nameOf = nameLookup([...(xiAQ.data ?? []), ...(xiBQ.data ?? [])]);
  const innings = cardQ.data?.innings ?? [];

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <AppBar title="Scorecard" backTo={`/matches/${id}`} />

      <main className="flex-1 space-y-4 px-4 py-4 pb-12">
        {innings.length === 0 && (
          <p className="py-12 text-center text-sm text-text-faint">
            No innings yet — the scorecard appears once play starts.
          </p>
        )}
        {innings.map((inn) => (
          <InningsCard
            key={inn.id}
            inn={inn}
            title={teamName(inn.battingTeamId)}
            nameOf={nameOf}
          />
        ))}
      </main>
    </div>
  );
}

function InningsCard({
  inn,
  title,
  nameOf,
}: {
  inn: Innings & { balls: import("../../types/scoring").Ball[] };
  title: string;
  nameOf: (id: string) => string;
}) {
  const batting = aggregateBatting(inn.balls, nameOf);
  const bowling = aggregateBowling(inn.balls, nameOf);
  const overs = groupOvers(inn.balls);

  const extras = inn.balls.reduce(
    (sum, b) => sum + (b.extraRuns ?? 0) + (b.isWide || b.isNoBall ? 1 : 0),
    0,
  );

  return (
    <section className="overflow-hidden rounded-lg border border-line bg-surface">
      <header className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">
            Innings {inn.inningsNumber}
          </p>
          <p className="truncate font-display text-base font-bold">{title}</p>
        </div>
        <div className="text-right">
          <p className="font-display text-xl font-bold tnum">
            {inn.totalRuns}/{inn.totalWickets}
          </p>
          <p className="text-xs text-text-dim tnum">{formatOvers(inn.totalBalls)} ov</p>
        </div>
      </header>

      <BattingTable rows={batting} />
      <div className="flex items-center gap-3 border-t border-line-soft px-4 py-2.5 text-xs">
        <span className="flex-1 text-text-dim">Extras</span>
        <span className="font-semibold tnum">{extras}</span>
      </div>
      <div className="flex items-center gap-3 border-t border-line-soft px-4 py-2.5">
        <span className="flex-1 text-sm font-bold uppercase tracking-wide">Total</span>
        <span className="font-display text-base font-bold tnum">
          {inn.totalRuns}/{inn.totalWickets}
          <span className="ml-1 text-xs font-normal text-text-faint">
            ({formatOvers(inn.totalBalls)} ov)
          </span>
        </span>
      </div>

      <BowlingTable rows={bowling} />

      {overs.length > 0 && (
        <div className="space-y-2 border-t border-line px-4 py-3">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-faint">
            Over by over
          </p>
          {overs.map((g) => (
            <div key={g.overIndex} className="flex items-center gap-2">
              <span className="w-8 shrink-0 text-xs text-text-faint tnum">
                {g.overIndex + 1}
              </span>
              <div className="flex min-w-0 flex-1 flex-wrap items-center gap-1">
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
              <span className="shrink-0 text-xs text-text-dim tnum">
                {g.runs}
                {g.wickets > 0 ? ` · ${g.wickets}w` : ""}
              </span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

const NUM_COLS =
  "grid grid-cols-[minmax(0,1fr)_2.25rem_2.25rem_1.5rem_1.5rem_3rem] items-center gap-x-1";

function BattingTable({ rows }: { rows: BattingRow[] }) {
  const empty = rows.length === 0;
  return (
    <div className="px-4 py-2">
      <div className={`${NUM_COLS} pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-faint`}>
        <span>Batter</span>
        <span className="text-right">R</span>
        <span className="text-right">B</span>
        <span className="text-right">4s</span>
        <span className="text-right">6s</span>
        <span className="text-right">SR</span>
      </div>
      {empty && (
        <p className="py-3 text-xs text-text-faint">Yet to bat</p>
      )}
      {rows.map((r) => (
        <div key={r.id} className={`${NUM_COLS} border-t border-line-soft py-2`}>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{r.name}</p>
            <p className="truncate text-[11px] text-text-dim">{r.dismissal}</p>
          </div>
          <span className="text-right text-sm font-bold tnum">{r.runs}</span>
          <span className="text-right text-xs text-text-dim tnum">{r.balls}</span>
          <span className="text-right text-xs text-text-dim tnum">{r.fours}</span>
          <span className="text-right text-xs text-text-dim tnum">{r.sixes}</span>
          <span className="text-right text-xs text-text-dim tnum">{r.sr}</span>
        </div>
      ))}
    </div>
  );
}

const BOWL_COLS = "grid grid-cols-[minmax(0,1fr)_3rem_2.25rem_2.25rem_3rem] items-center gap-x-1";

function BowlingTable({ rows }: { rows: BowlingRow[] }) {
  if (rows.length === 0) return null;
  return (
    <div className="border-t border-line px-4 py-2">
      <p className="pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-faint">
        Bowling
      </p>
      <div className={`${BOWL_COLS} pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-faint`}>
        <span>Bowler</span>
        <span className="text-right">O</span>
        <span className="text-right">R</span>
        <span className="text-right">W</span>
        <span className="text-right">Econ</span>
      </div>
      {rows.map((r) => (
        <div key={r.id} className={`${BOWL_COLS} border-t border-line-soft py-2`}>
          <p className="min-w-0 truncate text-sm font-semibold">{r.name}</p>
          <span className="text-right text-xs tnum">{r.oversText}</span>
          <span className="text-right text-xs tnum">{r.runs}</span>
          <span className="text-right text-sm font-bold tnum">{r.wickets}</span>
          <span className="text-right text-xs text-text-dim tnum">{r.econ}</span>
        </div>
      ))}
    </div>
  );
}
