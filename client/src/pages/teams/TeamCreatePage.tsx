import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { teamsApi } from "../../api/teams.api";
import { errorMessage } from "../../lib/api";
import { qk } from "../../lib/queryKeys";
import { toast } from "../../stores/toast.store";
import { Screen } from "../../layouts/Screen";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Team name must be 3–50 characters")
    .max(50, "Team name must be 3–50 characters"),
});

type FormValues = z.infer<typeof schema>;

export function TeamCreatePage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "" },
  });

  const create = useMutation({
    mutationFn: (values: FormValues) => teamsApi.create(values.name),
    onSuccess: (team) => {
      queryClient.invalidateQueries({ queryKey: qk.myTeams });
      toast.success(`Team "${team.name}" created`);
      navigate(`/teams/${team.id}`, { replace: true });
    },
    onError: (e) => setServerError(errorMessage(e)),
  });

  return (
    <Screen title="New team" backTo="/teams">
      <form
        onSubmit={handleSubmit((v) => create.mutate(v))}
        className="space-y-4"
        noValidate
      >
        {serverError && (
          <div className="rounded-md border border-wicket/40 bg-wicket-soft px-3 py-2.5 text-sm text-wicket">
            {serverError}
          </div>
        )}

        <Field label="Team name" error={errors.name?.message}>
          <Input placeholder="e.g. Thunder Strikers" autoFocus {...register("name")} />
        </Field>

        <p className="text-xs leading-relaxed text-text-faint">
          You'll be the captain. Add players and invite members from the team page next.
        </p>

        <Button
          type="submit"
          size="lg"
          fullWidth
          loading={isSubmitting || create.isPending}
        >
          Create team
        </Button>
      </form>
    </Screen>
  );
}
