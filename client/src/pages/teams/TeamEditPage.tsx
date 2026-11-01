import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { teamsApi } from "../../api/teams.api";
import { errorMessage } from "../../lib/api";
import { qk } from "../../lib/queryKeys";
import { toast } from "../../stores/toast.store";
import { AppBar } from "../../components/ui/AppBar";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { Input } from "../../components/ui/Input";
import { PageError } from "../../components/ui/PageError";
import { Textarea } from "../../components/ui/Textarea";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Team name must be 3–50 characters")
    .max(50, "Team name must be 3–50 characters"),
  homeGround: z.string().trim().max(120, "Keep it under 120 characters").optional(),
  description: z.string().trim().max(500, "Keep it under 500 characters").optional(),
});

type FormValues = z.infer<typeof schema>;

export function TeamEditPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const teamQuery = useQuery({ queryKey: qk.team(id), queryFn: () => teamsApi.get(id) });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", homeGround: "", description: "" },
  });

  useEffect(() => {
    if (teamQuery.data) {
      reset({
        name: teamQuery.data.name,
        homeGround: teamQuery.data.homeGround ?? "",
        description: teamQuery.data.description ?? "",
      });
    }
  }, [teamQuery.data, reset]);

  const save = useMutation({
    mutationFn: (values: FormValues) =>
      teamsApi.updateDetails(id, {
        name: values.name,
        homeGround: values.homeGround || undefined,
        description: values.description || undefined,
      }),
    onSuccess: (team) => {
      queryClient.invalidateQueries({ queryKey: qk.team(id) });
      queryClient.invalidateQueries({ queryKey: qk.myTeams });
      toast.success("Team updated");
      navigate(`/teams/${team.id}`, { replace: true });
    },
    onError: (e) => setServerError(errorMessage(e)),
  });

  if (teamQuery.isPending) return <FullScreenSpinner />;
  if (teamQuery.isError || !teamQuery.data)
    return (
      <div className="mx-auto max-w-[480px]">
        <AppBar title="Edit team" backTo={`/teams/${id}`} />
        <PageError error={teamQuery.error} onRetry={teamQuery.refetch} />
      </div>
    );

  return (
    <div className="mx-auto max-w-[480px]">
      <AppBar title="Edit team" backTo={`/teams/${id}`} />

      <main className="px-4 py-4">
        <form
          onSubmit={handleSubmit((v) => save.mutate(v))}
          className="space-y-4"
          noValidate
        >
          {serverError && (
            <div className="rounded-md border border-wicket/40 bg-wicket-soft px-3 py-2.5 text-sm text-wicket">
              {serverError}
            </div>
          )}

          <Field label="Team name" error={errors.name?.message}>
            <Input {...register("name")} />
          </Field>

          <Field
            label="Home ground"
            hint="Where you usually play"
            error={errors.homeGround?.message}
          >
            <Input placeholder="e.g. Central Park Oval" {...register("homeGround")} />
          </Field>

          <Field label="Description" error={errors.description?.message}>
            <Textarea
              rows={4}
              placeholder="Anything worth knowing about the squad"
              {...register("description")}
            />
          </Field>

          <Button
            type="submit"
            size="lg"
            fullWidth
            loading={isSubmitting || save.isPending}
          >
            Save changes
          </Button>
        </form>
      </main>
    </div>
  );
}
