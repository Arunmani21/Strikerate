import type { ReactNode } from "react";
import { CloudOff, Equal, Handshake, Trophy } from "lucide-react";

import { prettyResult } from "../../../lib/format";
import type { Match } from "../../../types/match";
import { Card } from "../../ui/Card";

const ABANDON_REASON: Record<string, string> = {
  rain: "Rain",
  bad_light: "Bad light",
  pitch_conditions: "Pitch conditions",
  crowd_trouble: "Crowd trouble",
  security: "Security",
  other: "Other",
};

/** Terminal-outcome card: winner / tied / abandoned / draw, per match status */
export function ResultBanner({ match, footer }: { match: Match; footer?: ReactNode }) {
  const teamName = (teamId: string | null) =>
    teamId === match.teamAId
      ? (match.teamA?.name ?? "Team A")
      : teamId === match.teamBId
        ? (match.teamB?.name ?? "Team B")
        : "Unknown team";

  const prettified = match.result ? prettyResult(match.result, teamName) : null;
  const winnerName = match.winningTeamId ? teamName(match.winningTeamId) : null;

  if (match.status === "tied") {
    return (
      <Card className="border-gold/40 bg-gold-soft">
        <div className="flex items-center gap-2">
          <Equal className="size-5 text-gold" />
          <span className="font-display text-lg font-bold uppercase tracking-wide">
            Match tied
          </span>
        </div>
        {prettified && <p className="mt-1 text-sm text-text-dim">{prettified}</p>}
        {footer && <div className="mt-3">{footer}</div>}
      </Card>
    );
  }

  if (match.status === "abandoned" || match.status === "no_result") {
    return (
      <Card>
        <div className="flex items-center gap-2">
          <CloudOff className="size-5 text-warn" />
          <span className="font-display text-lg font-bold uppercase tracking-wide">
            No result
          </span>
        </div>
        <p className="mt-1 text-sm text-text-dim">
          Match abandoned
          {match.abandonmentReason ? ` — ${ABANDON_REASON[match.abandonmentReason] ?? match.abandonmentReason}` : ""}
          {match.result ? ` · ${prettified}` : ""}
        </p>
        {footer && <div className="mt-3">{footer}</div>}
      </Card>
    );
  }

  if (match.status === "draw") {
    return (
      <Card>
        <div className="flex items-center gap-2">
          <Handshake className="size-5 text-text-dim" />
          <span className="font-display text-lg font-bold uppercase tracking-wide">
            Match drawn
          </span>
        </div>
        {(prettified || match.result) && (
          <p className="mt-1 text-sm text-text-dim">{prettified ?? match.result}</p>
        )}
        {footer && <div className="mt-3">{footer}</div>}
      </Card>
    );
  }

  // completed
  return (
    <Card className="border-accent/40 bg-accent-soft">
      <div className="flex items-center gap-2">
        <Trophy className="size-5 text-accent" />
        <span className="font-display text-xl font-bold uppercase tracking-wide">
          {winnerName ?? "Result"}
        </span>
      </div>
      {prettified && (
        <p className="mt-1 text-sm text-text-dim">
          {prettified}
          {match.marginType === "super over" ? " (super over)" : ""}
        </p>
      )}
      {footer && <div className="mt-3">{footer}</div>}
    </Card>
  );
}
