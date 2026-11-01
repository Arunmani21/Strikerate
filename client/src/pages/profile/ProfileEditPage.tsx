import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { authApi } from "../../api/auth.api";
import { errorMessage } from "../../lib/api";
import { optionalEnum, optionalInt } from "../../lib/schemas";
import { qk } from "../../lib/queryKeys";
import { toast } from "../../stores/toast.store";
import { Screen } from "../../layouts/Screen";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Textarea } from "../../components/ui/Textarea";

const schema = z.object({
  role: optionalEnum(["batsman", "bowler", "allrounder", "keeper"] as const),
  battingStyle: optionalEnum(["right_hand", "left_hand"] as const),
  bowlingStyle: optionalEnum([
    "right_arm_fast",
    "right_arm_spin",
    "left_arm_fast",
    "left_arm_spin",
  ] as const),
  experienceYears: optionalInt(0, 50),
  bio: z.string().max(500, "At most 500 characters").optional(),
});

type FormValues = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function ProfileEditPage() {
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const { data: user, isPending } = useQuery({ queryKey: qk.me, queryFn: authApi.me });
  const profile = user?.profile ?? null;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, undefined, FormOutput>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (user) {
      reset({
        role: profile?.role ?? undefined,
        battingStyle: profile?.battingStyle ?? undefined,
        bowlingStyle: profile?.bowlingStyle ?? undefined,
        experienceYears: profile?.experienceYears ?? undefined,
        bio: profile?.bio ?? "",
      });
    }
  }, [user, profile, reset]);

  const save = useMutation({
    mutationFn: async (values: FormOutput) => {
      const body = {
        role: values.role,
        battingStyle: values.battingStyle,
        bowlingStyle: values.bowlingStyle,
        experienceYears: values.experienceYears,
        bio: values.bio || undefined,
      };
      return profile ? authApi.updateProfile(body) : authApi.createProfile(body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qk.me });
      toast.success("Profile saved");
      history.back();
    },
    onError: (e) => setServerError(errorMessage(e)),
  });

  return (
    <Screen title="Edit profile" backTo="/profile">
      {isPending ? (
        <div className="space-y-4">
          <div className="h-11 animate-pulse rounded-md bg-elevated" />
          <div className="h-11 animate-pulse rounded-md bg-elevated" />
          <div className="h-11 animate-pulse rounded-md bg-elevated" />
        </div>
      ) : (
        <form onSubmit={handleSubmit((v) => save.mutate(v))} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-md border border-wicket/40 bg-wicket-soft px-3 py-2.5 text-sm text-wicket">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Player role" error={errors.role?.message}>
              <Select defaultValue="" {...register("role")}>
                <option value="">Not set</option>
                <option value="batsman">Batsman</option>
                <option value="bowler">Bowler</option>
                <option value="allrounder">All-rounder</option>
                <option value="keeper">Wicket-keeper</option>
              </Select>
            </Field>
            <Field label="Experience" error={errors.experienceYears?.message}>
              <Input
                type="number"
                inputMode="numeric"
                min={0}
                max={50}
                placeholder="Years"
                {...register("experienceYears")}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Batting style" error={errors.battingStyle?.message}>
              <Select defaultValue="" {...register("battingStyle")}>
                <option value="">Not set</option>
                <option value="right_hand">Right-hand</option>
                <option value="left_hand">Left-hand</option>
              </Select>
            </Field>
            <Field label="Bowling style" error={errors.bowlingStyle?.message}>
              <Select defaultValue="" {...register("bowlingStyle")}>
                <option value="">Not set</option>
                <option value="right_arm_fast">Right-arm fast</option>
                <option value="right_arm_spin">Right-arm spin</option>
                <option value="left_arm_fast">Left-arm fast</option>
                <option value="left_arm_spin">Left-arm spin</option>
              </Select>
            </Field>
          </div>

          <Field label="Bio" error={errors.bio?.message} hint="Up to 500 characters">
            <Textarea rows={4} placeholder="Tell teams about your game..." {...register("bio")} />
          </Field>

          <Button type="submit" size="lg" fullWidth loading={isSubmitting || save.isPending}>
            Save profile
          </Button>
        </form>
      )}
    </Screen>
  );
}
