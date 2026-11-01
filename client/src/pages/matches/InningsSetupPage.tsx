import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router";

import { inningsApi } from "../../api/innings.api";
import { matchesApi } from "../../api/matches.api";
import { playing11Api } from "../../api/playing11.api";
import { errorMessage } from "../../lib/api";
import { qk } from "../../lib/queryKeys";
import { toast } from "../../stores/toast.store";
import { Screen } from "../../layouts/Screen";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Field } from "../../components/ui/Field";
import { FullScreenSpinner } from "../../components/ui/Spinner";
import { PageError } from "../../components/ui/PageError";
import { Select } from "../../components/ui/Select";

export function InningsSetupPage() {
  const { id: matchId = "" } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [strikerId, setStrikerId] = useState("");
  const [nonStrikerId, setNonStrikerId] = useState("");
  const [bowlerId, setBowlerId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const matchQ = useQuery({ queryKey: qk.match(matchId), queryFn: () => matchesApi.get(matchId) });
  const match = matchQ.data;

  const xiAQ = useQuery({
    queryKey: qk.playing11(matchId, match?.teamAId ?? ""),
    queryFn: () => playing11Api.get(matchId, match!.teamAId),
    enabled: Boolean(match),
  });
  const xiBQ = useQuery({
    queryKey: qk.playing11(matchId, match?.teamBId ?? ""),
    queryFn: () => playing11Api.get(matchId, match!.teamBId),
    enabled: Boolean(match),
  });
  const inningsQ = useQuery({
    queryKey: qk.inningsByMatch(matchId),
    queryFn: () => inningsApi.byMatch(matchId),
  });

  if (matchQ.isPending) return <FullScreenSpinner />;
  if (matchQ.isError || !match)
    return (
      <Screen title="Start innings" backTo={`/matches/${matchId}`}>
        <PageError error={matchQ.error} onRetry={matchQ.refetch} />
      </Screen>
    );

  const teamName = (teamId: string) =>
    teamId === match.teamAId
      ? (match.teamA?.name ?? "Team A")
      : (match.teamB?.name ?? "Team B");

  if (!match.tossWinnerId || !match.tossChoice) {
    return (
      <Screen title="Start innings" backTo={`/matches/${matchId}`}>
        <Card>
          <p className="text-sm text-text-dim">
            The toss hasn't been recorded for this match yet.
          </p>
        </Card>
      </Screen>
    );
  }

  const otherTeamId =
    match.tossWinnerId === match.teamAId ? match.teamBId : match.teamAId;
  const battingTeamId = match.tossChoice === "bat" ? match.tossWinnerId : otherTeamId;
  const bowlingTeamId = battingTeamId === match.teamAId ? match.teamBId : match.teamAId;

  const battingXI = (battingTeamId === match.teamAId ? xiAQ.data : xiBQ.data) ?? [];
  const bowlingXI = (bowlingTeamId === match.teamAId ? xiAQ.data : xiBQ.data) ?? [];
  const inningsNumber = (inningsQ.data?.length ?? 0) + 1;

  const ready =
    Boolean(strikerId && nonStrikerId && bowlerId) && strikerId !== nonStrikerId;

  const start = async () => {
    setError(null);
    try {
      const innings = await inningsApi.start(matchId, {
        battingTeamId,
        bowlingTeamId,
        inningsNumber,
      });
      await inningsApi.setBatsmen(innings.id, strikerId, nonStrikerId);
      await inningsApi.setBowler(innings.id, bowlerId);

      queryClient.invalidateQueries({ queryKey: qk.match(matchId) });
      queryClient.invalidateQueries({ queryKey: qk.inningsByMatch(matchId) });
      queryClient.invalidateQueries({ queryKey: ["matches"] });

      toast.success(`Innings ${inningsNumber} underway — match is live`);
      navigate(`/matches/${matchId}`);
    } catch (e) {
      setError(errorMessage(e));
    }
  };

  return (
    <Screen title="Start innings" backTo={`/matches/${matchId}`}>
      <div className="space-y-4">
        {error && (
          <div className="rounded-md border border-wicket/40 bg-wicket-soft px-3 py-2.5 text-sm text-wicket">
            {error}
          </div>
        )}

        <Card>
          <p className="text-[11px] font-semibold uppercase tracking-wider text-text-faint">
            Innings {inningsNumber}
          </p>
          <p className="mt-0.5 font-display text-base font-bold">
            {teamName(battingTeamId)}{" "}
            <span className="text-text-faint">bat first</span>
          </p>
          <p className="mt-1 text-xs text-text-dim">
            {teamName(bowlingTeamId)} bowling · {match.totalOvers} overs
          </p>
        </Card>

        <Card className="space-y-3">
          <Field label="Striker">
            <Select value={strikerId} onChange={(e) => setStrikerId(e.target.value)}>
              <option value="">Select opener</option>
              {battingXI.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Non-striker" error={strikerId && nonStrikerId === strikerId ? "Must differ from the striker" : undefined}>
            <Select value={nonStrikerId} onChange={(e) => setNonStrikerId(e.target.value)}>
              <option value="">Select opener</option>
              {battingXI
                .filter((p) => p.id !== strikerId)
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </Select>
          </Field>

          <Field label="Opening bowler">
            <Select value={bowlerId} onChange={(e) => setBowlerId(e.target.value)}>
              <option value="">Select bowler</option>
              {bowlingXI.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
        </Card>

        {battingXI.length < 11 || bowlingXI.length < 11 ? (
          <Card>
            <p className="text-xs leading-relaxed text-text-dim">
              Both teams need a saved playing XI (11 each) before the innings can start.
            </p>
          </Card>
        ) : null}

        <Button
          size="lg"
          fullWidth
          disabled={!ready || battingXI.length < 11 || bowlingXI.length < 11}
          onClick={() => void start()}
        >
          Start innings
        </Button>
      </div>
    </Screen>
  );
}
