import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { MailCheck } from "lucide-react";

import { authApi } from "../../api/auth.api";
import { errorMessage } from "../../lib/api";
import { toast } from "../../stores/toast.store";
import { Screen } from "../../layouts/Screen";
import { Button } from "../../components/ui/Button";
import { Field } from "../../components/ui/Field";
import { Input } from "../../components/ui/Input";
import { OtpInput } from "../../components/ui/OtpInput";

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { email?: string } | null;

  const [email, setEmail] = useState(state?.email ?? "");
  const [otp, setOtp] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const canVerify = email.trim().length > 3 && otp.length === 6;

  const handleVerify = async () => {
    if (!canVerify || verifying) return;
    setVerifying(true);
    try {
      await authApi.verifyEmail(email.trim(), otp);
      toast.success("Email verified. Log in to continue.");
      navigate("/login", { state: { email: email.trim() }, replace: true });
    } catch (e) {
      toast.error(errorMessage(e));
      setOtp("");
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending || !email.trim()) return;
    setResending(true);
    try {
      await authApi.resendOtp(email.trim());
      toast.success("A new code is on its way.");
      setCooldown(60);
    } catch (e) {
      toast.error(errorMessage(e));
    } finally {
      setResending(false);
    }
  };

  return (
    <Screen title="Verify email" backTo="/login">
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-accent-soft text-accent">
          <MailCheck className="size-7" />
        </div>
        <p className="text-sm leading-relaxed text-text-dim">
          Enter the 6-digit code we emailed
          {state?.email ? " to " : "."}
          {state?.email && <span className="font-semibold text-text">{state.email}</span>}
        </p>
      </div>

      {!state?.email && (
        <Field label="Email">
          <Input
            type="email"
            inputMode="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
      )}

      <div className="space-y-4">
        <OtpInput value={otp} onChange={setOtp} disabled={verifying} />

        <Button size="lg" fullWidth loading={verifying} disabled={!canVerify} onClick={handleVerify}>
          Verify email
        </Button>

        <Button
          variant="ghost"
          size="sm"
          fullWidth
          onClick={handleResend}
          disabled={cooldown > 0 || !email.trim()}
          loading={resending}
        >
          {cooldown > 0 ? `Resend code in ${cooldown}s` : "Resend code"}
        </Button>
      </div>
    </Screen>
  );
}
