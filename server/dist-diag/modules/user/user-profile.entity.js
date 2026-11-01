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
exports.UserProfile = exports.BowlingStyle = exports.BattingStyle = exports.UserRole = void 0;
const typeorm_1 = require("typeorm");
var UserRole;
(function (UserRole) {
    UserRole["BATSMAN"] = "batsman";
    UserRole["BOWLER"] = "bowler";
    UserRole["ALLROUNDER"] = "allrounder";
    UserRole["KEEPER"] = "keeper";
})(UserRole || (exports.UserRole = UserRole = {}));
var BattingStyle;
(function (BattingStyle) {
    BattingStyle["RIGHT_HAND"] = "right_hand";
    BattingStyle["LEFT_HAND"] = "left_hand";
})(BattingStyle || (exports.BattingStyle = BattingStyle = {}));
var BowlingStyle;
(function (BowlingStyle) {
    BowlingStyle["RIGHT_ARM_FAST"] = "right_arm_fast";
    BowlingStyle["RIGHT_ARM_SPIN"] = "right_arm_spin";
    BowlingStyle["LEFT_ARM_FAST"] = "left_arm_fast";
    BowlingStyle["LEFT_ARM_SPIN"] = "left_arm_spin";
})(BowlingStyle || (exports.BowlingStyle = BowlingStyle = {}));
let UserProfile = class UserProfile {
};
exports.UserProfile = UserProfile;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UserProfile.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: UserRole,
        nullable: true,
    }),
    __metadata("design:type", String)
], UserProfile.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BattingStyle,
        nullable: true,
        name: 'batting_style',
    }),
    __metadata("design:type", String)
], UserProfile.prototype, "battingStyle", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: BowlingStyle,
        nullable: true,
        name: 'bowling_style',
    }),
    __metadata("design:type", String)
], UserProfile.prototype, "bowlingStyle", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'experience_years', nullable: true, type: 'integer' }),
    __metadata("design:type", Number)
], UserProfile.prototype, "experienceYears", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], UserProfile.prototype, "bio", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ name: 'created_at' }),
    __metadata("design:type", Date)
], UserProfile.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ name: 'user_id', unique: true, nullable: false }),
    __metadata("design:type", String)
], UserProfile.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.OneToOne)('User', 'profile'),
    (0, typeorm_1.JoinColumn)({ name: 'user_id' }),
    __metadata("design:type", Object)
], UserProfile.prototype, "user", void 0);
exports.UserProfile = UserProfile = __decorate([
    (0, typeorm_1.Entity)('user_profiles')
], UserProfile);
//# sourceMappingURL=user-profile.entity.js.map