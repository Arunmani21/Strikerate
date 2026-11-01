import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

interface FieldProps {
  label?: string;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

export function Field({ label, error, hint, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-xs font-semibold uppercase tracking-wider text-text-dim">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-wicket">{error}</p>
      ) : hint ? (
        <p className="text-xs text-text-faint">{hint}</p>
      ) : null}
    </div>
  );
}
