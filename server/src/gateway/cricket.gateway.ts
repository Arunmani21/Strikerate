import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

/**
 * Cricket Gateway for Real-time Match Updates
 *
 * This gateway handles all real-time socket events for live cricket scoring,
 * including ball-by-ball updates, wickets, over completions, innings changes,
 * and match results.
 *
 * Events:
 * - Server → Client: ball-updated, wicket-fell, over-complete, innings-end, match-result
 * - Client → Server: join-match, leave-match
 */

@WebSocketGateway({
  cors: {
    origin: '*', // In production, specify your frontend URL
    credentials: true,
  },
  namespace: '/',
})
export class CricketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  /**
   * Handle client connection
   */
  async handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
    // You can emit a welcome message or perform initial setup here
  }

  /**
   * Handle client disconnection
   */
  async handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
    // Clean up any room memberships if needed
    const rooms = Array.from(client.rooms).filter(room => room.startsWith('match_'));
    rooms.forEach(room => client.leave(room));
  }

  /**
   * Join a specific match room to receive real-time updates
   * @param client Socket client
   * @param matchId Match ID to join
   */
  @SubscribeMessage('join-match')
  handleJoinMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() matchId: string,
  ) {
    const roomName = `match_${matchId}`;
    client.join(roomName);
    console.log(`Client ${client.id} joined room: ${roomName}`);

    // Confirm successful join
    client.emit('joined-match', {
      success: true,
      matchId,
      message: `Successfully joined match ${matchId}`,
    });
  }

  /**
   * Leave a specific match room
   * @param client Socket client
   * @param matchId Match ID to leave
   */
  @SubscribeMessage('leave-match')
  handleLeaveMatch(
    @ConnectedSocket() client: Socket,
    @MessageBody() matchId: string,
  ) {
    const roomName = `match_${matchId}`;
    client.leave(roomName);
    console.log(`Client ${client.id} left room: ${roomName}`);

    // Confirm successful leave
    client.emit('left-match', {
      success: true,
      matchId,
      message: `Successfully left match ${matchId}`,
    });
  }

  /**
   * Emit ball-by-ball update to all clients in a match room
   * Called after every ball delivery
   */
  emitBallUpdated(matchId: string, data: {
    overNumber: number;
    ballNumber: number;
    totalRuns: number;
    totalWickets: number;
    currentOvers: number;
    currentRunRate: number;
    requiredRunRate?: number; // Only in 2nd innings
    target?: number; // Only in 2nd innings
    striker: {
      id: string;
      name: string;
      runs: number;
      balls: number;
      fours: number;
      sixes: number;
      strikeRate: number;
    };
    nonStriker: {
      id: string;
      name: string;
      runs: number;
      balls: number;
      fours: number;
      sixes: number;
      strikeRate: number;
    };
    bowler: {
      id: string;
      name: string;
      /** Cricket overs notation, e.g. "1.3" for 9 legal balls */
      overs: string;
      runs: number;
      wickets: number;
      economy: number;
    };
    extras: number;
    lastBall: string;
  }) {
    this.server.to(`match_${matchId}`).emit('ball-updated', {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit wicket event to all clients in a match room
   * Called when a wicket falls
   */
  emitWicket(matchId: string, data: {
    dismissedPlayer: {
      id: string;
      name: string;
      runs: number;
      balls: number;
      fours: number;
      sixes: number;
    };
    wicketType: string;
    wicketNumber: number;
    totalWickets: number;
    totalRuns: number;
    currentOvers: number;
  }) {
    this.server.to(`match_${matchId}`).emit('wicket-fell', {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit over completion event to all clients in a match room
   * Called after every 6 legal balls
   */
  emitOverComplete(matchId: string, data: {
    overNumber: number;
    overRuns: number;
    totalRuns: number;
    totalWickets: number;
    currentOvers: number;
    currentRunRate: number;
    requiredRunRate?: number;
    target?: number;
    bowlerSummary: {
      bowlerName: string;
      /** Cricket overs notation, e.g. "1.3" for 9 legal balls */
      overs: string;
      runs: number;
      wickets: number;
      maidens: number;
      economy: number;
    };
  }) {
    this.server.to(`match_${matchId}`).emit('over-complete', {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit innings end event to all clients in a match room
   * Called when an innings completes (10 wickets or overs complete)
   */
  emitInningsEnd(matchId: string, data: {
    inningsNumber: number;
    totalRuns: number;
    totalWickets: number;
    totalOvers: number;
    target?: number; // Only for 1st innings completion
    battingTeam: {
      id: string;
      name: string;
    };
    bowlingTeam: {
      id: string;
      name: string;
    };
  }) {
    this.server.to(`match_${matchId}`).emit('innings-end', {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit match result event to all clients in a match room
   * Called when match completes
   */
  emitMatchResult(matchId: string, data: {
    result: string;
    winningTeam?: {
      id: string;
      name: string;
    };
    margin?: string;
    teamAScore: {
      teamName: string;
      runs: number;
      wickets: number;
      overs: number;
    };
    teamBScore: {
      teamName: string;
      runs: number;
      wickets: number;
      overs: number;
    };
    playerOfMatch?: {
      id: string;
      name: string;
    };
  }) {
    this.server.to(`match_${matchId}`).emit('match-result', {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit match started event
   * Called when match status changes to 'live'
   */
  emitMatchStarted(matchId: string, data: {
    matchId: string;
    teamA: { id: string; name: string };
    teamB: { id: string; name: string };
    totalOvers: number;
    venue: string;
  }) {
    this.server.to(`match_${matchId}`).emit('match-started', {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit toss result event
   * Called when toss is completed
   */
  emitTossResult(matchId: string, data: {
    tossWinner: { id: string; name: string };
    tossChoice: 'bat' | 'bowl';
    teamA: { id: string; name: string };
    teamB: { id: string; name: string };
  }) {
    this.server.to(`match_${matchId}`).emit('toss-result', {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit playing 11 updated event
   * Called when either team submits their playing 11
   */
  emitPlaying11Updated(matchId: string, data: {
    teamId: string;
    teamName: string;
    players: Array<{
      id: string;
      name: string;
      jerseyNumber?: number;
    }>;
  }) {
    this.server.to(`match_${matchId}`).emit('playing11-updated', {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Emit error event to match room
   * Used for broadcasting validation errors or important notifications
   */
  emitError(matchId: string, error: {
    message: string;
    code?: string;
    details?: any;
  }) {
    this.server.to(`match_${matchId}`).emit('error', {
      success: false,
      error,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Get number of clients currently watching a match
   * Useful for analytics
   */
  getMatchViewers(matchId: string): number {
    const roomName = `match_${matchId}`;
    const room = this.server.sockets.adapter.rooms.get(roomName);
    return room ? room.size : 0;
  }
}