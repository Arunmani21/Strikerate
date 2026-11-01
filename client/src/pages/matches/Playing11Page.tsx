import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { Check } from "lucide-react";

import { guestPlayersApi } from "../../api/guestPlayers.api";
import { matchesApi } from "../../api/matches.api";
import { playing11Api } from "../../api/playing11.api";
import { playersApi } from "../../api/players.api";
import { teamsApi } from "../../api/teams.api";
import { errorMessage } from "../../lib/api";
import { qk } from "../../lib/queryKeys";
import { toast } from "../../stores/toast.store";
import { Screen } from "../../layouts/Screen";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Chip } from "../../components/ui/Chip";
import { EmptyState } from "../../components/ui/EmptyState";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { PageError } from "../../components/ui/PageError";
import { cn } from "../../lib/cn";

export function Playing11Page() {
  const { id: matchId = "", teamId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [hydrated, setHydrated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const matchQ = useQuery({
    queryKey: qk.match(matchId),
    queryFn: () => matchesApi.get(matchId),
  });
  const playersQ = useQuery({
    queryKey: qk.teamPlayers(teamId),
    queryFn: () => playersApi.list(teamId),
  });
  const guestsQ = useQuery({
    queryKey: qk.teamGuests(teamId),
    queryFn: () => guestPlayersApi.listByTeam(teamId),
  });
  const xiQ = useQuery({
    queryKey: qk.playing11(matchId, teamId),
    queryFn: () => playing11Api.get(matchId, teamId),
  });
  const roleQ = useQuery({
    queryKey: qk.teamMyRole(teamId),
    queryFn: () => teamsApi.myRole(teamId),
  });

  useEffect(() => {
    if (!hydrated && xiQ.data) {
      setSelected(new Set(xiQ.data.map((e) => e.id)));
      setHydrated(true);
    }
  }, [xiQ.data, hydrated]);

  const canManage = roleQ.data?.role === "captain" || roleQ.data?.role === "vice_captain";

  const activeGuests = useMemo(
    () => (guestsQ.data ?? []).filter((g) => g.status === "active"),
    [guestsQ.data],
  );

  const regulars = (playersQ.data ?? []).filter((p) => selected.has(p.id));
  const guests = activeGuests.filter((g) => selected.has(g.id));
  const total = regulars.length + guests.length;

  const toggle = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const save = useMutation({
    mutationFn: () =>
      playing11Api.set(matchId, teamId, {
        playerIds: regulars.map((p) => p.id),
        guestPlayerIds: guests.map((g) => g.id),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.playing11(matchId, teamId) });
      queryClient.invalidateQueries({ queryKey: qk.match(matchId) });
      toast.success("Playing XI saved");
      navigate(`/matches/${matchId}`);
    },
    onError: (e) => setError(errorMessage(e)),
  });

  if (matchQ.isPending || playersQ.isPending || roleQ.isPending)
    return <FullScreenSpinner />;
  if (matchQ.isError || !matchQ.data)
    return (
      <Screen title="Playing XI" backTo={`/matches/${matchId}`}>
        <PageError error={matchQ.error} onRetry={matchQ.refetch} />
      </Screen>
    );

  const teamName =
    matchQ.data.teamAId === teamId
      ? (matchQ.data.teamA?.name ?? "Team A")
      : (matchQ.data.teamB?.name ?? "Team B");

  // Spectator view
  if (!canManage) {
    return (
      <Screen title={`XI · ${teamName}`} backTo={`/matches/${matchId}`}>
        {(xiQ.data?.length ?? 0) === 0 ? (
          <EmptyState
            title="No XI yet"
            hint="The team captain hasn't picked their playing XI for this match."
          />
        ) : (
          <Card className="divide-y divide-line-soft p-0">
            {xiQ.data!.map((e) => (
              <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-elevated font-display text-xs font-bold text-text-dim tnum">
                  {e.isGuest ? "G" : (e.jerseyNumber ?? "–")}
                </div>
                <p className="min-w-0 flex-1 truncate text-sm font-semibold">{e.name}</p>
                {e.isGuest && <Chip>Guest</Chip>}
              </div>
            ))}
          </Card>
        )}
      </Screen>
    );
  }

  return (
    <Screen title={`XI · ${teamName}`} backTo={`/matches/${matchId}`}>
      <div className="space-y-4">
        {error && (
          <div className="rounded-md border border-wicket/40 bg-wicket-soft px-3 py-2.5 text-sm text-wicket">
            {error}
          </div>
        )}

        <Card>
          <div className="flex items-center justify-between">
            <div>
              <p
                className={cn(
                  "font-display text-2xl font-bold tnum",
                  total === 11 ? "text-accent" : total > 11 ? "text-wicket" : "text-text",
                )}
              >
                {total}/11
              </p>
              <p className="text-xs text-text-dim tnum">
                {regulars.length} regular · {guests.length} guest
              </p>
            </div>
            {total === 11 && <Chip tone="accent">Ready</Chip>}
            {total > 11 && <Chip tone="wicket">Over limit</Chip>}
          </div>
        </Card>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-faint">
            Players
          </h3>
          {playersQ.isError && (
            <PageError error={playersQ.error} onRetry={playersQ.refetch} />
          )}
          {(playersQ.data?.length ?? 0) === 0 && !playersQ.isPending && (
            <Card>
              <p className="py-2 text-sm text-text-dim">
                No players in this squad yet — add players from the team page first.
              </p>
            </Card>
          )}
          {playersQ.data && playersQ.data.length > 0 && (
            <Card className="divide-y divide-line-soft p-0">
              {playersQ.data.map((p) => (
                <PickRow
                  key={p.id}
                  badge={String(p.jerseyNumber ?? "–")}
                  title={p.name}
                  selected={selected.has(p.id)}
                  onToggle={() => toggle(p.id)}
                />
              ))}
            </Card>
          )}
        </section>

        {activeGuests.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-faint">
              Guests
            </h3>
            <Card className="divide-y divide-line-soft p-0">
              {activeGuests.map((g) => (
                <PickRow
                  key={g.id}
                  badge="G"
                  title={g.name}
                  subtitle={g.role ?? undefined}
                  selected={selected.has(g.id)}
                  onToggle={() => toggle(g.id)}
                />
              ))}
            </Card>
          </section>
        )}

        <div className="sticky bottom-0 pb-safe">
          <Button
            size="lg"
            fullWidth
            disabled={total !== 11}
            loading={save.isPending}
            onClick={() => {
              setError(null);
              save.mutate();
            }}
          >
            {total === 11 ? "Save playing XI" : `Select ${11 - total} more`}
          </Button>
        </div>
      </div>
    </Screen>
  );
}

function PickRow({
  badge,
  title,
  subtitle,
  selected,
  onToggle,
}: {
  badge: string;
  title: string;
  subtitle?: string;
  selected: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left",
        selected && "bg-accent-soft",
      )}
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-elevated font-display text-xs font-bold text-text-dim tnum">
        {badge}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{title}</p>
        {subtitle && <p className="truncate text-xs capitalize text-text-dim">{subtitle}</p>}
      </div>
      <span
        className={cn(
          "flex size-6 shrink-0 items-center justify-center rounded-full border",
          selected ? "border-accent bg-accent text-on-accent" : "border-dot",
        )}
      >
        {selected && <Check className="size-4" strokeWidth={3} />}
      </span>
    </button>
  );
}

