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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayerAvailability = void 0;
const typeorm_1 = require("typeorm");
const player_entity_1 = require("./player.entity");
let PlayerAvailability = class PlayerAvailability {
};
exports.PlayerAvailability = PlayerAvailability;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PlayerAvailability.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'available_date', type: 'date' }),
    __metadata("design:type", Date)
], PlayerAvailability.prototype, "availableDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'is_available', default: true }),
    __metadata("design:type", Boolean)
], PlayerAvailability.prototype, "isAvailable", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], PlayerAvailability.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'player_id', nullable: false }),
    __metadata("design:type", String)
], PlayerAvailability.prototype, "playerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => player_entity_1.Player, (player) => player.availabilities, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'player_id' }),
    __metadata("design:type", player_entity_1.Player)
], PlayerAvailability.prototype, "player", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', nullable: true }),
    __metadata("design:type", String)
], PlayerAvailability.prototype, "userId", void 0);
exports.PlayerAvailability = PlayerAvailability = __decorate([
    (0, typeorm_1.Entity)('player_availability'),
    (0, typeorm_1.Unique)(['playerId', 'availableDate']),
    (0, typeorm_1.Index)(['playerId']),
    (0, typeorm_1.Index)(['availableDate'])
], PlayerAvailability);
//# sourceMappingURL=player-availability.entity.js.map