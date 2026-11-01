import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { inningsApi } from "../../api/innings.api";
import { matchesApi } from "../../api/matches.api";
import { playing11Api } from "../../api/playing11.api";
import { scoringApi } from "../../api/scoring.api";
import { useCanScore } from "../../hooks/useCanScore";
import { errorMessage } from "../../lib/api";
import { formatOvers } from "../../lib/format";
import { qk } from "../../lib/queryKeys";
import {
  aggregateBatting,
  aggregateBowling,
  ballToken,
  chaseInfo,
  currentOverBalls,
  nameLookup,
  outIdsFromBalls,
  runRate,
} from "../../lib/scoring";
import { toast } from "../../stores/toast.store";
import type { DismissalType, RetirementReason } from "../../types/enums";
import type { RecordBallInput } from "../../types/scoring";
import { AppBar } from "../../components/ui/AppBar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { PageError } from "../../components/ui/PageError";
import { BallByBallStrip } from "../../components/domain/scoring/BallByBallStrip";
import { BallToken } from "../../components/domain/scoring/BallToken";
import { BatsmenStrip } from "../../components/domain/scoring/BatsmenStrip";
import { BowlerStrip } from "../../components/domain/scoring/BowlerStrip";
import { PlayerPickerSheet } from "../../components/domain/scoring/PlayerPickerSheet";
import { RetireHurtSheet } from "../../components/domain/scoring/RetireHurtSheet";
import { ScoreHeader } from "../../components/domain/scoring/ScoreHeader";
import { WicketDialog } from "../../components/domain/scoring/WicketDialog";
import { cn } from "../../lib/cn";

type ExtraMode = "wide" | "noball" | "bye" | "legbye";

const EXTRA_MODES: { key: ExtraMode; label: string }[] = [
  { key: "wide", label: "Wide" },
  { key: "noball", label: "No ball" },
  { key: "bye", label: "Bye" },
  { key: "legbye", label: "Leg bye" },
];

interface BatsmanNeed {
  dismissedId: string;
  survivor: string;
  /** true when the replacement takes the striker slot */
  strikerIsNew: boolean;
}

export function ScoringConsolePage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const permQ = useCanScore(id);
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

  const [busy, setBusy] = useState(false);
  const [extraMode, setExtraMode] = useState<ExtraMode | null>(null);
  const [wicketOpen, setWicketOpen] = useState(false);
  const [retireOpen, setRetireOpen] = useState(false);
  const [batsmanNeed, setBatsmanNeed] = useState<BatsmanNeed | null>(null);
  const [bowlerNeed, setBowlerNeed] = useState(false);
  const [pickStriker, setPickStriker] = useState<string | null>(null);

  const balls = cardQ.data?.innings.find((i) => i.id === inn?.id)?.balls ?? [];
  const nameOf = nameLookup([...(xiBatQ.data ?? []), ...(xiBowlQ.data ?? [])]);
  const battingRows = aggregateBatting(balls, nameOf);
  const bowlingRows = aggregateBowling(balls, nameOf);
  const outIds = outIdsFromBalls(balls);

  const teamName = (teamId: string) =>
    teamId === match?.teamAId
      ? (match?.teamA?.name ?? "Team A")
      : (match?.teamB?.name ?? "Team B");

  const target =
    match?.target && match.target > 0
      ? match.target
      : inn?.inningsNumber === 2
        ? (inningsList[0]?.totalRuns ?? null)
        : null;
  const { chase, rrr, targetNote } = chaseInfo(
    target,
    inn?.totalRuns ?? 0,
    inn?.totalBalls ?? 0,
    match?.totalOvers ?? 0,
  );

  /* Opening batters were never set for this innings */
  const needStriker = Boolean(inn && !inn.strikerId);
  const needNonStriker = Boolean(inn && !inn.nonStrikerId);
  const openingNeeded = inn ? needStriker || needNonStriker : false;

  useEffect(() => {
    setPickStriker(null);
  }, [inn?.id]);

  function invalidateAll() {
    void queryClient.invalidateQueries({ queryKey: qk.scorecard(id) });
    void queryClient.invalidateQueries({ queryKey: qk.inningsByMatch(id) });
    void queryClient.invalidateQueries({ queryKey: qk.match(id) });
  }

  async function record(
    input: Omit<RecordBallInput, "inningsId" | "batsmanId" | "bowlerId">,
  ) {
    if (!inn || !inn.strikerId || !inn.currentBowlerId || busy) return;
    setBusy(true);
    try {
      const res = await scoringApi.recordBall({
        inningsId: inn.id,
        batsmanId: inn.strikerId,
        bowlerId: inn.currentBowlerId,
        ...input,
      });
      setExtraMode(null);
      invalidateAll();

      if (res.inningsCompleted || res.matchCompleted) {
        toast.success(res.matchCompleted ? "Match completed" : "Innings completed");
        navigate(`/matches/${id}`, { replace: true });
        return;
      }
      if (res.wicket) {
        const dismissedId =
          res.wicket.type === "runout"
            ? (res.ball.dismissedPlayerId ?? res.ball.batsmanId)
            : res.ball.batsmanId;
        const survivor =
          res.innings.strikerId === dismissedId
            ? res.innings.nonStrikerId
            : res.innings.strikerId;
        if (survivor) {
          setBatsmanNeed({
            dismissedId,
            survivor,
            strikerIsNew: res.innings.strikerId === dismissedId,
          });
        }
      }
      if (res.overCompleted) setBowlerNeed(true);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  const onRuns = (n: number) => {
    if (extraMode === "wide") return record({ runs: n, isWide: true });
    if (extraMode === "noball") return record({ runs: n, isNoBall: true });
    if (extraMode === "bye") return record({ runs: n, isBye: true });
    if (extraMode === "legbye") return record({ runs: n, isLegBye: true });
    return record({ runs: n });
  };

  const onWicket = (input: {
    wicketType: DismissalType;
    dismissedPlayerId?: string;
    runs: number;
  }) => {
    setWicketOpen(false);
    void record({
      runs: input.runs,
      isWicket: true,
      wicketType: input.wicketType,
      dismissedPlayerId: input.dismissedPlayerId,
    });
  };

  const onRetire = async (input: { playerId: string; reason: RetirementReason }) => {
    if (!inn) return;
    try {
      await scoringApi.retireHurt(inn.id, {
        playerId: input.playerId,
        reason: input.reason,
      });
      toast.success("Batter retired hurt");
      setRetireOpen(false);
      invalidateAll();
      const survivor =
        inn.strikerId === input.playerId ? inn.nonStrikerId : inn.strikerId;
      if (survivor) {
        setBatsmanNeed({
          dismissedId: input.playerId,
          survivor,
          strikerIsNew: inn.strikerId === input.playerId,
        });
      }
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const onNewBatsman = async (p: { id: string }) => {
    if (!inn || !batsmanNeed) return;
    const striker = batsmanNeed.strikerIsNew ? p.id : batsmanNeed.survivor;
    const nonStriker = batsmanNeed.strikerIsNew ? batsmanNeed.survivor : p.id;
    try {
      await inningsApi.setBatsmen(inn.id, striker, nonStriker);
      setBatsmanNeed(null);
      invalidateAll();
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const onOpeningPick = async (p: { id: string }) => {
    if (!inn) return;
    if (needStriker && !pickStriker) {
      setPickStriker(p.id);
      return;
    }
    const striker = needStriker ? pickStriker! : inn.strikerId!;
    try {
      await inningsApi.setBatsmen(inn.id, striker, p.id);
      setPickStriker(null);
      invalidateAll();
      toast.success("Batters set");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  const onBowler = async (p: { id: string }) => {
    if (!inn) return;
    try {
      await inningsApi.setBowler(inn.id, p.id);
      setBowlerNeed(false);
      invalidateAll();
      toast.success("Bowler set");
    } catch (e) {
      toast.error(errorMessage(e));
    }
  };

  if (permQ.isPending || matchQ.isPending) return <FullScreenSpinner />;
  if (matchQ.isError || !match)
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
        <AppBar title="Scoring" backTo={`/matches/${id}`} />
        <PageError error={matchQ.error} onRetry={matchQ.refetch} />
      </div>
    );
  if (permQ.data && !permQ.data.canScore)
    return <Navigate to={`/matches/${id}/live`} replace />;

  const creaseIds = new Set(
    [inn?.strikerId, inn?.nonStrikerId, pickStriker].filter(
      (x): x is string => Boolean(x),
    ),
  );
  const batsmanOptions = (xiBatQ.data ?? [])
    .filter((p) => !outIds.has(p.id) && !creaseIds.has(p.id))
    .map((p) => ({ id: p.id, name: p.name }));

  const maxOvers = Math.ceil(match.totalOvers / 5);
  const bowlerOptions = (xiBowlQ.data ?? [])
    .filter((p) => p.id !== inn?.currentBowlerId)
    .map((p) => {
      const row = bowlingRows.find((r) => r.id === p.id);
      const quotaFull = Math.floor((row?.legalBalls ?? 0) / 6) >= maxOvers;
      return {
        id: p.id,
        name: p.name,
        note: row ? `${row.oversText} ov · ${row.runs}r · ${row.wickets}w` : "0.0 ov",
        disabled: quotaFull,
      };
    });

  const runoutVictims = (xiBatQ.data ?? [])
    .filter((p) => !outIds.has(p.id))
    .map((p) => ({ id: p.id, name: p.name }));

  const creaseBatters = [
    { id: inn?.strikerId, name: nameOf(inn?.strikerId ?? ""), onStrike: true },
    { id: inn?.nonStrikerId, name: nameOf(inn?.nonStrikerId ?? ""), onStrike: false },
  ].filter((b): b is { id: string; name: string; onStrike: boolean } => Boolean(b.id));

  const thisOver = currentOverBalls(balls);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <AppBar title="Scoring" backTo={`/matches/${id}`} />

      <main className="flex-1 space-y-3 px-4 py-4 pb-16">
        <ScoreHeader
          teamName={inn ? teamName(inn.battingTeamId) : "—"}
          runs={inn?.totalRuns ?? 0}
          wickets={inn?.totalWickets ?? 0}
          oversText={formatOvers(inn?.totalBalls ?? 0)}
          crr={runRate(inn?.totalRuns ?? 0, inn?.totalBalls ?? 0)}
          rrr={rrr}
          targetNote={targetNote}
          chaseLine={chase}
        />

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
                <p className="text-xs text-text-faint">First ball of the over coming up</p>
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

        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-faint">
              Extras
            </p>
            <p className="text-[11px] text-text-faint">
              {extraMode ? "now tap the runs" : "tap a type, then the runs"}
            </p>
          </div>
          <div className="grid grid-cols-4 gap-2">
            {EXTRA_MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                disabled={busy}
                onClick={() => setExtraMode(extraMode === m.key ? null : m.key)}
                className={cn(
                  "h-9 rounded-full border text-xs font-semibold uppercase tracking-wide transition-colors disabled:opacity-40",
                  extraMode === m.key
                    ? "border-info bg-info-soft text-info"
                    : "border-line bg-elevated text-text-dim active:bg-line",
                )}
              >
                {m.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                disabled={busy}
                onClick={() => onRuns(n)}
                className={cn(
                  "h-14 rounded-lg border font-display text-xl font-bold tnum transition-colors disabled:opacity-40",
                  n === 4
                    ? "border-accent/40 bg-accent-soft text-accent active:bg-accent/20"
                    : n === 6
                      ? "border-gold/40 bg-gold-soft text-gold active:bg-gold/20"
                      : n === 0
                        ? "border-line bg-surface text-text-faint active:bg-line"
                        : "border-line bg-elevated text-text active:bg-line",
                )}
              >
                {n}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="danger"
              size="lg"
              disabled={busy}
              onClick={() => setWicketOpen(true)}
            >
              Wicket
            </Button>
            <Button
              variant="secondary"
              size="lg"
              disabled={busy || creaseBatters.length === 0}
              onClick={() => setRetireOpen(true)}
            >
              Retire
            </Button>
          </div>
        </Card>
      </main>

      <WicketDialog
        open={wicketOpen}
        onClose={() => setWicketOpen(false)}
        onSubmit={onWicket}
        submitting={busy}
        players={runoutVictims}
        strikerId={inn?.strikerId}
        nonStrikerId={inn?.nonStrikerId}
      />

      <RetireHurtSheet
        open={retireOpen}
        onClose={() => setRetireOpen(false)}
        onSubmit={onRetire}
        batters={creaseBatters}
      />

      <PlayerPickerSheet
        open={Boolean(batsmanNeed)}
        onClose={() => setBatsmanNeed(null)}
        title="New batter"
        hint="Pick who replaces the dismissed batter. They can be retired or out — the other end stays."
        players={batsmanOptions}
        onSelect={(p) => void onNewBatsman(p)}
      />

      <PlayerPickerSheet
        open={bowlerNeed && !batsmanNeed}
        onClose={() => setBowlerNeed(false)}
        title="Next bowler"
        hint={`Over complete. Max ${maxOvers} overs per bowler.`}
        players={bowlerOptions}
        onSelect={(p) => void onBowler(p)}
      />

      <PlayerPickerSheet
        open={openingNeeded && !batsmanNeed}
        onClose={() => setPickStriker(null)}
        title={needStriker && !pickStriker ? "Select striker" : "Select non-striker"}
        hint="Set the two batters at the crease to start scoring."
        players={batsmanOptions}
        onSelect={(p) => void onOpeningPick(p)}
      />
    </div>
  );
}
