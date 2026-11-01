import { cn } from "../../../lib/cn";
import { initials } from "../../../lib/format";
import { Sheet } from "../../ui/Sheet";

export interface PickerOption {
  id: string;
  name: string;
  note?: string;
  disabled?: boolean;
}

interface PlayerPickerSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  hint?: string;
  players: PickerOption[];
  onSelect: (player: { id: string; name: string }) => void;
}

export function PlayerPickerSheet({
  open,
  onClose,
  title,
  hint,
  players,
  onSelect,
}: PlayerPickerSheetProps) {
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      {hint && <p className="-mt-1 pb-2 text-xs leading-relaxed text-text-dim">{hint}</p>}
      <div className="max-h-[52vh] space-y-1 overflow-y-auto">
        {players.length === 0 && (
          <p className="py-6 text-center text-sm text-text-faint">No players available</p>
        )}
        {players.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={p.disabled}
            onClick={() => onSelect({ id: p.id, name: p.name })}
            className={cn(
              "flex w-full items-center gap-3 rounded-md border border-line bg-elevated px-3 py-2.5 text-left active:bg-line",
              p.disabled && "pointer-events-none opacity-40",
            )}
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface font-display text-xs font-bold text-text-dim">
              {initials(p.name)}
            </span>
            <span className="min-w-0 flex-1 truncate text-sm font-semibold">{p.name}</span>
            {p.note && <span className="shrink-0 text-[11px] text-text-faint tnum">{p.note}</span>}
          </button>
        ))}
      </div>
    </Sheet>
  );
}
