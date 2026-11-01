import { cn } from "../../../lib/cn";

interface ScoreHeaderProps {
  teamName: string;
  runs: number;
  wickets: number;
  oversText: string;
  crr: string;
  rrr?: string | null;
  targetNote?: string | null;
  chaseLine?: string | null;
  connected?: boolean;
}

export function ScoreHeader({
  teamName,
  runs,
  wickets,
  oversText,
  crr,
  rrr,
  targetNote,
  chaseLine,
  connected,
}: ScoreHeaderProps) {
  return (
    <section className="rounded-lg border border-line bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate font-display text-sm font-bold uppercase tracking-wider text-text-dim">
          {teamName}
        </p>
        {connected != null && (
          <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-text-faint">
            <span
              className={cn(
                "size-1.5 rounded-full",
                connected ? "animate-pulse bg-accent" : "bg-wicket",
              )}
            />
            {connected ? "Live" : "Offline"}
          </span>
        )}
      </div>

      <div className="mt-1 flex items-end gap-2">
        <p className="font-display text-4xl font-bold leading-none tnum">
          {runs}
          <span className="text-text-faint">/{wickets}</span>
        </p>
        <p className="pb-0.5 text-sm text-text-dim tnum">({oversText})</p>
      </div>

      <div className="mt-3 flex gap-2">
        <MiniTile label="CRR" value={crr} />
        {rrr && <MiniTile label="RRR" value={rrr} tone="text-warn" />}
        {targetNote && <MiniTile label="Target" value={targetNote.replace("Target ", "")} tone="text-accent" />}
      </div>

      {chaseLine && (
        <p className="mt-3 rounded-md bg-accent-soft px-3 py-2 text-center font-display text-sm font-bold uppercase tracking-wide text-accent">
          {chaseLine}
        </p>
      )}
    </section>
  );
}

function MiniTile({ label, value, tone = "text-text" }: { label: string; value: string; tone?: string }) {
  return (
    <div className="flex-1 rounded-md border border-line-soft bg-elevated px-3 py-2">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-text-faint">{label}</p>
      <p className={cn("mt-0.5 font-display text-base font-bold leading-none tnum", tone)}>{value}</p>
    </div>
  );
}
