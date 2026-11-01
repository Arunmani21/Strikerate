import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

export type ChipTone =
  | "accent"
  | "info"
  | "warn"
  | "gold"
  | "wicket"
  | "dim";

const toneClasses: Record<ChipTone, string> = {
  accent: "bg-accent-soft text-accent",
  info: "bg-info-soft text-info",
  warn: "bg-warn-soft text-warn",
  gold: "bg-gold-soft text-gold",
  wicket: "bg-wicket-soft text-wicket",
  dim: "bg-elevated text-text-dim",
};

interface ChipProps {
  tone?: ChipTone;
  className?: string;
  children: ReactNode;
}

export function Chip({ tone = "dim", className, children }: ChipProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
