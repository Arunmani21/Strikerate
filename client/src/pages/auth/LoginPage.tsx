import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQueryClient } from "@tanstack/react-query";

import { authApi } from "../../api/auth.api";
import { errorMessage } from "../../lib/api";
import { useAuthStore } from "../../stores/auth.store";
import { emailSchema } from "../../lib/schemas";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { GoogleButton } from "../../components/ui/GoogleButton";
import { Wordmark } from "../../components/ui/Wordmark";

const schema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((s) => s.setAuth);
  const queryClient = useQueryClient();
  const [serverError, setServerError] = useState<string | null>(null);

  const state = location.state as { email?: string; from?: string } | null;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: state?.email ?? "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const res = await authApi.login(values.email, values.password);
      setAuth(res.access_token, res.user);
      queryClient.removeQueries();
      navigate(state?.from ?? "/", { replace: true });
    } catch (e) {
      setServerError(errorMessage(e));
    }
  });

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-6">
      <div className="flex flex-1 flex-col justify-center py-10">
        <div className="mb-10 flex flex-col items-center gap-3 text-center">
          <Wordmark size="lg" />
          <p className="text-sm text-text-dim">Cricket scoring & performance analysis</p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4" noValidate>
          {serverError && (
            <div className="rounded-md border border-wicket/40 bg-wicket-soft px-3 py-2.5 text-sm text-wicket">
              {serverError}
            </div>
          )}

          <Field label="Email" error={errors.email?.message}>
            <Input
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              {...register("email")}
            />
          </Field>

          <Field label="Password" error={errors.password?.message}>
            <Input
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              {...register("password")}
            />
          </Field>

          <Button type="submit" size="lg" fullWidth loading={isSubmitting}>
            Log in
          </Button>
        </form>

        <div className="mt-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-line" />
          <span className="text-xs text-text-dim">or</span>
          <span className="h-px flex-1 bg-line" />
        </div>
        <div className="mt-4">
          <GoogleButton />
        </div>

        <p className="mt-6 text-center text-sm text-text-dim">
          New to Strikerate?{" "}
          <Link to="/register" className="font-semibold text-accent">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
