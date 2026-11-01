import type { ReactNode } from "react";
import { cn } from "../../lib/cn";

type TileTone = "default" | "accent" | "gold" | "wicket" | "warn" | "info";

const toneClasses: Record<TileTone, string> = {
  default: "text-text",
  accent: "text-accent",
  gold: "text-gold",
  wicket: "text-wicket",
  warn: "text-warn",
  info: "text-info",
};

interface StatTileProps {
  label: string;
  value: ReactNode;
  sub?: string;
  tone?: TileTone;
  className?: string;
}

export function StatTile({
  label,
  value,
  sub,
  tone = "default",
  className,
}: StatTileProps) {
  return (
    <div
      className={cn(
        "rounded-md border border-line-soft bg-elevated px-3 py-2.5",
        className,
      )}
    >
      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-display text-xl font-bold leading-none tnum",
          toneClasses[tone],
        )}
      >
        {value}
      </p>
      {sub && <p className="mt-1.5 text-[11px] leading-tight text-text-dim">{sub}</p>}
    </div>
  );
}
