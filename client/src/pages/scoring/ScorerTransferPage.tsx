import { useState } from "react";
import { useParams } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { matchesApi } from "../../api/matches.api";
import { scoringApi } from "../../api/scoring.api";
import { teamsApi } from "../../api/teams.api";
import { errorMessage } from "../../lib/api";
import { qk } from "../../lib/queryKeys";
import { toast } from "../../stores/toast.store";
import type { ScorerRole } from "../../types/enums";
import type { ScorerPermission } from "../../types/scoring";
import { AppBar } from "../../components/ui/AppBar";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Chip, type ChipTone } from "../../components/ui/Chip";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { PageError } from "../../components/ui/PageError";
import { PlayerPickerSheet } from "../../components/domain/scoring/PlayerPickerSheet";

const ROLE_LABEL: Record<ScorerRole, string> = {
  primary_scorer: "Primary",
  secondary_scorer: "Secondary",
  temporary_scorer: "Temporary",
  viewer: "Viewer",
};

const STATUS_TONE: Record<string, ChipTone> = {
  pending: "warn",
  accepted: "accent",
  completed: "accent",
  rejected: "wicket",
  revoked: "dim",
};

export function ScorerTransferPage() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();

  const matchQ = useQuery({
    queryKey: qk.match(id),
    queryFn: () => matchesApi.get(id),
    enabled: Boolean(id),
  });
  const scorersQ = useQuery({
    queryKey: qk.scorers(id),
    queryFn: () => scoringApi.scorers(id),
    enabled: Boolean(id),
  });
  const historyQ = useQuery({
    queryKey: qk.transferHistory(id),
    queryFn: () => scoringApi.transferHistory(id),
    enabled: Boolean(id),
  });
  const membersAQ = useQuery({
    queryKey: qk.teamMembers(matchQ.data?.teamAId ?? ""),
    queryFn: () => teamsApi.members(matchQ.data!.teamAId),
    enabled: Boolean(matchQ.data),
  });
  const membersBQ = useQuery({
    queryKey: qk.teamMembers(matchQ.data?.teamBId ?? ""),
    queryFn: () => teamsApi.members(matchQ.data!.teamBId),
    enabled: Boolean(matchQ.data),
  });

  const [pickerOpen, setPickerOpen] = useState(false);
  const [revoking, setRevoking] = useState<ScorerPermission | null>(null);
  const [busy, setBusy] = useState(false);

  const match = matchQ.data;

  function refresh() {
    void queryClient.invalidateQueries({ queryKey: qk.scorers(id) });
    void queryClient.invalidateQueries({ queryKey: qk.transferHistory(id) });
    void queryClient.invalidateQueries({ queryKey: qk.canScore(id) });
  }

  const memberOptions = [...(membersAQ.data ?? []), ...(membersBQ.data ?? [])]
    .filter((m) => m.isActive)
    .map((m) => ({
      id: m.userId,
      name: m.user?.name ?? "Unknown member",
      note: m.role.replaceAll("_", " "),
    }));

  async function handleTransfer(p: { id: string; name: string }) {
    setPickerOpen(false);
    setBusy(true);
    try {
      const res = await scoringApi.transferScorer(id, {
        transferToUserId: p.id,
        role: "primary_scorer",
      });
      toast.success(res.message || `Transfer requested — ${p.name} accepts from Score Center`);
      refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  async function handleRevoke() {
    if (!revoking) return;
    setBusy(true);
    try {
      await scoringApi.revokeAccess(id, revoking.userId);
      toast.success("Scorer access revoked");
      setRevoking(null);
      refresh();
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  if (matchQ.isPending) return <FullScreenSpinner />;
  if (matchQ.isError || !match)
    return (
      <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
        <AppBar title="Scorers" backTo={`/matches/${id}`} />
        <PageError error={matchQ.error} onRetry={matchQ.refetch} />
      </div>
    );

  const active = (scorersQ.data ?? []).filter(
    (s) => s.transferStatus === "accepted" || s.isActive,
  );
  const history = historyQ.data?.transfers ?? [];
  const pending = history.filter((t) => t.transferStatus === "pending");

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col">
      <AppBar title="Scorers" backTo={`/matches/${id}`} />

      <main className="flex-1 space-y-4 px-4 py-4 pb-12">
        <Card className="p-4">
          <p className="font-display text-sm font-bold uppercase tracking-wide">
            Hand over scoring
          </p>
          <p className="mt-1 text-xs leading-relaxed text-text-dim">
            Pass ball-by-ball scoring to a teammate from either side. They accept
            from their Score Center tab.
          </p>
          <Button
            className="mt-3"
            fullWidth
            loading={busy && !revoking}
            onClick={() => setPickerOpen(true)}
          >
            Transfer to a teammate
          </Button>
        </Card>

        <section className="space-y-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-text-faint">
            Active scorers
          </h3>
          {active.length === 0 ? (
            <Card>
              <p className="text-sm text-text-dim">No active scorers listed.</p>
            </Card>
          ) : (
            active.map((s) => (
              <Card key={s.id} className="p-0">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {s.user?.name ?? s.userId.slice(0, 8)}
                    </p>
                    <p className="text-xs text-text-dim">{ROLE_LABEL[s.role] ?? s.role}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRevoking(s)}
                  >
                    Revoke
                  </Button>
                </div>
              </Card>
            ))
          )}
        </section>

        {pending.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-faint">
              Awaiting response
            </h3>
            {pending.map((t) => (
              <Card key={t.id} className="p-0">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {t.transferredToUser?.name ?? t.userId.slice(0, 8)}
                    </p>
                    <p className="text-xs text-text-dim">Transfer pending</p>
                  </div>
                  <Chip tone="warn">Pending</Chip>
                </div>
              </Card>
            ))}
          </section>
        )}

        {history.length > 0 && (
          <section className="space-y-2">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-text-faint">
              History
            </h3>
            {history.map((t) => (
              <Card key={t.id} className="p-0">
                <div className="flex items-center gap-3 px-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold">
                      {t.transferredFromUser?.name ?? "—"}
                      <span className="text-text-faint"> → </span>
                      {t.transferredToUser?.name ?? t.user?.name ?? "—"}
                    </p>
                    {t.transferReason && (
                      <p className="truncate text-xs text-text-dim">{t.transferReason}</p>
                    )}
                  </div>
                  <Chip tone={STATUS_TONE[t.transferStatus] ?? "dim"}>
                    {t.transferStatus}
                  </Chip>
                </div>
              </Card>
            ))}
          </section>
        )}
      </main>

      <PlayerPickerSheet
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="New scorer"
        hint="Members of both teams can take over scoring."
        players={memberOptions}
        onSelect={(p) => void handleTransfer(p)}
      />

      <ConfirmDialog
        open={Boolean(revoking)}
        onClose={() => setRevoking(null)}
        onConfirm={() => void handleRevoke()}
        title="Revoke scorer access"
        message={`Revoke scoring access for ${revoking?.user?.name ?? "this scorer"}? They won't be able to record balls.`}
        confirmLabel="Revoke"
        danger
        loading={busy}
      />
    </div>
  );
}
