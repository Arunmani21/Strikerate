import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";

import { matchesApi } from "../../api/matches.api";
import { teamsApi } from "../../api/teams.api";
import { errorMessage } from "../../lib/api";
import { qk } from "../../lib/queryKeys";
import { toast } from "../../stores/toast.store";
import type { TossChoice } from "../../types/enums";
import { Screen } from "../../layouts/Screen";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { PageError } from "../../components/ui/PageError";
import { SegmentedTabs } from "../../components/ui/SegmentedTabs";
import { cn } from "../../lib/cn";

export function TossPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [winnerId, setWinnerId] = useState<string | null>(null);
  const [choice, setChoice] = useState<TossChoice | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchQ = useQuery({ queryKey: qk.match(id), queryFn: () => matchesApi.get(id) });
  const match = matchQ.data;

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

  const record = useMutation({
    mutationFn: () =>
      matchesApi.recordToss(id, {
        tossWinnerId: winnerId!,
        tossChoice: choice!,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.match(id) });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      toast.success("Toss recorded");
      navigate(`/matches/${id}`, { replace: true });
    },
    onError: (e) => {
      setError(errorMessage(e));
      setConfirming(false);
    },
  });

  if (matchQ.isPending) return <FullScreenSpinner />;
  if (matchQ.isError || !match)
    return (
      <Screen title="Toss" backTo="/matches">
        <PageError error={matchQ.error} onRetry={matchQ.refetch} />
      </Screen>
    );

  if (match.status !== "scheduled") {
    return (
      <Screen title="Toss" backTo={`/matches/${id}`}>
        <EmptyState
          title={match.tossWinnerId ? "Toss already recorded" : "Toss unavailable"}
          hint={
            match.tossWinnerId
              ? "The toss for this match has been recorded."
              : "The toss can only be recorded while the match is scheduled."
          }
          action={
            <Link to={`/matches/${id}`}>
              <Button>Back to match</Button>
            </Link>
          }
        />
      </Screen>
    );
  }

  const isCaptainOfA = roleAQ.data?.role === "captain";
  const isCaptainOfB = roleBQ.data?.role === "captain";

  const teamName = (teamId: string) =>
    teamId === match.teamAId
      ? (match.teamA?.name ?? "Team A")
      : (match.teamB?.name ?? "Team B");

  const teams = [
    { id: match.teamAId, name: teamName(match.teamAId), isMine: isCaptainOfA },
    { id: match.teamBId, name: teamName(match.teamBId), isMine: isCaptainOfB },
  ];

  if (!isCaptainOfA && !isCaptainOfB) {
    return (
      <Screen title="Toss" backTo={`/matches/${id}`}>
        <EmptyState
          title="Captains only"
          hint="Only a team captain can record the toss — and only for their own team."
        />
      </Screen>
    );
  }

  const canSubmit =
    Boolean(winnerId && choice) &&
    teams.every((t) => t.id !== winnerId || t.isMine);

  return (
    <Screen title="Toss" backTo={`/matches/${id}`}>
      <div className="space-y-4">
        {error && (
          <div className="rounded-md border border-wicket/40 bg-wicket-soft px-3 py-2.5 text-sm text-wicket">
            {error}
          </div>
        )}

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-faint">
            Who won the toss?
          </p>
          <div className="space-y-2">
            {teams.map((t) => (
              <button
                key={t.id}
                type="button"
                disabled={!t.isMine}
                onClick={() => setWinnerId(t.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg border px-4 py-3.5 text-left",
                  winnerId === t.id
                    ? "border-accent bg-accent-soft"
                    : "border-line bg-surface active:bg-elevated",
                  !t.isMine && "opacity-40",
                )}
              >
                <span className="font-display text-base font-bold">{t.name}</span>
                {winnerId === t.id && (
                  <span className="text-xs font-semibold uppercase text-accent">Won toss</span>
                )}
              </button>
            ))}
          </div>
          {teams.some((t) => !t.isMine) && (
            <p className="mt-2 text-xs leading-relaxed text-text-faint">
              A dimmed team can still win the toss — their own captain records it.
            </p>
          )}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-faint">
            Elected to
          </p>
          <SegmentedTabs
            items={[
              { value: "bat", label: "Bat first" },
              { value: "bowl", label: "Bowl first" },
            ]}
            value={choice ?? "bat"}
            onChange={(v) => setChoice(v as TossChoice)}
          />
        </div>

        <Card>
          <p className="text-xs leading-relaxed text-text-dim">
            The toss can only be recorded once — it can't be corrected afterwards, so
            double-check with both captains.
          </p>
        </Card>

        <Button
          size="lg"
          fullWidth
          disabled={!canSubmit}
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
        >
          Record toss
        </Button>
      </div>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={() => record.mutate()}
        title="Record the toss?"
        message={
          winnerId && choice
            ? `${teamName(winnerId)} won the toss and elected to ${choice === "bat" ? "bat first" : "bowl first"}.`
            : undefined
        }
        confirmLabel="Record"
        loading={record.isPending}
      />
    </Screen>
  );
}
