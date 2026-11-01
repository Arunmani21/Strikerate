import { useEffect, useState } from "react";
import { cn } from "../../../lib/cn";
import type { DismissalType } from "../../../types/enums";
import { Sheet } from "../../ui/Sheet";
import { Button } from "../../ui/Button";

const WICKET_TYPES: { value: DismissalType; label: string }[] = [
  { value: "bowled", label: "Bowled" },
  { value: "caught", label: "Caught" },
  { value: "lbw", label: "LBW" },
  { value: "runout", label: "Run out" },
  { value: "stumped", label: "Stumped" },
  { value: "caught_and_bowled", label: "C & B" },
  { value: "hit_wicket", label: "Hit wicket" },
];

interface WicketDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (input: {
    wicketType: DismissalType;
    dismissedPlayerId?: string;
    runs: number;
  }) => void;
  submitting?: boolean;
  /** Batting-side players — run-outs need the victim */
  players: { id: string; name: string }[];
  strikerId?: string | null;
  nonStrikerId?: string | null;
}

export function WicketDialog({
  open,
  onClose,
  onSubmit,
  submitting,
  players,
  strikerId,
  nonStrikerId,
}: WicketDialogProps) {
  const [wicketType, setWicketType] = useState<DismissalType | null>(null);
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [runs, setRuns] = useState(0);

  useEffect(() => {
    if (open) {
      setWicketType(null);
      setDismissedId(null);
      setRuns(0);
    }
  }, [open]);

  const needVictim = wicketType === "runout";
  const canConfirm = Boolean(wicketType) && (!needVictim || Boolean(dismissedId));

  return (
    <Sheet open={open} onClose={onClose} title="Wicket">
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {WICKET_TYPES.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => {
                setWicketType(t.value);
                setDismissedId(null);
              }}
              className={cn(
                "h-9 rounded-full border px-3.5 text-xs font-semibold uppercase tracking-wide transition-colors",
                wicketType === t.value
                  ? "border-wicket bg-wicket-soft text-wicket"
                  : "border-line bg-elevated text-text-dim active:bg-line",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {needVictim && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-faint">
              Who is out
            </p>
            <div className="max-h-44 space-y-1 overflow-y-auto">
              {players.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setDismissedId(p.id)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md border px-3 py-2.5 text-left text-sm transition-colors",
                    dismissedId === p.id
                      ? "border-wicket bg-wicket-soft text-wicket"
                      : "border-line bg-elevated text-text active:bg-line",
                  )}
                >
                  <span className="min-w-0 flex-1 truncate font-medium">{p.name}</span>
                  <span className="text-[11px] text-text-faint">
                    {p.id === strikerId
                      ? "striker"
                      : p.id === nonStrikerId
                        ? "non-striker"
                        : "substitute"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-text-faint">
            Runs off the bat
          </p>
          <div className="grid grid-cols-7 gap-1.5">
            {[0, 1, 2, 3, 4, 5, 6].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRuns(n)}
                className={cn(
                  "h-10 rounded-md border font-display text-base font-bold tnum transition-colors",
                  runs === n
                    ? "border-accent bg-accent-soft text-accent"
                    : "border-line bg-elevated text-text-dim active:bg-line",
                )}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <Button
          variant="danger"
          size="lg"
          fullWidth
          disabled={!canConfirm}
          loading={submitting}
          onClick={() =>
            wicketType &&
            onSubmit({
              wicketType,
              dismissedPlayerId: needVictim ? (dismissedId ?? undefined) : undefined,
              runs,
            })
          }
        >
          Confirm wicket
        </Button>
      </div>
    </Sheet>
  );
}
