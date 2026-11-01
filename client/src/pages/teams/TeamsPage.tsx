import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router";
import { Plus, Users } from "lucide-react";

import { teamsApi } from "../../api/teams.api";
import { qk } from "../../lib/queryKeys";
import { TeamCard } from "../../components/domain/team/TeamCard";
import { EmptyState } from "../../components/ui/EmptyState";
import { PageError } from "../../components/ui/PageError";
import { Skeleton } from "../../components/ui/Skeleton";
import { Button } from "../../components/ui/Button";

export function TeamsPage() {
  const { data: teams, isPending, isError, error, refetch } = useQuery({
    queryKey: qk.myTeams,
    queryFn: teamsApi.myTeams,
  });

  return (
    <div>
      <header className="px-4 pt-safe">
        <div className="flex h-16 items-center justify-between">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">Teams</h1>
          <Link
            to="/teams/new"
            aria-label="Create team"
            className="flex size-10 items-center justify-center rounded-full bg-accent text-on-accent active:bg-accent-strong"
          >
            <Plus className="size-5" strokeWidth={2.5} />
          </Link>
        </div>
      </header>

      <div className="space-y-3 px-4">
        {isPending && (
          <>
            <Skeleton className="h-[76px] w-full rounded-lg" />
            <Skeleton className="h-[76px] w-full rounded-lg" />
          </>
        )}

        {isError && <PageError error={error} onRetry={refetch} />}

        {teams && teams.length === 0 && (
          <EmptyState
            icon={Users}
            title="No teams yet"
            hint="Create a team, gather your squad and start challenging other teams."
            action={
              <Link to="/teams/new">
                <Button>Create your first team</Button>
              </Link>
            }
          />
        )}

        {teams?.map((team) => <TeamCard key={team.id} team={team} />)}
      </div>
    </div>
  );
}
