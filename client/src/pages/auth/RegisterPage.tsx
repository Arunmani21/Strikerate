import { useState } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff } from "lucide-react";

import { authApi } from "../../api/auth.api";
import { errorMessage } from "../../lib/api";
import { emailSchema, optionalEnum, optionalInt, passwordSchema } from "../../lib/schemas";
import { Screen } from "../../layouts/Screen";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { GoogleButton } from "../../components/ui/GoogleButton";
import { Select } from "../../components/ui/Select";

const schema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be 2–50 characters")
    .max(50, "Name must be 2–50 characters")
    .regex(/^[A-Za-z ]+$/, "Letters and spaces only"),
  email: emailSchema,
  password: passwordSchema,
  role: optionalEnum(["batsman", "bowler", "allrounder", "keeper"] as const),
  battingStyle: optionalEnum(["right_hand", "left_hand"] as const),
  bowlingStyle: optionalEnum([
    "right_arm_fast",
    "right_arm_spin",
    "left_arm_fast",
    "left_arm_spin",
  ] as const),
  experienceYears: optionalInt(0, 50),
});

type FormValues = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

export function RegisterPage() {
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues, undefined, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: undefined,
      battingStyle: undefined,
      bowlingStyle: undefined,
      experienceYears: undefined,
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await authApi.register({
        name: values.name,
        email: values.email.toLowerCase(),
        password: values.password,
        role: values.role,
        battingStyle: values.battingStyle,
        bowlingStyle: values.bowlingStyle,
        experienceYears: values.experienceYears,
      });
      navigate("/verify-email", { state: { email: values.email.toLowerCase() }, replace: true });
    } catch (e) {
      setServerError(errorMessage(e));
    }
  });

  return (
    <Screen title="Create account" backTo="/login">
      <div className="mb-6">
        <GoogleButton label="Sign up with Google" />
      </div>

      <div className="mb-6 flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <span className="text-xs text-text-dim">or sign up with email</span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        {serverError && (
          <div className="rounded-md border border-wicket/40 bg-wicket-soft px-3 py-2.5 text-sm text-wicket">
            {serverError}
          </div>
        )}

        <Field label="Full name" error={errors.name?.message}>
          <Input placeholder="e.g. Arjun Kumar" autoComplete="name" {...register("name")} />
        </Field>

        <Field label="Email" error={errors.email?.message}>
          <Input
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            {...register("email")}
          />
        </Field>

        <Field
          label="Password"
          error={errors.password?.message}
          hint="8+ characters with an uppercase letter and a number"
        >
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
              className="pr-11"
              {...register("password")}
            />
            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-1 top-1 flex size-9 items-center justify-center rounded-sm text-text-faint active:bg-line"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
        </Field>

        <div className="pt-2">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-text-faint">
            Cricket profile · optional
          </p>
          <div className="space-y-4">
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
          </div>
        </div>

        <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
          Create account
        </Button>

        <p className="pb-2 text-center text-xs leading-relaxed text-text-faint">
          We'll email you a 6-digit code to verify your address.
        </p>
      </form>
    </Screen>
  );
}
