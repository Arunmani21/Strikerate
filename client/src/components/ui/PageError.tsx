import { AlertTriangle, RefreshCw } from "lucide-react";
import { errorMessage } from "../../lib/api";
import { Button } from "./Button";

interface PageErrorProps {
  error: unknown;
  onRetry?: () => void;
}

export function PageError({ error, onRetry }: PageErrorProps) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-wicket-soft text-wicket">
        <AlertTriangle className="size-5" />
      </div>
      <p className="max-w-[280px] text-sm leading-relaxed text-text-dim">
        {errorMessage(error)}
      </p>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}
