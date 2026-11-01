import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info } from "lucide-react";

import { availabilityApi } from "../../api/availability.api";
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
import { Textarea } from "../../components/ui/Textarea";
import { cn } from "../../lib/cn";

const schema = z.object({
  availableDate: z.string().min(1, "Pick a date"),
  availableFrom: z.string().min(1, "From time is required"),
  availableUntil: z.string().min(1, "Until time is required"),
  venue: z.string().trim().max(200, "Keep it under 200 characters").optional(),
  preferredOvers: optionalInt(5, 50),
  notes: z.string().trim().max(1000, "Keep it under 1000 characters").optional(),
});

type FormValues = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

function today() {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function TeamAvailabilityPage() {
  const { id: teamId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(true);

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
    defaultValues: {
      availableDate: today(),
      availableFrom: "09:00",
      availableUntil: "17:00",
      venue: "",
      preferredOvers: "20",
      notes: "",
    },
  });

  const post = useMutation({
    mutationFn: (v: FormOutput) =>
      availabilityApi.post(teamId, {
        availableDate: v.availableDate,
        availableFrom: v.availableFrom,
        availableUntil: v.availableUntil,
        venue: v.venue || undefined,
        preferredOvers: v.preferredOvers,
        notes: v.notes || undefined,
        isOpen,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.team(teamId) });
      toast.success("Availability posted");
      navigate(`/teams/${teamId}`);
    },
    onError: (e) => setServerError(errorMessage(e)),
  });

  if (roleQ.isPending) return <FullScreenSpinner />;

  const role = roleQ.data?.role;
  if (role !== "captain" && role !== "vice_captain") {
    return (
      <Screen title="Availability" backTo={`/teams/${teamId}`}>
        <EmptyState
          title="Captains only"
          hint="Only the captain or vice-captain can post team availability."
        />
      </Screen>
    );
  }

  return (
    <Screen title="Availability" backTo={`/teams/${teamId}`}>
      <form
        onSubmit={handleSubmit((v) => post.mutate(v))}
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
            Posting availability lets other captains challenge you to a match on this
            date. It closes automatically once a fixture is confirmed.
          </p>
        </Card>

        <Field label="Date" error={errors.availableDate?.message}>
          <Input type="date" {...register("availableDate")} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="From" error={errors.availableFrom?.message}>
            <Input type="time" {...register("availableFrom")} />
          </Field>
          <Field label="Until" error={errors.availableUntil?.message}>
            <Input type="time" {...register("availableUntil")} />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Venue" error={errors.venue?.message}>
            <Input placeholder="Optional" {...register("venue")} />
          </Field>
          <Field label="Preferred overs" error={errors.preferredOvers?.message}>
            <Input
              type="number"
              inputMode="numeric"
              min={5}
              max={50}
              {...register("preferredOvers")}
            />
          </Field>
        </div>

        <Field label="Notes" error={errors.notes?.message}>
          <Textarea rows={3} placeholder="Optional — pitch info, ground rules…" {...register("notes")} />
        </Field>

        <button
          type="button"
          onClick={() => setIsOpen((v) => !v)}
          className="flex w-full items-center justify-between rounded-lg border border-line bg-surface px-4 py-3.5 text-left active:bg-elevated"
        >
          <span>
            <span className="block text-sm font-semibold">Open to match requests</span>
            <span className="mt-0.5 block text-xs text-text-dim">
              Opponents can send challenges for this date
            </span>
          </span>
          <span
            className={cn(
              "flex h-6 w-11 shrink-0 items-center rounded-full p-0.5 transition-colors",
              isOpen ? "bg-accent" : "bg-line",
            )}
          >
            <span
              className={cn(
                "size-5 rounded-full bg-surface transition-transform",
                isOpen && "translate-x-5",
              )}
            />
          </span>
        </button>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting || post.isPending}
        >
          Post availability
        </Button>
      </form>
    </Screen>
  );
}
