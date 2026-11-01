import { Link, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Radar } from "lucide-react";
import { matchesApi } from "../../api/matches.api";
import { useAuthStore } from "../../stores/auth.store";
import { Wordmark } from "../../components/ui/Wordmark";
import { EmptyState } from "../../components/ui/EmptyState";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { MatchCard } from "../../components/domain/match/MatchCard";
import { initials } from "../../lib/format";
import { qk } from "../../lib/queryKeys";

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

export function HomePage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  const liveQ = useQuery({
    queryKey: qk.matchesByStatus("live"),
    queryFn: () => matchesApi.byStatus("live"),
    refetchInterval: 15_000,
  });
  const liveMatches = liveQ.data ?? [];

  return (
    <div>
      <header className="px-4 pt-safe">
        <div className="flex h-16 items-center justify-between">
          <Wordmark />
          <Link
            to="/profile"
            aria-label="Profile"
            className="flex size-10 items-center justify-center rounded-full bg-accent-soft font-display text-sm font-bold text-accent"
          >
            {initials(user?.name ?? "?")}
          </Link>
        </div>
      </header>

      <div className="space-y-4 px-4 pt-2">
        <div>
          <p className="text-sm text-text-dim">{greeting()},</p>
          <h1 className="font-display text-3xl font-bold tracking-wide">
            {user?.name ?? "Player"}
          </h1>
        </div>

        {user && !user.profile && (
          <Card className="border-accent/30 bg-accent-soft/50">
            <p className="font-display text-base font-bold uppercase tracking-wide">
              Set up your cricket profile
            </p>
            <p className="mt-1 text-sm leading-relaxed text-text-dim">
              Add your playing role and styles so teams know what you bring.
            </p>
            <Button size="sm" className="mt-3" onClick={() => navigate("/profile/edit")}>
              Add profile
            </Button>
          </Card>
        )}

        <section>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-text-faint">
            Live now
          </h2>
          {liveQ.isPending ? (
            <Card>
              <p className="text-sm text-text-dim">Checking for live matches…</p>
            </Card>
          ) : liveMatches.length === 0 ? (
            <Card className="p-0">
              <EmptyState
                icon={Radar}
                title="No live matches"
                hint="Matches you're playing, following or scoring will appear here in real time."
              />
            </Card>
          ) : (
            <div className="space-y-2">
              {liveMatches.map((m) => (
                <Link key={m.id} to={`/matches/${m.id}`} className="block">
                  <MatchCard match={m} />
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
