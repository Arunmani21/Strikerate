import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { Handshake, Target, Zap } from "lucide-react";

import { matchesApi } from "../../api/matches.api";
import { playing11Api } from "../../api/playing11.api";
import { superOverApi } from "../../api/superOver.api";
import { teamsApi } from "../../api/teams.api";
import { errorMessage } from "../../lib/api";
import { qk } from "../../lib/queryKeys";
import { toast } from "../../stores/toast.store";
import type { SuperOver } from "../../types/superOver";
import { AppBar } from "../../components/ui/AppBar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { PageError } from "../../components/ui/PageError";

export function SuperOverScoringPage() {
  const { id = "", superOverId = "" } = useParams();
  const queryClient = useQueryClient();
  const [wicketOpen, setWicketOpen] = useState(false);

  const soQ = useQuery({
    queryKey: ["super-overs", id, superOverId],
    queryFn: () => superOverApi.get(id, superOverId),
    refetchInterval: (q) => (q.state.data?.status === "in_progress" ? 3000 : false),
  });
  const so = soQ.data;

  const roleAQ = useQuery({
    queryKey: qk.teamMyRole(so?.teamAId ?? ""),
    queryFn: () => teamsApi.myRole(so!.teamAId),
    enabled: Boolean(so),
  });
  const roleBQ = useQuery({
    queryKey: qk.teamMyRole(so?.teamBId ?? ""),
    queryFn: () => teamsApi.myRole(so!.teamBId),
    enabled: Boolean(so),
  });

  const xiAQ = useQuery({
    queryKey: qk.playing11(id, so?.teamAId ?? ""),
    queryFn: () => playing11Api.get(id, so!.teamAId),
    enabled: Boolean(so),
  });
  const xiBQ = useQuery({
    queryKey: qk.playing11(id, so?.teamBId ?? ""),
    queryFn: () => playing11Api.get(id, so!.teamBId),
    enabled: Boolean(so),
  });

  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["super-overs", id] });

  const begin = useMutation({
    mutationFn: () => superOverApi.begin(id, superOverId),
    onSuccess: () => {
      invalidate();
      toast.success("Super over started");
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const ball = useMutation({
    mutationFn: (input: { runs: number; isWide?: boolean; isNoBall?: boolean; isWicket?: boolean }) => {
      const battingNow = currentBattingTeam(so!);
      const bowlingNow = battingNow === so!.teamAId ? so!.teamBId : so!.teamAId;
      const batsmanId = (battingNow === so!.teamAId ? xiAQ.data : xiBQ.data)?.[0]?.id;
      const bowlerId = (bowlingNow === so!.teamAId ? xiAQ.data : xiBQ.data)?.[0]?.id;
      if (!batsmanId || !bowlerId) {
        return Promise.reject(new Error("Playing XIs are missing for this match"));
      }
      return superOverApi.ball(id, {
        superOverId,
        batsmanId,
        bowlerId,
        ...input,
      });
    },
    onSuccess: () => invalidate(),
    onError: (e) => {
      if (!String(errorMessage(e)).toLowerCase().includes("still tied")) {
        toast.error(errorMessage(e));
      }
      invalidate();
    },
  });

  const declareTie = useMutation({
    mutationFn: () => matchesApi.declareTie(id),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: qk.match(id) });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success(res.message);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (soQ.isPending || !so) return <FullScreenSpinner />;
  if (soQ.isError)
    return (
      <div className="mx-auto max-w-[480px]">
        <AppBar title="Super over" backTo={`/matches/${id}/super-over`} />
        <PageError error={soQ.error} onRetry={soQ.refetch} />
      </div>
    );

  const teamName = (teamId: string | null) =>
    teamId === so.teamAId
      ? (so.teamA?.name ?? "Team A")
      : teamId === so.teamBId
        ? (so.teamB?.name ?? "Team B")
        : "—";

  const isCaptain =
    roleAQ.data?.role === "captain" || roleBQ.data?.role === "captain";
  const started = so.status !== "scheduled" && so.status !== "abandoned";
  const first = so.teamABattingFirst ? so.teamAId : so.teamBId;
  const second = so.teamABattingFirst ? so.teamBId : so.teamAId;
  const firstScore = so.teamABattingFirst
    ? { runs: so.teamARuns, wkts: so.teamAWickets }
    : { runs: so.teamBRuns, wkts: so.teamBWickets };
  const secondScore = so.teamABattingFirst
    ? { runs: so.teamBRuns, wkts: so.teamBWickets }
    : { runs: so.teamARuns, wkts: so.teamAWickets };

  const battingNow = currentBattingTeam(so);
  const currentScore = battingNow === first ? firstScore : secondScore;
  const currentBalls = so.currentBall;
  const inningsOver = currentBalls >= 6 || currentScore.wkts >= 2;
  const secondUnderway = so.currentOver >= 1;
  const tiePending =
    so.status === "in_progress" &&
    secondUnderway &&
    inningsOver &&
    secondScore.runs === firstScore.runs;
  const padEnabled = isCaptain && so.status === "in_progress" && !inningsOver;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <AppBar title="Super over" backTo={`/matches/${id}/super-over`} />

      <main className="flex-1 space-y-4 px-4 py-4 pb-12">
        {so.status === "scheduled" && (
          <Card>
            <p className="font-display text-sm font-bold uppercase tracking-wide">
              Ready to start
            </p>
            <p className="mt-1 text-xs text-text-dim">
              Toss: {teamName(so.tossWinnerTeamId)} elected to{" "}
              {so.tossChoice === "bowl" ? "bowl" : "bat"}.
            </p>
            {isCaptain && (
              <Button
                className="mt-3"
                fullWidth
                size="lg"
                loading={begin.isPending}
                onClick={() => begin.mutate()}
              >
                <Zap className="size-4" />
                Begin super over
              </Button>
            )}
          </Card>
        )}

        {started && (
          <Card>
            <InningsRow
              name={teamName(first)}
              runs={firstScore.runs}
              wkts={firstScore.wkts}
              active={battingNow === first && so.status === "in_progress"}
              note={so.currentOver === 0 ? "batting" : "done"}
            />
            <div className="my-2 border-t border-line-soft" />
            <InningsRow
              name={teamName(second)}
              runs={secondScore.runs}
              wkts={secondScore.wkts}
              active={battingNow === second && so.status === "in_progress"}
              note={
                so.status === "completed" || secondUnderway
                  ? secondUnderway
                    ? `${currentBalls}/6 balls`
                    : "yet to bat"
                  : "yet to bat"
              }
            />

            {secondUnderway && so.targetRuns != null && so.status === "in_progress" && (
              <p className="mt-3 flex items-center gap-2 rounded-md bg-accent-soft px-3 py-2 text-xs font-semibold text-accent tnum">
                <Target className="size-3.5 shrink-0" />
                {secondScore.runs > firstScore.runs
                  ? `${teamName(second)} are ahead`
                  : `${teamName(second)} need ${Math.max(0, firstScore.runs + 1 - secondScore.runs)} more run${firstScore.runs + 1 - secondScore.runs === 1 ? "" : "s"} to win`}
              </p>
            )}

            {so.status === "in_progress" && (
              <p className="mt-2 text-center text-[11px] text-text-faint">
                {currentScore.wkts >= 2
                  ? "Innings over — two wickets down"
                  : currentBalls >= 6
                    ? "Innings over — six balls bowled"
                    : "Updates every few seconds"}
              </p>
            )}
          </Card>
        )}

        {so.status === "in_progress" && padEnabled && (
          <Card>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide">
              {teamName(battingNow)} batting
            </h3>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[0, 1, 2, 3, 4, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  disabled={ball.isPending}
                  onClick={() => ball.mutate({ runs: n })}
                  className="flex h-14 items-center justify-center rounded-md border border-line bg-elevated font-display text-xl font-bold active:bg-line disabled:opacity-40"
                >
                  {n}
                </button>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-2">
              <button
                type="button"
                disabled={ball.isPending}
                onClick={() => ball.mutate({ runs: 0, isWide: true })}
                className="flex h-12 items-center justify-center rounded-md border border-info/40 bg-info-soft text-xs font-bold uppercase tracking-wide text-info active:opacity-80 disabled:opacity-40"
              >
                Wide
              </button>
              <button
                type="button"
                disabled={ball.isPending}
                onClick={() => ball.mutate({ runs: 0, isNoBall: true })}
                className="flex h-12 items-center justify-center rounded-md border border-warn/40 bg-warn-soft text-xs font-bold uppercase tracking-wide text-warn active:opacity-80 disabled:opacity-40"
              >
                No ball
              </button>
              <button
                type="button"
                disabled={ball.isPending}
                onClick={() => setWicketOpen(true)}
                className="flex h-12 items-center justify-center rounded-md border border-wicket/40 bg-wicket-soft text-xs font-bold uppercase tracking-wide text-wicket active:opacity-80 disabled:opacity-40"
              >
                Wicket
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-text-faint">
              Wide & no-ball add 1 run and don't use a ball · 2 wickets ends the innings
            </p>
          </Card>
        )}

        {so.status === "in_progress" && !isCaptain && (
          <p className="text-center text-xs text-text-faint">
            A captain scores the super over from this page.
          </p>
        )}

        {tiePending && (
          <Card className="border-gold/40 bg-gold-soft">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-gold">
              Still tied!
            </p>
            <p className="mt-1 text-xs leading-relaxed text-text-dim">
              Scores are level after both super-over innings. Another super over
              decides the match.
            </p>
            {isCaptain ? (
              <Button
                className="mt-3"
                variant="secondary"
                fullWidth
                loading={declareTie.isPending}
                onClick={() => declareTie.mutate()}
              >
                <Handshake className="size-4" />
                Declare tie · set up another
              </Button>
            ) : (
              <p className="mt-2 text-xs text-text-dim">
                Waiting for a captain to declare the tie.
              </p>
            )}
            {declareTie.isSuccess && (
              <Link to={`/matches/${id}/super-over`} className="mt-3 block">
                <Button fullWidth>Set up super over 2</Button>
              </Link>
            )}
          </Card>
        )}

        {so.status === "completed" && (
          <Card className="border-accent/40 bg-accent-soft">
            <p className="font-display text-lg font-bold uppercase tracking-wide text-accent">
              {so.wonByTeamId ? teamName(so.wonByTeamId) : "Result"} wins
            </p>
            {so.margin && (
              <p className="mt-1 text-sm text-text-dim">by {so.margin}</p>
            )}
            <Link to={`/matches/${id}`} className="mt-3 block">
              <Button fullWidth>Back to match</Button>
            </Link>
          </Card>
        )}
      </main>

      <ConfirmDialog
        open={wicketOpen}
        onClose={() => setWicketOpen(false)}
        onConfirm={() => {
          setWicketOpen(false);
          ball.mutate({ runs: 0, isWicket: true });
        }}
        title="Record a wicket?"
        message="Wickets cannot be undone. Two wickets end this super-over innings."
        confirmLabel="Wicket"
        danger
        loading={ball.isPending}
      />
    </div>
  );
}

function currentBattingTeam(so: SuperOver): string {
  const first = so.teamABattingFirst ? so.teamAId : so.teamBId;
  return so.currentOver === 0 ? first : first === so.teamAId ? so.teamBId : so.teamAId;
}

function InningsRow({
  name,
  runs,
  wkts,
  active,
  note,
}: {
  name: string;
  runs: number;
  wkts: number;
  active: boolean;
  note: string;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-md px-3 py-2 ${
        active ? "border border-accent/40 bg-accent-soft" : "bg-elevated"
      }`}
    >
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="text-[11px] uppercase tracking-wider text-text-faint">{note}</p>
      </div>
      <p className="font-display text-xl font-bold tnum">
        {runs}
        <span className="text-text-dim">/{wkts}</span>
      </p>
    </div>
  );
}
