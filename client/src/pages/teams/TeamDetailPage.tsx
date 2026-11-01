import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { Copy, Crown, History, MapPin, Plus, Settings2, Trash2, UserPlus } from "lucide-react";

import { guestPlayersApi } from "../../api/guestPlayers.api";
import { playersApi } from "../../api/players.api";
import { teamsApi } from "../../api/teams.api";
import { errorMessage } from "../../lib/api";
import { qk } from "../../lib/queryKeys";
import { toast } from "../../stores/toast.store";
import type { GuestPlayer, Player, TeamMember } from "../../types/team";
import type { TeamRole } from "../../types/enums";
import { AppBar } from "../../components/ui/AppBar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { EmptyState } from "../../components/ui/EmptyState";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { PageError } from "../../components/ui/PageError";
import { SegmentedTabs } from "../../components/ui/SegmentedTabs";
import { Select } from "../../components/ui/Select";
import { Sheet } from "../../components/ui/Sheet";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { StatTile } from "../../components/ui/StatTile";
import { PlayerRow } from "../../components/domain/team/PlayerRow";
import { RoleBadge } from "../../components/domain/team/RoleBadge";

const ROLE_RANK: Record<TeamRole, number> = {
  captain: 0,
  vice_captain: 1,
  scorer: 2,
  player: 3,
};

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function confirmMeta(state: NonNullable<ConfirmState>) {
  switch (state.kind) {
    case "removeMember":
      return {
        title: "Remove member?",
        message: `${state.member.user?.name ?? "This member"} will lose access to this team.`,
        confirm: "Remove",
      };
    case "makeCaptain":
      return {
        title: "Transfer captaincy?",
        message: `${state.member.user?.name ?? "This member"} becomes captain and you become a regular member.`,
        confirm: "Transfer",
      };
    case "removePlayer":
      return {
        title: "Remove player?",
        message: `${state.player.name} will be removed from the squad. This can't be undone.`,
        confirm: "Remove",
      };
    case "removeGuest":
      return {
        title: "Remove guest?",
        message: `${state.guest.name} will be deactivated. This can't be undone.`,
        confirm: "Remove",
      };
  }
}

type ConfirmState =
  | { kind: "removeMember"; member: TeamMember }
  | { kind: "removePlayer"; player: Player }
  | { kind: "removeGuest"; guest: GuestPlayer }
  | { kind: "makeCaptain"; member: TeamMember }
  | null;

export function TeamDetailPage() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();

  const [tab, setTab] = useState<"members" | "players">("members");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [addPlayerOpen, setAddPlayerOpen] = useState(false);
  const [addGuestOpen, setAddGuestOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmState>(null);

  const teamQuery = useQuery({ queryKey: qk.team(id), queryFn: () => teamsApi.get(id) });
  const membersQuery = useQuery({
    queryKey: qk.teamMembers(id),
    queryFn: () => teamsApi.members(id),
  });
  const playersQuery = useQuery({
    queryKey: qk.teamPlayers(id),
    queryFn: () => playersApi.list(id),
  });
  const guestsQuery = useQuery({
    queryKey: qk.teamGuests(id),
    queryFn: () => guestPlayersApi.listByTeam(id),
  });
  const myRoleQuery = useQuery({
    queryKey: qk.teamMyRole(id),
    queryFn: () => teamsApi.myRole(id),
  });
  const statsQuery = useQuery({
    queryKey: qk.teamStats(id),
    queryFn: () => teamsApi.stats(id),
  });

  const team = teamQuery.data;
  const myRole = myRoleQuery.data;
  const isCaptain = myRole?.role === "captain";
  const canManageMembers = isCaptain || myRole?.role === "vice_captain";

  if (teamQuery.isPending || myRoleQuery.isPending) return <FullScreenSpinner />;
  if (teamQuery.isError || !team)
    return (
      <div className="mx-auto max-w-[480px]">
        <AppBar title="Team" backTo="/teams" />
        <PageError error={teamQuery.error} onRetry={teamQuery.refetch} />
      </div>
    );

  const invalidateMembers = () => {
    queryClient.invalidateQueries({ queryKey: qk.teamMembers(id) });
    queryClient.invalidateQueries({ queryKey: qk.teamMyRole(id) });
    queryClient.invalidateQueries({ queryKey: qk.team(id) });
  };

  const members = [...(membersQuery.data ?? [])].sort(
    (a, b) => ROLE_RANK[a.role] - ROLE_RANK[b.role] || a.joinedAt.localeCompare(b.joinedAt),
  );

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <AppBar
        title={team.name}
        backTo="/teams"
        right={
          isCaptain ? (
            <Link
              to={`/teams/${id}/edit`}
              aria-label="Team settings"
              className="flex size-11 items-center justify-center rounded-full text-text-dim active:bg-elevated"
            >
              <Settings2 className="size-5" />
            </Link>
          ) : undefined
        }
      />

      <main className="flex-1 space-y-4 px-4 py-4 pb-12">
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-accent-soft font-display text-lg font-bold text-accent">
              {team.name.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate font-display text-xl font-bold">{team.name}</h2>
              {team.homeGround && (
                <p className="mt-0.5 flex items-center gap-1 text-xs text-text-dim">
                  <MapPin className="size-3 shrink-0" />
                  <span className="truncate">{team.homeGround}</span>
                </p>
              )}
            </div>
            {myRole?.isMember && myRole.role && <RoleBadge role={myRole.role} />}
          </div>

          {statsQuery.data && (
            <div className="mt-3 grid grid-cols-4 gap-2">
              <StatTile label="P" value={statsQuery.data.totalMatches} />
              <StatTile label="W" value={statsQuery.data.wonMatches} tone="accent" />
              <StatTile label="L" value={statsQuery.data.lostMatches} tone="wicket" />
              <StatTile
                label="Win %"
                value={Math.round(statsQuery.data.winPercentage)}
              />
            </div>
          )}

          <button
            onClick={() => {
              navigator.clipboard
                .writeText(team.id)
                .then(() => toast.success("Team ID copied"))
                .catch(() => toast.error("Couldn't copy ID"));
            }}
            className="mt-3 flex items-center gap-1.5 text-xs text-text-faint active:text-text-dim"
          >
            <Copy className="size-3" />
            Copy team ID
          </button>

          {(canManageMembers || isCaptain) && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {canManageMembers && (
                <Link to={`/teams/${id}/availability`}>
                  <Button variant="secondary" size="sm" fullWidth>
                    Availability
                  </Button>
                </Link>
              )}
              {isCaptain && (
                <Link to={`/teams/${id}/request`}>
                  <Button variant="secondary" size="sm" fullWidth>
                    Request match
                  </Button>
                </Link>
              )}
            </div>
          )}

          <Link
            to={`/teams/${id}/history`}
            className="mt-3 flex items-center justify-between rounded-md bg-elevated px-3 py-2.5 active:bg-line"
          >
            <span className="text-sm font-semibold">Team history</span>
            <History className="size-4 text-text-dim" />
          </Link>
        </Card>

        <SegmentedTabs
          items={[
            { value: "members", label: `Members${members.length ? ` ${members.length}` : ""}` },
            { value: "players", label: `Players${playersQuery.data?.length ? ` ${playersQuery.data.length}` : ""}` },
          ]}
          value={tab}
          onChange={setTab}
        />

        {tab === "members" && (
          <section className="space-y-2">
            {canManageMembers && (
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setAddMemberOpen(true)}
              >
                <UserPlus className="size-4" />
                Add member
              </Button>
            )}

            {membersQuery.isPending && (
              <Card className="p-0">
                <div className="h-16 animate-pulse bg-elevated" />
              </Card>
            )}
            {membersQuery.isError && (
              <PageError error={membersQuery.error} onRetry={membersQuery.refetch} />
            )}

            {members.length > 0 && (
              <Card className="divide-y divide-line-soft p-0">
                {members.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => isCaptain && setSelectedMember(m)}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-elevated"
                  >
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-elevated font-display text-sm font-bold text-text-dim">
                      {(m.user?.name ?? "?").slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold">
                        {m.user?.name ?? m.userId.slice(0, 8)}
                      </p>
                      {m.user?.email && (
                        <p className="truncate text-xs text-text-dim">{m.user.email}</p>
                      )}
                    </div>
                    {m.jerseyNumber != null && (
                      <span className="text-xs text-text-faint tnum">#{m.jerseyNumber}</span>
                    )}
                    <RoleBadge role={m.role} />
                  </button>
                ))}
              </Card>
            )}

            {membersQuery.data && members.length === 0 && (
              <EmptyState title="No members" hint="Add registered users by their user ID." />
            )}
          </section>
        )}

        {tab === "players" && (
          <section className="space-y-2">
            {isCaptain && (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="secondary" onClick={() => setAddPlayerOpen(true)}>
                  <Plus className="size-4" />
                  Add player
                </Button>
                <Button variant="secondary" onClick={() => setAddGuestOpen(true)}>
                  <Plus className="size-4" />
                  Add guest
                </Button>
              </div>
            )}

            {playersQuery.isError && (
              <PageError error={playersQuery.error} onRetry={playersQuery.refetch} />
            )}

            {(playersQuery.data?.length ?? 0) > 0 && (
              <Card className="divide-y divide-line-soft p-0">
                {playersQuery.data!.map((p) => (
                  <PlayerRow
                    key={p.id}
                    player={p}
                    to={`/players/${p.id}`}
                    right={
                      isCaptain ? (
                        <button
                          aria-label={`Remove ${p.name}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setConfirmState({ kind: "removePlayer", player: p });
                          }}
                          className="flex size-9 items-center justify-center rounded-full text-text-faint active:bg-elevated active:text-wicket"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : undefined
                    }
                  />
                ))}
              </Card>
            )}

            {playersQuery.data?.length === 0 && (
              <EmptyState
                title="No players"
                hint="Add players to build your squad — you'll need at least 11 for a match."
              />
            )}

            {(guestsQuery.data?.length ?? 0) > 0 && (
              <>
                <h3 className="pt-2 text-xs font-semibold uppercase tracking-wider text-text-faint">
                  Guest players
                </h3>
                <Card className="divide-y divide-line-soft p-0">
                  {guestsQuery.data!.map((g) => (
                    <div key={g.id} className="flex items-center gap-3 px-4 py-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-gold-soft font-display text-sm font-bold text-gold">
                        {g.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold">{g.name}</p>
                        <p className="text-xs capitalize text-text-dim">{g.role ?? "Guest"}</p>
                      </div>
                      {isCaptain && (
                        <button
                          aria-label={`Remove ${g.name}`}
                          onClick={() => setConfirmState({ kind: "removeGuest", guest: g })}
                          className="flex size-9 items-center justify-center rounded-full text-text-faint active:bg-elevated active:text-wicket"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </Card>
              </>
            )}
          </section>
        )}
      </main>

      {/* Add member (captain / vice) */}
      <AddMemberSheet
        open={addMemberOpen}
        onClose={() => setAddMemberOpen(false)}
        teamId={id}
        onDone={() => {
          setAddMemberOpen(false);
          invalidateMembers();
        }}
      />

      {/* Member actions (captain) */}
      {selectedMember && (
        <MemberActionsSheet
          key={selectedMember.id}
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
          onAskConfirm={(state) => {
            setSelectedMember(null);
            setConfirmState(state);
          }}
        />
      )}

      {/* Add player (captain) */}
      <AddPlayerSheet
        open={addPlayerOpen}
        onClose={() => setAddPlayerOpen(false)}
        teamId={id}
        onDone={() => {
          setAddPlayerOpen(false);
          queryClient.invalidateQueries({ queryKey: qk.teamPlayers(id) });
        }}
      />

      {/* Add guest (captain) */}
      <AddGuestSheet
        open={addGuestOpen}
        onClose={() => setAddGuestOpen(false)}
        teamId={id}
        onDone={() => {
          setAddGuestOpen(false);
          queryClient.invalidateQueries({ queryKey: qk.teamGuests(id) });
        }}
      />

      {/* Confirmations */}
      <ConfirmStateDialog
        state={confirmState}
        teamId={id}
        onClose={() => setConfirmState(null)}
        onDone={() => {
          setConfirmState(null);
          invalidateMembers();
          queryClient.invalidateQueries({ queryKey: qk.teamPlayers(id) });
          queryClient.invalidateQueries({ queryKey: qk.teamGuests(id) });
        }}
      />
    </div>
  );
}

function AddMemberSheet({
  open,
  onClose,
  teamId,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  teamId: string;
  onDone: () => void;
}) {
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState<TeamRole>("player");
  const [jersey, setJersey] = useState("");
  const [error, setError] = useState<string | null>(null);

  const add = useMutation({
    mutationFn: () =>
      teamsApi.addMember(teamId, {
        userId: userId.trim(),
        role,
        jerseyNumber: jersey ? Number(jersey) : undefined,
      }),
    onSuccess: onDone,
    onError: (e) => setError(errorMessage(e)),
  });

  const submit = () => {
    if (!UUID_RE.test(userId.trim())) {
      setError("Enter a valid user ID (UUID)");
      return;
    }
    setError(null);
    add.mutate();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Add member">
      <div className="space-y-4">
        {error && (
          <div className="rounded-md border border-wicket/40 bg-wicket-soft px-3 py-2.5 text-sm text-wicket">
            {error}
          </div>
        )}
        <Field
          label="User ID"
          hint="Ask your teammate to copy it from their Profile tab"
        >
          <Input
            placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value as TeamRole)}>
              <option value="player">Player</option>
              <option value="scorer">Scorer</option>
              <option value="vice_captain">Vice-captain</option>
            </Select>
          </Field>
          <Field label="Jersey no.">
            <Input
              type="number"
              inputMode="numeric"
              placeholder="Optional"
              value={jersey}
              onChange={(e) => setJersey(e.target.value)}
            />
          </Field>
        </div>
        <Button fullWidth size="lg" loading={add.isPending} onClick={submit}>
          Add member
        </Button>
      </div>
    </Sheet>
  );
}

function MemberActionsSheet({
  member,
  onClose,
  onAskConfirm,
}: {
  member: TeamMember;
  onClose: () => void;
  onAskConfirm: (state: ConfirmState) => void;
}) {
  const queryClient = useQueryClient();
  const { id = "" } = useParams();
  const [role, setRole] = useState<TeamRole>(
    member.role === "captain" ? "player" : member.role,
  );
  const [error, setError] = useState<string | null>(null);

  const isCaptainMember = member.role === "captain";

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: qk.teamMembers(id) });
    queryClient.invalidateQueries({ queryKey: qk.team(id) });
    queryClient.invalidateQueries({ queryKey: qk.teamMyRole(id) });
  };

  const saveRole = useMutation({
    mutationFn: () => teamsApi.updateMemberRole(id, member.userId, role),
    onSuccess: () => {
      invalidate();
      toast.success("Role updated");
      onClose();
    },
    onError: (e) => setError(errorMessage(e)),
  });

  const name = member.user?.name ?? member.userId.slice(0, 8);

  return (
    <Sheet open onClose={onClose} title={name}>
      <div className="space-y-4">
        {error && (
          <div className="rounded-md border border-wicket/40 bg-wicket-soft px-3 py-2.5 text-sm text-wicket">
            {error}
          </div>
        )}

        {isCaptainMember ? (
          <div className="flex items-center gap-2 rounded-md bg-accent-soft px-3 py-2.5 text-sm text-accent">
            <Crown className="size-4 shrink-0" />
            This member is the team captain.
          </div>
        ) : (
          <Field label="Team role">
            <Select value={role} onChange={(e) => setRole(e.target.value as TeamRole)}>
              <option value="player">Player</option>
              <option value="scorer">Scorer</option>
              <option value="vice_captain">Vice-captain</option>
            </Select>
          </Field>
        )}

        {!isCaptainMember && (
          <Button
            variant="secondary"
            fullWidth
            loading={saveRole.isPending}
            onClick={() => saveRole.mutate()}
          >
            Save role
          </Button>
        )}

        {!isCaptainMember && (
          <Button
            variant="secondary"
            fullWidth
            onClick={() => onAskConfirm({ kind: "makeCaptain", member })}
          >
            <Crown className="size-4" />
            Make captain
          </Button>
        )}

        {!isCaptainMember && (
          <Button
            variant="danger"
            fullWidth
            onClick={() => onAskConfirm({ kind: "removeMember", member })}
          >
            <Trash2 className="size-4" />
            Remove from team
          </Button>
        )}
      </div>
    </Sheet>
  );
}

function AddPlayerSheet({
  open,
  onClose,
  teamId,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  teamId: string;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [jersey, setJersey] = useState("");
  const [error, setError] = useState<string | null>(null);

  const add = useMutation({
    mutationFn: () =>
      playersApi.create(teamId, {
        name: name.trim(),
        jerseyNumber: jersey ? Number(jersey) : undefined,
      }),
    onSuccess: onDone,
    onError: (e) => setError(errorMessage(e)),
  });

  const submit = () => {
    if (name.trim().length < 2) {
      setError("Player name must be at least 2 characters");
      return;
    }
    setError(null);
    add.mutate();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Add player">
      <div className="space-y-4">
        {error && (
          <div className="rounded-md border border-wicket/40 bg-wicket-soft px-3 py-2.5 text-sm text-wicket">
            {error}
          </div>
        )}
        <Field label="Player name" hint="Name must be unique within the team">
          <Input
            placeholder="e.g. Rahul S"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </Field>
        <Field label="Jersey number">
          <Input
            type="number"
            inputMode="numeric"
            placeholder="Optional"
            value={jersey}
            onChange={(e) => setJersey(e.target.value)}
          />
        </Field>
        <Button fullWidth size="lg" loading={add.isPending} onClick={submit}>
          Add player
        </Button>
      </div>
    </Sheet>
  );
}

function AddGuestSheet({
  open,
  onClose,
  teamId,
  onDone,
}: {
  open: boolean;
  onClose: () => void;
  teamId: string;
  onDone: () => void;
}) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState<string | null>(null);

  const add = useMutation({
    mutationFn: () =>
      guestPlayersApi.create(teamId, {
        name: name.trim(),
        mobile: mobile.trim() || undefined,
        role: (role || undefined) as "batsman" | "bowler" | "allrounder" | "wicketkeeper" | undefined,
      }),
    onSuccess: onDone,
    onError: (e) => setError(errorMessage(e)),
  });

  const submit = () => {
    if (name.trim().length < 2) {
      setError("Guest name must be at least 2 characters");
      return;
    }
    setError(null);
    add.mutate();
  };

  return (
    <Sheet open={open} onClose={onClose} title="Add guest player">
      <div className="space-y-4">
        {error && (
          <div className="rounded-md border border-wicket/40 bg-wicket-soft px-3 py-2.5 text-sm text-wicket">
            {error}
          </div>
        )}
        <Field label="Guest name">
          <Input
            placeholder="e.g. Visitor Player"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mobile">
            <Input
              type="tel"
              inputMode="tel"
              placeholder="Optional"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
            />
          </Field>
          <Field label="Role">
            <Select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="">Not set</option>
              <option value="batsman">Batsman</option>
              <option value="bowler">Bowler</option>
              <option value="allrounder">All-rounder</option>
              <option value="wicketkeeper">Wicket-keeper</option>
            </Select>
          </Field>
        </div>
        <p className="text-xs leading-relaxed text-text-faint">
          Guests can be included in a playing XI and converted to full accounts later.
        </p>
        <Button fullWidth size="lg" loading={add.isPending} onClick={submit}>
          Add guest
        </Button>
      </div>
    </Sheet>
  );
}

function ConfirmStateDialog({
  state,
  teamId,
  onClose,
  onDone,
}: {
  state: ConfirmState;
  teamId: string;
  onClose: () => void;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);

  const run = async () => {
    if (!state) return;
    setBusy(true);
    try {
      if (state.kind === "removeMember") {
        await teamsApi.removeMember(teamId, state.member.userId);
        toast.success("Member removed");
      } else if (state.kind === "makeCaptain") {
        await teamsApi.transferCaptaincy(teamId, state.member.userId);
        toast.success("Captaincy transferred");
      } else if (state.kind === "removePlayer") {
        await playersApi.remove(teamId, state.player.id);
        toast.success("Player removed");
      } else if (state.kind === "removeGuest") {
        await guestPlayersApi.remove(state.guest.id);
        toast.success("Guest removed");
      }
      onDone();
    } catch (e) {
      toast.error(errorMessage(e));
      onClose();
    } finally {
      setBusy(false);
    }
  };

  const meta = state ? confirmMeta(state) : undefined;

  return (
    <ConfirmDialog
      open={Boolean(state)}
      onClose={onClose}
      onConfirm={run}
      title={meta?.title ?? ""}
      message={meta?.message}
      confirmLabel={meta?.confirm}
      danger
      loading={busy}
    />
  );
}
