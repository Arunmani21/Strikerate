import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { authApi } from "../../api/auth.api";
import { useAuthStore } from "../../stores/auth.store";
import { Wordmark } from "../../components/ui/Wordmark";

export function GoogleCallbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const [failed, setFailed] = useState(false);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const hash = new URLSearchParams(location.hash.replace(/^#/, ""));
    const token = hash.get("token");
    if (!token) {
      setFailed(true);
      return;
    }

    (async () => {
      // Token comes from the URL fragment; the axios interceptor picks it up
      // from the store, so /auth/me hydrates the real user profile.
      setAuth(token, { id: "", name: "", email: "", emailVerified: true });
      try {
        const me = await authApi.me();
        setAuth(token, me);
        queryClient.removeQueries();
        navigate("/", { replace: true });
      } catch {
        useAuthStore.getState().clear();
        setFailed(true);
      }
    })();
  }, [location.hash, navigate, queryClient, setAuth]);

  return (
    <div className="mx-auto flex min-h-dvh max-w-[480px] flex-col px-6">
      <div className="flex flex-1 flex-col justify-center py-10 text-center">
        <div className="mb-10 flex flex-col items-center gap-3">
          <Wordmark size="lg" />
        </div>
        {failed ? (
          <>
            <p className="text-base font-semibold">Google sign-in failed</p>
            <p className="mt-2 text-sm text-text-dim">
              The sign-in could not be completed. Close this page and try again.
            </p>
            <Link to="/login" className="mt-6 text-sm font-semibold text-accent">
              Back to log in
            </Link>
          </>
        ) : (
          <p className="flex items-center justify-center gap-2 text-sm text-text-dim">
            <Loader2 className="size-4 animate-spin" />
            Signing you in with Google…
          </p>
        )}
      </div>
    </div>
  );
}
