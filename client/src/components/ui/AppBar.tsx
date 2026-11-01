import { ChevronLeft } from "lucide-react";
import type { ReactNode } from "react";
import { useNavigate } from "react-router";
import { cn } from "../../lib/cn";

interface AppBarProps {
  title: ReactNode;
  backTo?: string;
  onBack?: () => void;
  right?: ReactNode;
  className?: string;
}

export function AppBar({ title, backTo, onBack, right, className }: AppBarProps) {
  const navigate = useNavigate();
  const showBack = Boolean(onBack || backTo);

  return (
    <header
      className={cn(
        "pt-safe sticky top-0 z-40 border-b border-line bg-bg/90 backdrop-blur-md",
        className,
      )}
    >
      <div className="flex h-14 items-center gap-1 px-2">
        {showBack && (
          <button
            aria-label="Back"
            onClick={() => (onBack ? onBack() : backTo && navigate(backTo))}
            className="flex size-11 shrink-0 items-center justify-center rounded-full text-text-dim active:bg-elevated"
          >
            <ChevronLeft className="size-5" />
          </button>
        )}
        <h1 className="min-w-0 flex-1 truncate px-1 font-display text-lg font-bold uppercase tracking-wide">
          {title}
        </h1>
        {right && <div className="flex shrink-0 items-center pr-1">{right}</div>}
      </div>
    </header>
  );
}
