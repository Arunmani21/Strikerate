import { useState } from "react";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Inbox, Trophy } from "lucide-react";

import { matchesApi } from "../../api/matches.api";
import { qk } from "../../lib/queryKeys";
import type { Match } from "../../types/match";
import { MatchCard } from "../../components/domain/match/MatchCard";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageError } from "../../components/ui/PageError";
import { Skeleton } from "../../components/ui/Skeleton";
import { SegmentedTabs } from "../../components/ui/SegmentedTabs";

type Tab = "live" | "upcoming" | "completed";

const TAB_ITEMS: Array<{ value: Tab; label: string }> = [
  { value: "live", label: "Live" },
  { value: "upcoming", label: "Upcoming" },
  { value: "completed", label: "Results" },
];

function MatchList({
  matches,
  pending,
  error,
  retry,
  emptyTitle,
  emptyHint,
  emptyAction,
}: {
  matches: Match[] | undefined;
  pending: boolean;
  error: unknown;
  retry: () => void;
  emptyTitle: string;
  emptyHint: string;
  emptyAction?: ReactNode;
}) {
  if (pending)
    return (
      <div className="space-y-3">
        <Skeleton className="h-[104px] w-full rounded-lg" />
        <Skeleton className="h-[104px] w-full rounded-lg" />
      </div>
    );

  if (error) return <PageError error={error} onRetry={retry} />;

  if (!matches || matches.length === 0)
    return <EmptyState icon={Trophy} title={emptyTitle} hint={emptyHint} action={emptyAction} />;

  return (
    <div className="space-y-3">
      {matches.map((m) => (
        <MatchCard key={m.id} match={m} />
      ))}
    </div>
  );
}

export function MatchesPage() {
  const [tab, setTab] = useState<Tab>("live");

  const liveQ = useQuery({
    queryKey: qk.matchesByStatus("live"),
    queryFn: () => matchesApi.byStatus("live"),
  });
  const scheduledQ = useQuery({
    queryKey: qk.matchesByStatus("scheduled"),
    queryFn: () => matchesApi.byStatus("scheduled"),
  });
  const tossDoneQ = useQuery({
    queryKey: qk.matchesByStatus("toss_done"),
    queryFn: () => matchesApi.byStatus("toss_done"),
  });
  const completedQ = useQuery({
    queryKey: qk.matchesByStatus("completed"),
    queryFn: () => matchesApi.byStatus("completed"),
  });

  const upcoming =
    scheduledQ.data || tossDoneQ.data
      ? [...(scheduledQ.data ?? []), ...(tossDoneQ.data ?? [])].sort((a, b) =>
          `${a.matchDate}${a.matchTime}` < `${b.matchDate}${b.matchTime}` ? -1 : 1,
        )
      : undefined;
  const upcomingPending = scheduledQ.isPending || tossDoneQ.isPending;
  const upcomingError = scheduledQ.error ?? tossDoneQ.error;

  return (
    <div>
      <header className="px-4 pt-safe">
        <div className="flex h-16 items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Matches</h1>
          <Link
            to="/match-requests"
            aria-label="Match requests"
            className="flex size-10 items-center justify-center rounded-full text-text-dim active:bg-elevated"
          >
            <Inbox className="size-5" />
          </Link>
        </div>
      </header>

      <div className="space-y-4 px-4">
        <SegmentedTabs items={TAB_ITEMS} value={tab} onChange={setTab} />

        {tab === "live" && (
          <MatchList
            matches={liveQ.data}
            pending={liveQ.isPending}
            error={liveQ.error}
            retry={liveQ.refetch}
            emptyTitle="No live matches"
            emptyHint="Matches appear here the moment an innings starts."
          />
        )}

        {tab === "upcoming" && (
          <MatchList
            matches={upcoming}
            pending={upcomingPending}
            error={upcomingError}
            retry={() => {
              scheduledQ.refetch();
              tossDoneQ.refetch();
            }}
            emptyTitle="No fixtures yet"
            emptyHint="Post your team's availability, then request a match from the team page."
            emptyAction={
              <Link to="/teams">
                <Button>Go to teams</Button>
              </Link>
            }
          />
        )}

        {tab === "completed" && (
          <MatchList
            matches={completedQ.data}
            pending={completedQ.isPending}
            error={completedQ.error}
            retry={completedQ.refetch}
            emptyTitle="No results yet"
            emptyHint="Finished matches and their results will show up here."
          />
        )}
      </div>
    </div>
  );
}
