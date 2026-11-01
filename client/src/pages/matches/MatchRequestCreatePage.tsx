import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info } from "lucide-react";

import { matchRequestsApi } from "../../api/matchRequests.api";
import { teamsApi } from "../../api/teams.api";
import { errorMessage } from "../../lib/api";
import { qk } from "../../lib/queryKeys";
import { optionalInt } from "../../lib/schemas";
import { toast } from "../../stores/toast.store";
import { Screen } from "../../layouts/Screen";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { EmptyState } from "../../components/ui/EmptyState";
import { Field } from "../../components/ui/Field";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { Input } from "../../components/ui/Input";

const schema = z.object({
  opponentTeamId: z.string().uuid("Enter the opponent team's ID"),
  matchDate: z.string().min(1, "Pick a date"),
  matchTime: z.string().min(1, "Pick a start time"),
  venue: z.string().trim().max(200, "Keep it under 200 characters").optional(),
  preferredOvers: optionalInt(5, 50),
});

type FormValues = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function MatchRequestCreatePage() {
  const { id: teamId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const teamQ = useQuery({ queryKey: qk.team(teamId), queryFn: () => teamsApi.get(teamId) });
  const roleQ = useQuery({
    queryKey: qk.teamMyRole(teamId),
    queryFn: () => teamsApi.myRole(teamId),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, undefined, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { matchDate: "", matchTime: "", venue: "", preferredOvers: "20" },
  });

  const send = useMutation({
    mutationFn: (v: FormOutput) =>
      matchRequestsApi.create(teamId, {
        opponentTeamId: v.opponentTeamId,
        matchDate: v.matchDate,
        matchTime: v.matchTime,
        venue: v.venue || undefined,
        preferredOvers: v.preferredOvers,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["match-requests"] });
      toast.success("Match request sent");
      navigate(`/teams/${teamId}`);
    },
    onError: (e) => setServerError(errorMessage(e)),
  });

  if (teamQ.isPending || roleQ.isPending) return <FullScreenSpinner />;
  if (teamQ.isError || !teamQ.data)
    return (
      <Screen title="Request match" backTo={`/teams/${teamId}`}>
        <EmptyState title="Team not found" />
      </Screen>
    );

  if (roleQ.data?.role !== "captain") {
    return (
      <Screen title="Request match" backTo={`/teams/${teamId}`}>
        <EmptyState
          title="Captains only"
          hint="Only the team captain can send match requests."
        />
      </Screen>
    );
  }

  return (
    <Screen title="Request match" backTo={`/teams/${teamId}`}>
      <form
        onSubmit={handleSubmit((v) => send.mutate(v))}
        className="space-y-4"
        noValidate
      >
        {serverError && (
          <div className="rounded-md border border-wicket/40 bg-wicket-soft px-3 py-2.5 text-sm text-wicket">
            {serverError}
          </div>
        )}

        <Card>
          <p className="flex items-start gap-2 text-xs leading-relaxed text-text-dim">
            <Info className="mt-0.5 size-3.5 shrink-0 text-info" />
            The opponent must have posted availability for the date you pick. Share team
            IDs with other captains — there's no team directory yet.
          </p>
        </Card>

        <Field label="Opponent team ID" error={errors.opponentTeamId?.message}>
          <Input
            placeholder="Ask the opposing captain for their team ID"
            {...register("opponentTeamId")}
          />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Date" error={errors.matchDate?.message}>
            <Input type="date" {...register("matchDate")} />
          </Field>
          <Field label="Start time" error={errors.matchTime?.message}>
            <Input type="time" {...register("matchTime")} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Venue" error={errors.venue?.message}>
            <Input placeholder="Optional" {...register("venue")} />
          </Field>
          <Field label="Overs" error={errors.preferredOvers?.message}>
            <Input
              type="number"
              inputMode="numeric"
              min={5}
              max={50}
              {...register("preferredOvers")}
            />
          </Field>
        </div>

        <p className="text-xs leading-relaxed text-text-faint">
          The opposing captain confirms the request — confirming creates the fixture and
          closes both teams' availability for that date.
        </p>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting || send.isPending}
        >
          Send request
        </Button>
      </form>
    </Screen>
  );
}
