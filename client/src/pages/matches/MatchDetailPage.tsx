import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { Calendar, Info, MapPin, Star, Timer, Zap } from "lucide-react";

import { inningsApi } from "../../api/innings.api";
import { matchesApi } from "../../api/matches.api";
import { playing11Api } from "../../api/playing11.api";
import { statsApi } from "../../api/stats.api";
import { teamsApi } from "../../api/teams.api";
import { useCanScore } from "../../hooks/useCanScore";
import { errorMessage } from "../../lib/api";
import { MATCH_STATUS_META } from "../../lib/constants";
import { formatMatchWhen, formatOvers, initials, oversFromDecimal } from "../../lib/format";
import { qk } from "../../lib/queryKeys";
import { toast } from "../../stores/toast.store";
import type { Match } from "../../types/match";
import type { MatchPerformanceRow } from "../../types/stats";
import { MatchActionsCard } from "../../components/domain/match/MatchActions";
import { ResultBanner } from "../../components/domain/match/ResultBanner";
import { PlayerPickerSheet } from "../../components/domain/scoring/PlayerPickerSheet";
import { AppBar } from "../../components/ui/AppBar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Chip } from "../../components/ui/Chip";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { PageError } from "../../components/ui/PageError";

const IN_PLAY_STATUSES = new Set([
  "live",
  "innings_break",
  "rain_delayed",
  "bad_light_delayed",
  "umpire_decision_pending",
]);

const TERMINAL_STATUSES = new Set([
  "completed",
  "tied",
  "draw",
  "abandoned",
  "no_result",
]);

export function MatchDetailPage() {
  const { id = "" } = useParams();

  const matchQ = useQuery({ queryKey: qk.match(id), queryFn: () => matchesApi.get(id) });
  const match = matchQ.data;

  const inningsQ = useQuery({
    queryKey: qk.inningsByMatch(id),
    queryFn: () => inningsApi.byMatch(id),
  });

  const canScoreQ = useCanScore(id);

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

  const roleAQ = useQuery({
    queryKey: qk.teamMyRole(match?.teamAId ?? ""),
    queryFn: () => teamsApi.myRole(match!.teamAId),
    enabled: Boolean(match),
  });
  const roleBQ = useQuery({
    queryKey: qk.teamMyRole(match?.teamBId ?? ""),
    queryFn: () => teamsApi.myRole(match!.teamBId),
    enabled: Boolean(match),
  });

  if (matchQ.isPending) return <FullScreenSpinner />;
  if (matchQ.isError || !match)
    return (
      <div className="mx-auto max-w-[480px]">
        <AppBar title="Match" backTo="/matches" />
        <PageError error={matchQ.error} onRetry={matchQ.refetch} />
      </div>
    );

  const teamName = (teamId: string) =>
    teamId === match.teamAId
      ? (match.teamA?.name ?? "Team A")
      : (match.teamB?.name ?? "Team B");

  const inPlay = IN_PLAY_STATUSES.has(match.status);
  const preMatch = match.status === "scheduled" || match.status === "toss_done";

  const isCaptainOfA = roleAQ.data?.role === "captain";
  const isCaptainOfB = roleBQ.data?.role === "captain";
  const canManageA = isCaptainOfA || roleAQ.data?.role === "vice_captain";
  const canManageB = isCaptainOfB || roleBQ.data?.role === "vice_captain";
  const isCaptain = isCaptainOfA || isCaptainOfB;

  const xiCountA = xiAQ.data?.length ?? 0;
  const xiCountB = xiBQ.data?.length ?? 0;
  const bothXIReady = xiCountA === 11 && xiCountB === 11;

  const innings = inningsQ.data ?? [];

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <AppBar title="Match" backTo="/matches" />

      <main className="flex-1 space-y-4 px-4 py-4 pb-12">
        <MatchHeader match={match} teamName={teamName} />

        {TERMINAL_STATUSES.has(match.status) && <ResultBanner match={match} />}

        {TERMINAL_STATUSES.has(match.status) && innings.length > 0 && (
          <Link to={`/matches/${id}/scorecard`}>
            <Button variant="secondary" fullWidth size="lg">
              Full scorecard
            </Button>
          </Link>
        )}

        {match.status === "tied" && (
          <Card className="border-gold/40 bg-gold-soft">
            <p className="text-xs leading-relaxed text-text-dim">
              Scores are level. Six balls each, two wickets each — the super over
              decides the winner.
            </p>
            <Link to={`/matches/${id}/super-over`} className="mt-3 block">
              <Button fullWidth size="lg">
                <Zap className="size-4" />
                Super over
              </Button>
            </Link>
          </Card>
        )}

        <MatchActionsCard
          match={match}
          myRoleA={roleAQ.data?.role ?? null}
          myRoleB={roleBQ.data?.role ?? null}
        />

        {match.status === "completed" && (
          <StatsSection matchId={id} isCaptain={isCaptain} />
        )}

        {match.status === "scheduled" && (
          <Card>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide">
              Toss
            </h3>
            {isCaptainOfA || isCaptainOfB ? (
              <>
                <p className="mt-1 text-xs leading-relaxed text-text-dim">
                  At the ground, record which team won the toss and what they elected.
                </p>
                <Link to={`/matches/${id}/toss`} className="mt-3 block">
                  <Button fullWidth>Record toss</Button>
                </Link>
              </>
            ) : (
              <p className="mt-1 text-xs leading-relaxed text-text-dim">
                Waiting for the toss. A captain records it from this page.
              </p>
            )}
          </Card>
        )}

        {preMatch && (
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-faint">
              Playing XI
            </h3>
            <XIStatusRow
              matchId={id}
              teamId={match.teamAId}
              name={teamName(match.teamAId)}
              count={xiCountA}
              canManage={canManageA}
            />
            <XIStatusRow
              matchId={id}
              teamId={match.teamBId}
              name={teamName(match.teamBId)}
              count={xiCountB}
              canManage={canManageB}
            />

            {match.status === "toss_done" && (
              <Card>
                {bothXIReady ? (
                  <>
                    <p className="text-xs leading-relaxed text-text-dim">
                      Both squads are locked at 11. Time to open the innings.
                    </p>
                    <Link to={`/matches/${id}/innings-setup`} className="mt-3 block">
                      <Button fullWidth size="lg">
                        Start innings
                      </Button>
                    </Link>
                  </>
                ) : (
                  <p className="flex items-start gap-2 text-xs leading-relaxed text-text-dim">
                    <Info className="mt-0.5 size-3.5 shrink-0" />
                    Both teams need exactly 11 selected before the innings can start.
                  </p>
                )}
              </Card>
            )}
          </section>
        )}

        {inPlay && (
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-faint">
              Score
            </h3>
            {innings.length === 0 && (
              <Card>
                <p className="text-sm text-text-dim">Innings starting…</p>
              </Card>
            )}
            {innings.map((inn) => (
              <Link key={inn.id} to={`/matches/${id}/over-summary/${inn.id}`} className="block">
                <Card>
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-text-faint">
                        Innings {inn.inningsNumber}
                      </p>
                      <p className="truncate font-display text-base font-bold">
                        {teamName(inn.battingTeamId)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl font-bold tnum">
                        {inn.totalRuns}/{inn.totalWickets}
                      </p>
                      <p className="text-xs text-text-dim tnum">
                        {formatOvers(inn.totalBalls)} ov
                        {inn.isCompleted ? " · done" : ""}
                      </p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}

            {match.status === "innings_break" && match.target > 0 && innings[0] && (
              <Card className="border-accent/40 bg-accent-soft">
                <p className="font-display text-sm font-bold uppercase tracking-wide text-accent">
                  {teamName(innings[0].bowlingTeamId)} need {match.target + 1} to win
                </p>
              </Card>
            )}

            {match.status === "innings_break" &&
              (isCaptainOfA || isCaptainOfB) &&
              innings.length > 0 && (
                <Link to={`/matches/${id}/innings-setup`} className="block">
                  <Button fullWidth size="lg">
                    Start innings 2
                  </Button>
                </Link>
              )}

            {match.status === "live" && innings.length > 0 && (
              <>
                <div
                  className={
                    canScoreQ.data?.canScore
                      ? "grid grid-cols-3 gap-2"
                      : "grid grid-cols-2 gap-2"
                  }
                >
                  <Link to={`/matches/${id}/live`}>
                    <Button variant="secondary" fullWidth>
                      Watch
                    </Button>
                  </Link>
                  {canScoreQ.data?.canScore && (
                    <Link to={`/matches/${id}/score`}>
                      <Button fullWidth>
                        Score
                      </Button>
                    </Link>
                  )}
                  <Link to={`/matches/${id}/scorecard`}>
                    <Button variant="secondary" fullWidth>
                      Card
                    </Button>
                  </Link>
                </div>
                <Link
                  to={`/matches/${id}/scorer-transfer`}
                  className="block py-1 text-center text-xs font-semibold text-text-dim active:text-text"
                >
                  Scorer settings
                </Link>
              </>
            )}
          </section>
        )}

        {match.status === "postponed" && match.abandonmentReason && (
          <Card>
            <p className="text-xs leading-relaxed text-text-dim">
              Reason: {match.abandonmentReason.replaceAll("_", " ")}
            </p>
          </Card>
        )}
      </main>
    </div>
  );
}

function StatsSection({ matchId, isCaptain }: { matchId: string; isCaptain: boolean }) {
  const queryClient = useQueryClient();
  const [pickerOpen, setPickerOpen] = useState(false);

  const perfQ = useQuery({
    queryKey: qk.matchPerformances(matchId),
    queryFn: () => statsApi.matchPerformances(matchId),
  });
  const rows = perfQ.data;

  const calculate = useMutation({
    mutationFn: () => statsApi.calculate(matchId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: qk.matchPerformances(matchId) });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast.success(res.message);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const setPOTM = useMutation({
    mutationFn: (playerId: string) => statsApi.setPlayerOfMatch(matchId, playerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.matchPerformances(matchId) });
      toast.success("Player of the match updated");
      setPickerOpen(false);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const potm = rows?.find((r) => r.isPlayerOfMatch);

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-text-faint">
          Match stats
        </h3>
        {isCaptain && rows && rows.length > 0 && (
          <button
            type="button"
            disabled={calculate.isPending}
            onClick={() => calculate.mutate()}
            className="text-xs font-semibold text-text-dim active:text-text disabled:opacity-50"
          >
            {calculate.isPending ? "Recalculating…" : "Recalculate"}
          </button>
        )}
      </div>

      {perfQ.isPending && (
        <Card>
          <p className="text-sm text-text-dim">Loading stats…</p>
        </Card>
      )}

      {rows && rows.length === 0 && (
        <Card>
          <p className="text-xs leading-relaxed text-text-dim">
            Career stats haven't been calculated for this match yet. Every player's
            career page updates once they are.
          </p>
          {isCaptain && (
            <Button
              className="mt-3"
              fullWidth
              loading={calculate.isPending}
              onClick={() => calculate.mutate()}
            >
              Calculate stats
            </Button>
          )}
        </Card>
      )}

      {rows && rows.length > 0 && (
        <>
          {potm ? (
            <Card className="flex items-center gap-3 border-gold/40 bg-gold-soft">
              <Star className="size-5 shrink-0 text-gold" />
              <div className="min-w-0 flex-1">
                <p className="text-[11px] font-bold uppercase tracking-wider text-gold">
                  Player of the match
                </p>
                <p className="truncate font-display text-base font-bold">
                  {potm.player.name}
                </p>
              </div>
              {isCaptain && (
                <Button variant="ghost" size="sm" onClick={() => setPickerOpen(true)}>
                  Change
                </Button>
              )}
            </Card>
          ) : (
            isCaptain && (
              <Button fullWidth variant="secondary" onClick={() => setPickerOpen(true)}>
                <Star className="size-4" />
                Pick player of the match
              </Button>
            )
          )}

          <Card className="divide-y divide-line-soft p-0">
            {[...rows]
              .sort((a, b) => b.runsScored - a.runsScored)
              .map((r) => (
                <PerfRow key={r.id} row={r} />
              ))}
          </Card>

          <PlayerPickerSheet
            open={pickerOpen}
            onClose={() => setPickerOpen(false)}
            title="Player of the match"
            hint="Only players with recorded performances can win it."
            players={rows.map((r) => ({
              id: r.player.id,
              name: r.player.name,
              note: `${r.runsScored}r · ${r.wicketsTaken}w`,
              disabled: r.isPlayerOfMatch,
            }))}
            onSelect={(p) => setPOTM.mutate(p.id)}
          />
        </>
      )}
    </section>
  );
}

function PerfRow({ row }: { row: MatchPerformanceRow }) {
  const bowled = parseFloat(row.oversBowled) > 0;

  return (
    <Link
      to={`/players/${row.player.id}`}
      state={{ name: row.player.name }}
      className="flex items-center gap-3 px-4 py-3 active:bg-elevated"
    >
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-1.5 truncate text-sm font-semibold">
          {row.player.name}
          {row.isPlayerOfMatch && <Star className="size-3 shrink-0 text-gold" />}
        </p>
        <p className="text-[11px] text-text-faint">{row.team?.name}</p>
      </div>
      <div className="text-right">
        <p className="text-sm tnum">
          {row.runsScored}
          <span className="text-text-faint"> ({row.ballsFaced})</span>
        </p>
        {bowled && (
          <p className="text-[11px] text-text-dim tnum">
            {oversFromDecimal(parseFloat(row.oversBowled))}-{row.maidens}-
            {row.runsConceded}-{row.wicketsTaken}
          </p>
        )}
      </div>
    </Link>
  );
}

function MatchHeader({
  match,
  teamName,
}: {
  match: Match;
  teamName: (teamId: string) => string;
}) {
  const meta = MATCH_STATUS_META[match.status];

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-display text-lg font-bold leading-snug">
            {teamName(match.teamAId)}{" "}
            <span className="text-text-faint">vs</span> {teamName(match.teamBId)}
          </p>
          <p className="mt-1.5 flex items-center gap-1 text-xs text-text-dim">
            <Calendar className="size-3 shrink-0" />
            {formatMatchWhen(match.matchDate, match.matchTime)}
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-text-dim">
            {match.venue && (
              <span className="flex items-center gap-1">
                <MapPin className="size-3 shrink-0" />
                {match.venue}
              </span>
            )}
            <span className="flex items-center gap-1 tnum">
              <Timer className="size-3 shrink-0" />
              {match.totalOvers} ov
            </span>
          </div>
        </div>
        <Chip tone={meta.tone}>{meta.label}</Chip>
      </div>

      {match.tossWinnerId && match.tossChoice && (
        <p className="mt-3 rounded-md bg-elevated px-3 py-2 text-xs text-text-dim">
          <span className="font-semibold text-text">
            {teamName(match.tossWinnerId)}
          </span>{" "}
          won the toss · chose to {match.tossChoice === "bat" ? "bat" : "bowl"}
        </p>
      )}
    </Card>
  );
}

function XIStatusRow({
  matchId,
  teamId,
  name,
  count,
  canManage,
}: {
  matchId: string;
  teamId: string;
  name: string;
  count: number;
  canManage: boolean;
}) {
  const ready = count === 11;
  return (
    <Card className="p-0">
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-elevated font-display text-sm font-bold text-text-dim">
          {initials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{name}</p>
          <p className={ready ? "text-xs font-semibold text-accent tnum" : "text-xs text-text-dim tnum"}>
            {count}/11 selected
          </p>
        </div>
        <Link to={`/matches/${matchId}/playing11/${teamId}`}>
          <Button variant="secondary" size="sm">
            {canManage ? (count > 0 ? "Edit XI" : "Pick XI") : "View"}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
