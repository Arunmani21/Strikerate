/** Balls bowled -> overs display, e.g. 37 -> "6.1" */
export function formatOvers(totalBalls: number): string {
  return `${Math.floor(totalBalls / 6)}.${totalBalls % 6}`;
}

/** Decimal overs like 3.1666 -> "3.1" (server sends overs as ball count / 6) */
export function oversFromDecimal(overs: number): string {
  const whole = Math.floor(overs);
  const part = Math.round((overs - whole) * 6);
  return part >= 6 ? `${whole + 1}.0` : `${whole}.${part}`;
}

export function formatDate(value?: string | Date | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/** Combine a date string (YYYY-MM-DD) and time string (HH:MM) into a readable slot */
export function formatMatchWhen(
  date?: string | null,
  time?: string | null,
): string {
  const parts: string[] = [];
  const d = formatDate(date);
  if (d) parts.push(d);
  if (time) parts.push(time);
  return parts.join(" · ");
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

export function twoDecimal(n: number | null | undefined): string {
  if (n === null || n === undefined || Number.isNaN(n)) return "0.00";
  return n.toFixed(2);
}

/** Server result strings embed raw ids ("Team <uuid> won by 5 runs") — swap in team names */
export function prettyResult(
  result: string,
  teamName: (teamId: string) => string,
): string {
  return result.replace(
    /Team\s+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/gi,
    (_, id: string) => teamName(id),
  );
}
