import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import { ArrowRight, Zap } from "lucide-react";

import { matchesApi } from "../../api/matches.api";
import { superOverApi } from "../../api/superOver.api";
import { teamsApi } from "../../api/teams.api";
import { errorMessage } from "../../lib/api";
import { qk } from "../../lib/queryKeys";
import { toast } from "../../stores/toast.store";
import type { TossChoice } from "../../types/enums";
import type { SuperOver } from "../../types/superOver";
import { AppBar } from "../../components/ui/AppBar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Chip } from "../../components/ui/Chip";
import { EmptyState } from "../../components/ui/EmptyState";
import { Field } from "../../components/ui/Field";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { PageError } from "../../components/ui/PageError";
import { SegmentedTabs } from "../../components/ui/SegmentedTabs";
import { SO_STATUS_META } from "../../lib/constants";

export function SuperOverPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const matchQ = useQuery({ queryKey: qk.match(id), queryFn: () => matchesApi.get(id) });
  const match = matchQ.data;

  const superOversQ = useQuery({
    queryKey: qk.superOvers(id),
    queryFn: () => superOverApi.list(id),
    refetchInterval: (q) =>
      q.state.data?.some((s) => s.status === "scheduled" || s.status === "in_progress")
        ? 5000
        : false,
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

  const start = useMutation({
    mutationFn: async (so: SuperOver) => {
      const res = await superOverApi.begin(id, so.id);
      return { so: res.superOver };
    },
    onSuccess: ({ so }) => {
      queryClient.invalidateQueries({ queryKey: qk.superOvers(id) });
      navigate(`/matches/${id}/super-over/${so.id}/score`);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  if (matchQ.isPending || superOversQ.isPending) return <FullScreenSpinner />;
  if (matchQ.isError || !match)
    return (
      <div className="mx-auto max-w-[480px]">
        <AppBar title="Super over" backTo={`/matches/${id}`} />
        <PageError error={matchQ.error} onRetry={matchQ.refetch} />
      </div>
    );

  const teamName = (teamId: string | null) =>
    teamId === match.teamAId
      ? (match.teamA?.name ?? "Team A")
      : teamId === match.teamBId
        ? (match.teamB?.name ?? "Team B")
        : "—";

  const superOvers = superOversQ.data ?? [];
  const isCaptain =
    roleAQ.data?.role === "captain" || roleBQ.data?.role === "captain";
  const activeSo = superOvers.find(
    (s) => s.status === "scheduled" || s.status === "in_progress",
  );
  const canSetSetupUp = match.status === "tied" && !activeSo;

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <AppBar title="Super over" backTo={`/matches/${id}`} />

      <main className="flex-1 space-y-4 px-4 py-4 pb-12">
        <p className="flex items-center gap-2 text-xs leading-relaxed text-text-dim">
          <Zap className="size-3.5 shrink-0 text-gold" />
          Six balls each, two wickets each. Scores level after both innings means
          another super over.
        </p>

        {canSetSetupUp && isCaptain && (
          <SetupForm
            matchId={id}
            teamAName={teamName(match.teamAId)}
            teamBName={teamName(match.teamBId)}
            teamAId={match.teamAId}
            teamBId={match.teamBId}
            nextNumber={superOvers.length + 1}
            onCreated={(so) =>
              navigate(`/matches/${id}/super-over/${so.id}/score`)
            }
          />
        )}

        {match.status === "tied" && !isCaptain && canSetSetupUp && (
          <Card>
            <p className="text-xs leading-relaxed text-text-dim">
              A captain sets up the super over from this page.
            </p>
          </Card>
        )}

        {activeSo?.status === "scheduled" && (
          <Card className="border-accent/40 bg-accent-soft">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-accent">
              Super over {activeSo.superOverNumber} ready
            </p>
            <p className="mt-1 text-xs text-text-dim">
              {teamName(activeSo.tossWinnerTeamId)} won the toss.
            </p>
            {isCaptain && (
              <Button
                className="mt-3"
                fullWidth
                size="lg"
                loading={start.isPending}
                onClick={() => start.mutate(activeSo)}
              >
                Start super over
              </Button>
            )}
          </Card>
        )}

        {activeSo?.status === "in_progress" && (
          <Card className="border-accent/40 bg-accent-soft">
            <p className="font-display text-sm font-bold uppercase tracking-wide text-accent">
              Super over {activeSo.superOverNumber} in progress
            </p>
            <Link to={`/matches/${id}/super-over/${activeSo.id}/score`} className="mt-3 block">
              <Button fullWidth size="lg">
                {isCaptain ? "Open scoring" : "Follow live"}
                <ArrowRight className="size-4" />
              </Button>
            </Link>
          </Card>
        )}

        {superOvers.length === 0 && !canSetSetupUp && (
          <EmptyState
            icon={Zap}
            title="No super overs yet"
            hint="When a match ends tied, a captain sets up a super over here."
          />
        )}

        {superOvers.map((so) => (
          <SuperOverCard
            key={so.id}
            so={so}
            teamName={teamName}
            matchId={id}
          />
        ))}
      </main>
    </div>
  );
}

function SetupForm({
  matchId,
  teamAName,
  teamBName,
  teamAId,
  teamBId,
  nextNumber,
  onCreated,
}: {
  matchId: string;
  teamAName: string;
  teamBName: string;
  teamAId: string;
  teamBId: string;
  nextNumber: number;
  onCreated: (so: SuperOver) => void;
}) {
  const queryClient = useQueryClient();
  const [tossWinner, setTossWinner] = useState(teamAId);
  const [choice, setChoice] = useState<TossChoice>("bat");

  const create = useMutation({
    mutationFn: () =>
      superOverApi.create(matchId, {
        type: nextNumber > 1 ? "tie_breaker" : "standard",
        tossWinnerTeamId: tossWinner,
        tossChoice: choice,
      }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["super-overs"] });
      toast.success(res.message);
      onCreated(res.superOver);
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <Card>
      <h3 className="font-display text-sm font-bold uppercase tracking-wide">
        Set up super over {nextNumber}
      </h3>
      <div className="mt-3 space-y-4">
        <Field label="Who won the toss?">
          <SegmentedTabs
            items={[
              { value: teamAId, label: teamAName },
              { value: teamBId, label: teamBName },
            ]}
            value={tossWinner}
            onChange={setTossWinner}
          />
        </Field>
        <Field label="They elected to">
          <SegmentedTabs
            items={[
              { value: "bat", label: "Bat first" },
              { value: "bowl", label: "Bowl first" },
            ]}
            value={choice}
            onChange={setChoice}
          />
        </Field>
        <Button fullWidth size="lg" loading={create.isPending}>
          Create super over
        </Button>
      </div>
    </Card>
  );
}

function SuperOverCard({
  so,
  teamName,
  matchId,
}: {
  so: SuperOver;
  teamName: (teamId: string | null) => string;
  matchId: string;
}) {
  const meta = SO_STATUS_META[so.status];
  const battingFirst = so.teamABattingFirst ? so.teamAId : so.teamBId;
  const battingSecond = so.teamABattingFirst ? so.teamBId : so.teamAId;
  const started = so.status === "in_progress" || so.status === "completed";
  const firstRuns = so.teamABattingFirst ? so.teamARuns : so.teamBRuns;
  const firstWkts = so.teamABattingFirst ? so.teamAWickets : so.teamBWickets;
  const secondRuns = so.teamABattingFirst ? so.teamBRuns : so.teamARuns;
  const secondWkts = so.teamABattingFirst ? so.teamBWickets : so.teamAWickets;

  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <p className="font-display text-sm font-bold uppercase tracking-wide">
          Super over {so.superOverNumber}
          {so.type === "tie_breaker" ? " · decider" : ""}
        </p>
        <Chip tone={meta.tone}>{meta.label}</Chip>
      </div>

      {started ? (
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between rounded-md bg-elevated px-3 py-2">
            <span className="truncate text-sm font-semibold">{teamName(battingFirst)}</span>
            <span className="font-display text-base font-bold tnum">
              {firstRuns}/{firstWkts}
            </span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-elevated px-3 py-2">
            <span className="truncate text-sm font-semibold">{teamName(battingSecond)}</span>
            <span className="font-display text-base font-bold tnum">
              {so.status === "completed" || so.currentOver >= 1
                ? `${secondRuns}/${secondWkts}`
                : "yet to bat"}
            </span>
          </div>
        </div>
      ) : (
        <p className="mt-2 text-xs text-text-dim">
          Toss: {teamName(so.tossWinnerTeamId)}
        </p>
      )}

      {so.status === "completed" && so.wonByTeamId && (
        <p className="mt-3 rounded-md bg-accent-soft px-3 py-2 font-display text-sm font-bold uppercase tracking-wide text-accent">
          {teamName(so.wonByTeamId)} won{so.margin ? ` by ${so.margin}` : ""}
        </p>
      )}

      {so.status === "completed" && (
        <Link
          to={`/matches/${matchId}`}
          className="mt-2 block py-1 text-center text-xs font-semibold text-text-dim active:text-text"
        >
          Back to match
        </Link>
      )}
    </Card>
  );
}
