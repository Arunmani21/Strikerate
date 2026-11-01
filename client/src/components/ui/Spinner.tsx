import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("size-5 animate-spin text-accent", className)} />
  );
}

export function FullScreenSpinner() {
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <Loader2 className="size-7 animate-spin text-accent" />
    </div>
  );
}
