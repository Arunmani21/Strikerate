import type { BowlingRow } from "../../../lib/scoring";

export function BowlerStrip({ row }: { row: BowlingRow | null }) {
  if (!row) return null;
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-2.5">
      <p className="min-w-0 flex-1 truncate text-sm font-semibold">{row.name}</p>
      <p className="text-xs text-text-dim tnum">{row.oversText} ov</p>
      <p className="text-sm tnum">
        <span className="font-display font-bold">{row.wickets}</span>
        <span className="text-text-faint">/{row.runs}</span>
      </p>
      <p className="w-16 text-right text-xs text-text-dim tnum">Econ {row.econ}</p>
    </div>
  );
}
