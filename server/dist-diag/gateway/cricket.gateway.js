"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CricketGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
let CricketGateway = class CricketGateway {
    async handleConnection(client) {
        console.log(`Client connected: ${client.id}`);
    }
    async handleDisconnect(client) {
        console.log(`Client disconnected: ${client.id}`);
        const rooms = Array.from(client.rooms).filter(room => room.startsWith('match_'));
        rooms.forEach(room => client.leave(room));
    }
    handleJoinMatch(client, matchId) {
        const roomName = `match_${matchId}`;
        client.join(roomName);
        console.log(`Client ${client.id} joined room: ${roomName}`);
        client.emit('joined-match', {
            success: true,
            matchId,
            message: `Successfully joined match ${matchId}`,
        });
    }
    handleLeaveMatch(client, matchId) {
        const roomName = `match_${matchId}`;
        client.leave(roomName);
        console.log(`Client ${client.id} left room: ${roomName}`);
        client.emit('left-match', {
            success: true,
            matchId,
            message: `Successfully left match ${matchId}`,
        });
    }
    emitBallUpdated(matchId, data) {
        this.server.to(`match_${matchId}`).emit('ball-updated', {
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    }
    emitWicket(matchId, data) {
        this.server.to(`match_${matchId}`).emit('wicket-fell', {
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    }
    emitOverComplete(matchId, data) {
        this.server.to(`match_${matchId}`).emit('over-complete', {
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    }
    emitInningsEnd(matchId, data) {
        this.server.to(`match_${matchId}`).emit('innings-end', {
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    }
    emitMatchResult(matchId, data) {
        this.server.to(`match_${matchId}`).emit('match-result', {
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    }
    emitMatchStarted(matchId, data) {
        this.server.to(`match_${matchId}`).emit('match-started', {
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    }
    emitTossResult(matchId, data) {
        this.server.to(`match_${matchId}`).emit('toss-result', {
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    }
    emitPlaying11Updated(matchId, data) {
        this.server.to(`match_${matchId}`).emit('playing11-updated', {
            success: true,
            data,
            timestamp: new Date().toISOString(),
        });
    }
    emitError(matchId, error) {
        this.server.to(`match_${matchId}`).emit('error', {
            success: false,
            error,
            timestamp: new Date().toISOString(),
        });
    }
    getMatchViewers(matchId) {
        const roomName = `match_${matchId}`;
        const room = this.server.sockets.adapter.rooms.get(roomName);
        return room ? room.size : 0;
    }
};
exports.CricketGateway = CricketGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], CricketGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('join-match'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], CricketGateway.prototype, "handleJoinMatch", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leave-match'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], CricketGateway.prototype, "handleLeaveMatch", null);
exports.CricketGateway = CricketGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: '*',
            credentials: true,
        },
        namespace: '/',
    })
], CricketGateway);
//# sourceMappingURL=cricket.gateway.js.map