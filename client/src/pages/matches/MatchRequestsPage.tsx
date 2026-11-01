import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { CalendarDays, Inbox, Users } from "lucide-react";

import { matchRequestsApi } from "../../api/matchRequests.api";
import { teamsApi } from "../../api/teams.api";
import { errorMessage } from "../../lib/api";
import { formatMatchWhen } from "../../lib/format";
import { qk } from "../../lib/queryKeys";
import { toast } from "../../stores/toast.store";
import type { MatchRequest } from "../../types/match";
import { Screen } from "../../layouts/Screen";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Chip, type ChipTone } from "../../components/ui/Chip";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageError } from "../../components/ui/PageError";
import { Skeleton } from "../../components/ui/Skeleton";

const STATUS_META: Record<string, { label: string; tone: ChipTone }> = {
  pending: { label: "Pending", tone: "warn" },
  confirmed: { label: "Confirmed", tone: "accent" },
  rejected: { label: "Rejected", tone: "wicket" },
  cancelled: { label: "Cancelled", tone: "dim" },
};

export function MatchRequestsPage() {
  const teamsQ = useQuery({ queryKey: qk.myTeams, queryFn: teamsApi.myTeams });
  const teams = teamsQ.data ?? [];
  const [teamId, setTeamId] = useState<string | null>(null);
  const activeTeamId = teamId ?? teams[0]?.id ?? "";

  const requestsQ = useQuery({
    queryKey: qk.matchRequests(activeTeamId),
    queryFn: () => matchRequestsApi.listByTeam(activeTeamId),
    enabled: Boolean(activeTeamId),
  });

  if (teamsQ.isPending)
    return (
      <Screen title="Match requests" backTo="/matches">
        <Skeleton className="h-24 w-full rounded-lg" />
      </Screen>
    );

  if (teams.length === 0)
    return (
      <Screen title="Match requests" backTo="/matches">
        <EmptyState
          icon={Users}
          title="No teams yet"
          hint="Create a team first — match requests are sent and received per team."
          action={
            <Link to="/teams/new">
              <Button>Create a team</Button>
            </Link>
          }
        />
      </Screen>
    );

  return (
    <Screen title="Match requests" backTo="/matches">
      <div className="space-y-4">
        {teams.length > 1 && (
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {teams.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTeamId(t.id)}
                className={
                  t.id === activeTeamId
                    ? "shrink-0 rounded-full bg-accent-soft px-3.5 py-1.5 text-xs font-semibold text-accent"
                    : "shrink-0 rounded-full bg-surface px-3.5 py-1.5 text-xs font-semibold text-text-dim active:bg-elevated"
                }
              >
                {t.name}
              </button>
            ))}
          </div>
        )}

        {requestsQ.isPending && <Skeleton className="h-24 w-full rounded-lg" />}
        {requestsQ.isError && (
          <PageError error={requestsQ.error} onRetry={requestsQ.refetch} />
        )}

        {requestsQ.data && (
          <>
            <RequestSection
              title="Received"
              requests={requestsQ.data.filter((r) => r.opponentTeamId === activeTeamId)}
              myTeamId={activeTeamId}
            />
            <RequestSection
              title="Sent"
              requests={requestsQ.data.filter((r) => r.requestingTeamId === activeTeamId)}
              myTeamId={activeTeamId}
            />
            {requestsQ.data.length === 0 && (
              <EmptyState
                icon={Inbox}
                title="No requests yet"
                hint="Post your team's availability and share your team ID so opponents can challenge you."
              />
            )}
          </>
        )}
      </div>
    </Screen>
  );
}

function RequestSection({
  title,
  requests,
  myTeamId,
}: {
  title: string;
  requests: MatchRequest[];
  myTeamId: string;
}) {
  if (requests.length === 0) return null;
  return (
    <section className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-text-faint">
        {title}
      </h3>
      {requests.map((r) => (
        <RequestRow key={r.id} request={r} myTeamId={myTeamId} />
      ))}
    </section>
  );
}

function RequestRow({ request, myTeamId }: { request: MatchRequest; myTeamId: string }) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  const otherTeam =
    request.requestingTeamId === myTeamId ? request.opponentTeam : request.requestingTeam;
  const otherTeamName = otherTeam?.name ?? "Opponent";

  const respond = useMutation({
    mutationFn: (status: "confirmed" | "rejected") =>
      matchRequestsApi.respond(request.id, status),
    onSuccess: (_, status) => {
      queryClient.invalidateQueries({ queryKey: ["match-requests"] });
      queryClient.invalidateQueries({ queryKey: ["matches"] });
      queryClient.invalidateQueries({ queryKey: qk.myTeams });
      toast.success(
        status === "confirmed" ? "Confirmed — fixture created" : "Request rejected",
      );
    },
    onError: (e) => setError(errorMessage(e)),
  });

  const meta = STATUS_META[request.status] ?? STATUS_META.pending;
  const incoming = request.opponentTeamId === myTeamId;

  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate font-display text-sm font-bold">
            {incoming ? `${otherTeamName} challenged you` : `vs ${otherTeamName}`}
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-text-dim">
            <CalendarDays className="size-3 shrink-0" />
            {formatMatchWhen(request.matchDate, request.matchTime)}
            {request.preferredOvers ? ` · ${request.preferredOvers} ov` : ""}
          </p>
          {request.venue && (
            <p className="mt-0.5 truncate text-xs text-text-faint">{request.venue}</p>
          )}
        </div>
        <Chip tone={meta.tone}>{meta.label}</Chip>
      </div>

      {error && (
        <p className="mt-2 rounded-md border border-wicket/40 bg-wicket-soft px-3 py-2 text-xs text-wicket">
          {error}
        </p>
      )}

      {incoming && request.status === "pending" && (
        <div className="mt-3 flex gap-2">
          <Button
            variant="secondary"
            className="flex-1"
            loading={respond.isPending && respond.variables === "rejected"}
            onClick={() => respond.mutate("rejected")}
          >
            Reject
          </Button>
          <Button
            className="flex-1"
            loading={respond.isPending && respond.variables === "confirmed"}
            onClick={() => respond.mutate("confirmed")}
          >
            Confirm
          </Button>
        </div>
      )}
    </Card>
  );
}

