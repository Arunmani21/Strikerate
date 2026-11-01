import { useEffect, useState } from "react";
import { cn } from "../../../lib/cn";
import type { RetirementReason } from "../../../types/enums";
import { Sheet } from "../../ui/Sheet";
import { Button } from "../../ui/Button";

const REASONS: { value: RetirementReason; label: string }[] = [
  { value: "injury", label: "Injury" },
  { value: "illness", label: "Illness" },
  { value: "emergency", label: "Emergency" },
  { value: "other", label: "Other" },
];

interface RetireHurtSheetProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: { playerId: string; reason: RetirementReason }) => void;
  batters: { id: string; name: string; onStrike?: boolean }[];
}

export function RetireHurtSheet({ open, onClose, onSubmit, batters }: RetireHurtSheetProps) {
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [reason, setReason] = useState<RetirementReason | null>(null);

  useEffect(() => {
    if (open) {
      setPlayerId(null);
      setReason(null);
    }
  }, [open]);

  return (
    <Sheet open={open} onClose={onClose} title="Retire hurt">
      <div className="space-y-4">
        <div className="space-y-1">
          {batters.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setPlayerId(b.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                playerId === b.id
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-line bg-elevated text-text active:bg-line",
              )}
            >
              <span className="min-w-0 flex-1 truncate font-semibold">{b.name}</span>
              {b.onStrike && <span className="text-[11px] text-text-faint">on strike</span>}
            </button>
          ))}
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-faint">
            Reason
          </p>
          <div className="flex flex-wrap gap-2">
            {REASONS.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setReason(r.value)}
                className={cn(
                  "h-9 rounded-full border px-3.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                  reason === r.value
                    ? "border-warn bg-warn-soft text-warn"
                    : "border-line bg-elevated text-text-dim active:bg-line",
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <Button
          size="lg"
          fullWidth
          disabled={!playerId || !reason}
          onClick={() => playerId && reason && onSubmit({ playerId, reason })}
        >
          Retire batter
        </Button>
        <p className="text-center text-[11px] leading-relaxed text-text-faint">
          The batter can return later. You'll pick a replacement next.
        </p>
      </div>
    </Sheet>
  );
}
