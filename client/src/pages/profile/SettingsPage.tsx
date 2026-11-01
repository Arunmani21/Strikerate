import { useState } from "react";
import { useNavigate } from "react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut } from "lucide-react";

import { useAuthStore } from "../../stores/auth.store";
import { Screen } from "../../layouts/Screen";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ConfirmDialog } from "../../components/ui/ConfirmDialog";

export function SettingsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clear = useAuthStore((s) => s.clear);
  const [confirming, setConfirming] = useState(false);

  const logout = () => {
    clear();
    queryClient.clear();
    navigate("/login", { replace: true });
  };

  return (
    <Screen title="Settings" backTo="/profile">
      <Card className="space-y-0 p-0">
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm font-medium">Version</span>
          <span className="text-sm text-text-dim tnum">0.1.0</span>
        </div>
        <div className="border-t border-line-soft" />
        <div className="flex items-center justify-between px-4 py-3.5">
          <span className="text-sm font-medium">Server</span>
          <span className="text-sm text-text-dim">
            {import.meta.env.VITE_API_URL ?? "http://localhost:3000"}
          </span>
        </div>
      </Card>

      <Button variant="danger" fullWidth onClick={() => setConfirming(true)}>
        <LogOut className="size-4" />
        Log out
      </Button>

      <ConfirmDialog
        open={confirming}
        onClose={() => setConfirming(false)}
        onConfirm={logout}
        title="Log out?"
        message="You'll need to log in again to score or follow matches."
        confirmLabel="Log out"
        danger
      />
    </Screen>
  );
}
