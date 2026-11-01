import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../stores/auth.store";
import { FullScreenSpinner } from "../components/ui/Spinner";

export function RequireAuth() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);
  const location = useLocation();

  if (!hasHydrated) return <FullScreenSpinner />;
  if (!token)
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname + location.search }}
      />
    );
  return <Outlet />;
}

export function PublicOnly() {
  const token = useAuthStore((s) => s.token);
  const hasHydrated = useAuthStore((s) => s.hasHydrated);

  if (!hasHydrated) return <FullScreenSpinner />;
  if (token) return <Navigate to="/" replace />;
  return <Outlet />;
}
