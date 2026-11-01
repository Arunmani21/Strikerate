import { cn } from "../../../lib/cn";
import type { TokenTone } from "../../../lib/scoring";

const toneClasses: Record<TokenTone, string> = {
  dot: "border border-dot bg-surface text-text-faint",
  run: "border border-line bg-elevated text-text",
  four: "bg-accent-soft text-accent",
  six: "bg-gold-soft text-gold",
  wicket: "bg-wicket text-white",
  extra: "bg-info-soft text-info",
};

const sizeClasses = {
  sm: "size-7 text-[10px]",
  md: "size-9 text-xs",
} as const;

interface BallTokenProps {
  label: string;
  tone: TokenTone;
  title?: string;
  size?: keyof typeof sizeClasses;
}

export function BallToken({ label, tone, title, size = "md" }: BallTokenProps) {
  return (
    <span
      title={title}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-display font-bold tnum",
        toneClasses[tone],
        sizeClasses[size],
      )}
    >
      {label}
    </span>
  );
}
