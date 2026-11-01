import type { BattingRow } from "../../../lib/scoring";

interface BatsmenStripProps {
  rows: BattingRow[];
  strikerId?: string | null;
  nonStrikerId?: string | null;
}

export function BatsmenStrip({ rows, strikerId, nonStrikerId }: BatsmenStripProps) {
  const atCrease = [
    { id: strikerId, onStrike: true },
    { id: nonStrikerId, onStrike: false },
  ].filter((e): e is { id: string; onStrike: boolean } => Boolean(e.id));

  if (!atCrease.length) return null;

  return (
    <div className="overflow-hidden rounded-lg border border-line bg-surface">
      {atCrease.map((entry) => {
        const row = rows.find((r) => r.id === entry.id);
        return (
          <div
            key={entry.id}
            className="flex items-center gap-3 border-b border-line-soft px-4 py-2.5 last:border-b-0"
          >
            <p className="min-w-0 flex-1 truncate text-sm font-semibold">
              {row?.name ?? "—"}
              {entry.onStrike && <span className="ml-1 text-accent">*</span>}
            </p>
            <p className="text-sm tnum">
              <span className="font-display font-bold">{row?.runs ?? 0}</span>
              <span className="text-text-faint"> ({row?.balls ?? 0})</span>
            </p>
            <p className="w-16 text-right text-xs text-text-dim tnum">SR {row?.sr ?? "0.00"}</p>
          </div>
        );
      })}
    </div>
  );
}
