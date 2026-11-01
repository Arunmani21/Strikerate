import { useEffect, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import type { Socket } from "socket.io-client";

import { getSocket } from "../lib/socket";
import { qk } from "../lib/queryKeys";
import { toast } from "../stores/toast.store";
import type {
  BallUpdatedData,
  InningsEndData,
  MatchResultData,
  OverCompleteData,
  SocketEventEnvelope,
  WicketFellData,
} from "../types/scoring";

export interface MatchSocketState {
  lastBall: BallUpdatedData | null;
  connected: boolean;
}

/**
 * Joins the match room and pipes server events into the react-query cache.
 * ball-updated also updates the `live` key so headers render instantly.
 * Striker/nonStriker stats in ball-updated are unreliable — consumers should
 * hydrate names from the scorecard, which is invalidated on every event.
 */
export function useMatchSocket(matchId: string): MatchSocketState {
  const queryClient = useQueryClient();
  const [lastBall, setLastBall] = useState<BallUpdatedData | null>(null);
  const [connected, setConnected] = useState(false);

  const stableMatchId = useRef(matchId);
  stableMatchId.current = matchId;

  useEffect(() => {
    if (!matchId) return;
    const socket: Socket = getSocket();

    const onBallUpdated = (env: SocketEventEnvelope<BallUpdatedData>) => {
      setLastBall(env.data);
      queryClient.setQueryData(qk.live(stableMatchId.current), env.data);
      queryClient.invalidateQueries({ queryKey: qk.scorecard(stableMatchId.current) });
      queryClient.invalidateQueries({ queryKey: qk.inningsByMatch(stableMatchId.current) });
      queryClient.invalidateQueries({ queryKey: qk.match(stableMatchId.current) });
    };
    const onWicketFell = (env: SocketEventEnvelope<WicketFellData>) => {
      toast.error(`WICKET! ${env.data.dismissedPlayer.name} — ${env.data.wicketType.replaceAll("_", " ")}`);
      queryClient.invalidateQueries({ queryKey: qk.scorecard(stableMatchId.current) });
    };
    const onOverComplete = (env: SocketEventEnvelope<OverCompleteData>) => {
      void env;
      queryClient.invalidateQueries({ queryKey: qk.scorecard(stableMatchId.current) });
    };
    const onInningsEnd = (env: SocketEventEnvelope<InningsEndData>) => {
      toast.info(`End of innings ${env.data.inningsNumber} — ${env.data.totalRuns}/${env.data.totalWickets}`);
      queryClient.invalidateQueries({ queryKey: qk.match(stableMatchId.current) });
      queryClient.invalidateQueries({ queryKey: qk.inningsByMatch(stableMatchId.current) });
      queryClient.invalidateQueries({ queryKey: qk.scorecard(stableMatchId.current) });
      queryClient.invalidateQueries({ queryKey: qk.matchesByStatus("live") });
    };
    const onMatchResult = (env: SocketEventEnvelope<MatchResultData>) => {
      toast.success(env.data.result);
      queryClient.invalidateQueries({ queryKey: qk.match(stableMatchId.current) });
      queryClient.invalidateQueries({ queryKey: qk.scorecard(stableMatchId.current) });
      queryClient.invalidateQueries({ queryKey: qk.matchesByStatus("live") });
      queryClient.invalidateQueries({ queryKey: qk.matchesByStatus("completed") });
    };
    const onConnect = () => {
      setConnected(true);
      socket.emit("join-match", stableMatchId.current);
    };
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("ball-updated", onBallUpdated);
    socket.on("wicket-fell", onWicketFell);
    socket.on("over-complete", onOverComplete);
    socket.on("innings-end", onInningsEnd);
    socket.on("match-result", onMatchResult);

    if (socket.connected) {
      setConnected(true);
      socket.emit("join-match", matchId);
    } else {
      socket.connect();
    }

    return () => {
      if (socket.connected) socket.emit("leave-match", stableMatchId.current);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("ball-updated", onBallUpdated);
      socket.off("wicket-fell", onWicketFell);
      socket.off("over-complete", onOverComplete);
      socket.off("innings-end", onInningsEnd);
      socket.off("match-result", onMatchResult);
    };
  }, [matchId, queryClient]);

  return { lastBall, connected };
}
