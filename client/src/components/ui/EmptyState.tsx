import { Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  hint?: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon = Activity, title, hint, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
      <div className="flex size-14 items-center justify-center rounded-full border border-line bg-surface text-text-faint">
        <Icon className="size-6" />
      </div>
      <p className="mt-1 font-display text-base font-semibold uppercase tracking-wide">
        {title}
      </p>
      {hint && <p className="max-w-[280px] text-sm leading-relaxed text-text-dim">{hint}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
