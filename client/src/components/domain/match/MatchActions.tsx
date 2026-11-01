import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CloudRain, Flag, Handshake, XCircle } from "lucide-react";

import { matchesApi } from "../../../api/matches.api";
import { errorMessage } from "../../../lib/api";
import { qk } from "../../../lib/queryKeys";
import { toast } from "../../../stores/toast.store";
import type { Match } from "../../../types/match";
import type { TeamRole } from "../../../types/enums";
import type { AbandonReason, DelayType, VictoryType } from "../../../types/enums";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Field } from "../../ui/Field";
import { Input } from "../../ui/Input";
import { SegmentedTabs } from "../../ui/SegmentedTabs";
import { Select } from "../../ui/Select";
import { Sheet } from "../../ui/Sheet";
import { Textarea } from "../../ui/Textarea";

type ActionKind =
  | "complete"
  | "tie"
  | "draw"
  | "delay"
  | "resume"
  | "abandon"
  | "postpone"
  | "cancel";

const ACTIONS_BY_STATUS: Record<string, { kind: ActionKind; label: string }[]> = {
  scheduled: [
    { kind: "postpone", label: "Postpone" },
    { kind: "cancel", label: "Cancel match" },
  ],
  live: [
    { kind: "delay", label: "Declare delay" },
    { kind: "complete", label: "Record result" },
    { kind: "tie", label: "Declare tied" },
    { kind: "draw", label: "Declare draw" },
    { kind: "abandon", label: "Abandon" },
  ],
  innings_break: [
    { kind: "complete", label: "Record result" },
    { kind: "tie", label: "Declare tied" },
    { kind: "draw", label: "Declare draw" },
    { kind: "abandon", label: "Abandon" },
  ],
  rain_delayed: [{ kind: "resume", label: "Resume play" }, { kind: "abandon", label: "Abandon" }],
  bad_light_delayed: [
    { kind: "resume", label: "Resume play" },
    { kind: "abandon", label: "Abandon" },
  ],
};

export function MatchActionsCard({
  match,
  myRoleA,
  myRoleB,
}: {
  match: Match;
  myRoleA?: TeamRole | null;
  myRoleB?: TeamRole | null;
}) {
  const [open, setOpen] = useState<ActionKind | null>(null);

  const isCaptain = myRoleA === "captain" || myRoleB === "captain";
  if (!isCaptain) return null;

  const actions = ACTIONS_BY_STATUS[match.status] ?? [];
  if (actions.length === 0) return null;

  const teamName = (teamId: string) =>
    teamId === match.teamAId
      ? (match.teamA?.name ?? "Team A")
      : (match.teamB?.name ?? "Team B");

  return (
    <Card>
      <h3 className="font-display text-sm font-bold uppercase tracking-wide">
        Match management
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-text-dim">
        Captains only. These actions change the official match status.
      </p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <Button
            key={a.kind}
            variant={
              a.kind === "cancel" || a.kind === "abandon" ? "danger" : "secondary"
            }
            size="sm"
            onClick={() => setOpen(a.kind)}
          >
            {a.label}
          </Button>
        ))}
      </div>

      <ActionSheet
        kind={open}
        match={match}
        teamName={teamName}
        onClose={() => setOpen(null)}
      />
    </Card>
  );
}

function ActionSheet({
  kind,
  match,
  teamName,
  onClose,
}: {
  kind: ActionKind | null;
  match: Match;
  teamName: (teamId: string) => string;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: qk.match(match.id) });
    queryClient.invalidateQueries({ queryKey: ["matches"] });
  };

  const act = useMutation({
    mutationFn: (run: () => Promise<{ message: string }>) => run(),
    onSuccess: (res) => {
      invalidate();
      toast.success(res.message);
      onClose();
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  return (
    <Sheet
      open={kind !== null}
      onClose={onClose}
      title={kind ? TITLE[kind] : ""}
    >
      {kind === "complete" && (
        <CompleteForm
          teamName={teamName}
          teamAId={match.teamAId}
          teamBId={match.teamBId}
          busy={act.isPending}
          onSubmit={(body) => act.mutate(() => matchesApi.complete(match.id, body))}
        />
      )}
      {kind === "delay" && (
        <DelayForm
          busy={act.isPending}
          onSubmit={(body) => act.mutate(() => matchesApi.delay(match.id, body))}
        />
      )}
      {kind === "abandon" && (
        <AbandonForm
          busy={act.isPending}
          onSubmit={(body) => act.mutate(() => matchesApi.abandon(match.id, body))}
        />
      )}
      {kind === "postpone" && (
        <PostponeForm
          busy={act.isPending}
          onSubmit={(body) => act.mutate(() => matchesApi.postpone(match.id, body))}
        />
      )}
      {kind === "tie" && (
        <NoteForm
          noteLabel="Note (optional)"
          busy={act.isPending}
          submitLabel="Declare tied"
          danger={false}
          onSubmit={(description) =>
            act.mutate(() => matchesApi.declareTie(match.id, description || undefined))
          }
        />
      )}
      {kind === "draw" && (
        <NoteForm
          noteLabel="Why was it drawn? (optional)"
          busy={act.isPending}
          submitLabel="Declare draw"
          danger={false}
          onSubmit={(reason) =>
            act.mutate(() => matchesApi.declareDraw(match.id, { reason: reason || undefined }))
          }
        />
      )}
      {kind === "resume" && (
        <NoteForm
          noteLabel="Note (optional)"
          busy={act.isPending}
          submitLabel="Resume play"
          danger={false}
          onSubmit={() => act.mutate(() => matchesApi.resume(match.id, {}))}
        />
      )}
      {kind === "cancel" && (
        <NoteForm
          noteLabel="Reason (optional)"
          busy={act.isPending}
          submitLabel="Cancel match"
          danger
          onSubmit={(reason) => act.mutate(() => matchesApi.cancel(match.id, reason || undefined))}
        />
      )}
    </Sheet>
  );
}

const TITLE: Record<ActionKind, string> = {
  complete: "Record result",
  tie: "Declare match tied",
  draw: "Declare match drawn",
  delay: "Declare a delay",
  resume: "Resume play",
  abandon: "Abandon match",
  postpone: "Postpone match",
  cancel: "Cancel match",
};

function CompleteForm({
  teamName,
  teamAId,
  teamBId,
  busy,
  onSubmit,
}: {
  teamName: (teamId: string) => string;
  teamAId: string;
  teamBId: string;
  busy: boolean;
  onSubmit: (body: {
    winningTeamId: string;
    victoryType: VictoryType;
    margin: number;
    resultDescription?: string;
  }) => void;
}) {
  const [winner, setWinner] = useState<string>(teamAId);
  const [victoryType, setVictoryType] = useState<VictoryType>("runs");
  const [margin, setMargin] = useState("1");
  const [description, setDescription] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        const m = Math.max(1, Math.floor(Number(margin) || 0));
        onSubmit({
          winningTeamId: winner,
          victoryType,
          margin: m,
          resultDescription: description.trim() || undefined,
        });
      }}
    >
      <Field label="Winner">
        <SegmentedTabs
          items={[
            { value: teamAId, label: teamName(teamAId) },
            { value: teamBId, label: teamName(teamBId) },
          ]}
          value={winner}
          onChange={setWinner}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Won by">
          <Select
            value={victoryType}
            onChange={(e) => setVictoryType(e.target.value as VictoryType)}
          >
            <option value="runs">Runs</option>
            <option value="wickets">Wickets</option>
            <option value="innings">Innings</option>
            <option value="forfeit">Forfeit</option>
          </Select>
        </Field>
        <Field label="Margin">
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            value={margin}
            onChange={(e) => setMargin(e.target.value)}
          />
        </Field>
      </div>
      <Field label="Result note" hint="Optional — shown on the match page">
        <Input
          placeholder={`${teamName(winner)} won by ${margin || "…"} ${victoryType}`}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </Field>
      <Button type="submit" fullWidth size="lg" loading={busy}>
        <Flag className="size-4" />
        Complete match
      </Button>
    </form>
  );
}

function DelayForm({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (body: { delayType: DelayType; estimatedDuration: number }) => void;
}) {
  const [delayType, setDelayType] = useState<DelayType>("rain");
  const [duration, setDuration] = useState("30");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          delayType,
          estimatedDuration: Math.max(1, Math.floor(Number(duration) || 1)),
        });
      }}
    >
      <Field label="Reason">
        <SegmentedTabs
          items={[
            { value: "rain", label: "Rain" },
            { value: "bad_light", label: "Bad light" },
          ]}
          value={delayType}
          onChange={setDelayType}
        />
      </Field>
      <Field label="Expected delay (minutes)">
        <Input
          type="number"
          inputMode="numeric"
          min={1}
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
        />
      </Field>
      <Button type="submit" variant="secondary" fullWidth size="lg" loading={busy}>
        <CloudRain className="size-4" />
        Stop play
      </Button>
    </form>
  );
}

function AbandonForm({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (body: { reason: AbandonReason; details?: string }) => void;
}) {
  const [reason, setReason] = useState<AbandonReason>("rain");
  const [details, setDetails] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ reason, details: details.trim() || undefined });
      }}
    >
      <Field label="Reason">
        <Select value={reason} onChange={(e) => setReason(e.target.value as AbandonReason)}>
          <option value="rain">Rain</option>
          <option value="bad_light">Bad light</option>
          <option value="pitch_conditions">Pitch conditions</option>
          <option value="crowd_trouble">Crowd trouble</option>
          <option value="security">Security</option>
          <option value="other">Other</option>
        </Select>
      </Field>
      <Field label="Details" hint="Optional">
        <Textarea
          placeholder="What happened?"
          value={details}
          onChange={(e) => setDetails(e.target.value)}
        />
      </Field>
      <Button type="submit" variant="danger" fullWidth size="lg" loading={busy}>
        Abandon match
      </Button>
    </form>
  );
}

function PostponeForm({
  busy,
  onSubmit,
}: {
  busy: boolean;
  onSubmit: (body: {
    reason: string;
    rescheduledDate: string;
    rescheduledTime: string;
  }) => void;
}) {
  const [reason, setReason] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        if (!reason.trim() || !date || !time) return;
        onSubmit({ reason: reason.trim(), rescheduledDate: date, rescheduledTime: time });
      }}
    >
      <Field label="Reason">
        <Input
          placeholder="e.g. Ground unavailable"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="New date">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="New time">
          <Input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>
      <Button
        type="submit"
        variant="secondary"
        fullWidth
        size="lg"
        loading={busy}
        disabled={!reason.trim() || !date || !time}
      >
        Postpone
      </Button>
    </form>
  );
}

function NoteForm({
  noteLabel,
  submitLabel,
  danger,
  busy,
  onSubmit,
}: {
  noteLabel: string;
  submitLabel: string;
  danger: boolean;
  busy: boolean;
  onSubmit: (note: string) => void;
}) {
  const [note, setNote] = useState("");

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(note.trim());
      }}
    >
      <Field label={noteLabel}>
        <Textarea value={note} onChange={(e) => setNote(e.target.value)} />
      </Field>
      <Button
        type="submit"
        variant={danger ? "danger" : "secondary"}
        fullWidth
        size="lg"
        loading={busy}
      >
        {danger ? <XCircle className="size-4" /> : <Handshake className="size-4" />}
        {submitLabel}
      </Button>
    </form>
  );
}
