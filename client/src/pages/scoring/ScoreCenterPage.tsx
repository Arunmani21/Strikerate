import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Radio } from "lucide-react";

import { matchesApi } from "../../api/matches.api";
import { scoringApi } from "../../api/scoring.api";
import { errorMessage } from "../../lib/api";
import { qk } from "../../lib/queryKeys";
import { toast } from "../../stores/toast.store";
import type { ScorerPermission } from "../../types/scoring";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Chip } from "../../components/ui/Chip";
import { EmptyState } from "../../components/ui/EmptyState";
import { Sheet } from "../../components/ui/Sheet";
import { Textarea } from "../../components/ui/Textarea";

export function ScoreCenterPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const pendingQ = useQuery({
    queryKey: qk.pendingTransfers,
    queryFn: () => scoringApi.pendingTransfers(),
  });
  const liveQ = useQuery({
    queryKey: qk.matchesByStatus("live"),
    queryFn: () => matchesApi.byStatus("live"),
  });

  const [rejecting, setRejecting] = useState<ScorerPermission | null>(null);
  const [reason, setReason] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const pending = pendingQ.data ?? [];
  const live = liveQ.data ?? [];

  async function accept(t: ScorerPermission) {
    setBusyId(t.id);
    try {
      await scoringApi.acceptTransfer(t.id, true);
      toast.success("You're the scorer now");
      void queryClient.invalidateQueries({ queryKey: qk.pendingTransfers });
      if (t.matchId) navigate(`/matches/${t.matchId}/score`);
    } catch (e) {
      toast.error(errorMessage(e));
      setBusyId(null);
    }
  }

  async function reject() {
    if (!rejecting) return;
    setBusyId(rejecting.id);
    try {
      await scoringApi.rejectTransfer(rejecting.id, reason.trim() || "Declined");
      toast.success("Transfer declined");
      setRejecting(null);
      setReason("");
      void queryClient.invalidateQueries({ queryKey: qk.pendingTransfers });
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div>
      <header className="px-4 pt-safe">
        <div className="flex h-16 items-center">
          <h1 className="font-display text-2xl font-bold uppercase tracking-wide">
            Score
          </h1>
        </div>
      </header>

      <div className="space-y-5 px-4 pb-12">
        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-faint">
            Transfer requests
          </h2>
          {pendingQ.isPending ? (
            <Card>
              <p className="text-sm text-text-dim">Checking…</p>
            </Card>
          ) : pending.length === 0 ? (
            <Card className="p-0">
              <EmptyState
                icon={Radio}
                title="No pending transfers"
                hint="If another scorer hands a match to you, it lands here."
              />
            </Card>
          ) : (
            pending.map((t) => (
              <Card key={t.id}>
                <p className="font-display text-sm font-bold leading-snug">
                  {t.match?.teamA?.name ?? "Team A"}{" "}
                  <span className="text-text-faint">vs</span>{" "}
                  {t.match?.teamB?.name ?? "Team B"}
                </p>
                <p className="mt-1 text-xs text-text-dim">
                  {t.transferredFromUser?.name ?? "Another scorer"} wants you to take
                  over scoring
                  {t.role ? ` · ${t.role.replaceAll("_", " ")}` : ""}
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Button
                    loading={busyId === t.id}
                    onClick={() => void accept(t)}
                  >
                    Accept
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={busyId === t.id}
                    onClick={() => setRejecting(t)}
                  >
                    Decline
                  </Button>
                </div>
              </Card>
            ))
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-faint">
            Live now
          </h2>
          {liveQ.isPending ? (
            <Card>
              <p className="text-sm text-text-dim">Loading…</p>
            </Card>
          ) : live.length === 0 ? (
            <Card className="p-0">
              <EmptyState
                icon={Radio}
                title="No live matches"
                hint="Matches in play show up here for scoring and watching."
              />
            </Card>
          ) : (
            live.map((m) => (
              <Card key={m.id} className="p-0">
                <Link
                  to={`/matches/${m.id}`}
                  className="block px-4 pb-2 pt-3 active:bg-elevated"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="min-w-0 truncate font-display text-sm font-bold leading-snug">
                      {m.teamA?.name ?? "Team A"}{" "}
                      <span className="text-text-faint">vs</span>{" "}
                      {m.teamB?.name ?? "Team B"}
                    </p>
                    <Chip tone="accent">Live</Chip>
                  </div>
                  <p className="mt-0.5 text-xs text-text-dim tnum">
                    {m.totalOvers} ov
                    {m.currentInnings ? ` · innings ${m.currentInnings}` : ""}
                  </p>
                </Link>
                <div className="grid grid-cols-2 gap-2 px-4 pb-3">
                  <Link to={`/matches/${m.id}/score`}>
                    <Button fullWidth size="sm">
                      Score
                    </Button>
                  </Link>
                  <Link to={`/matches/${m.id}/live`}>
                    <Button fullWidth size="sm" variant="secondary">
                      Watch
                    </Button>
                  </Link>
                </div>
              </Card>
            ))
          )}
        </section>
      </div>

      <Sheet
        open={Boolean(rejecting)}
        onClose={() => {
          setRejecting(null);
          setReason("");
        }}
        title="Decline transfer"
      >
        <div className="space-y-3">
          <Textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Reason (optional)"
            rows={3}
          />
          <Button
            variant="danger"
            fullWidth
            loading={busyId === rejecting?.id}
            onClick={() => void reject()}
          >
            Decline transfer
          </Button>
        </div>
      </Sheet>
    </div>
  );
}
