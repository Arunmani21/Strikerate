"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Roles = exports.ROLES_KEY = exports.TeamRole = exports.UserRole = void 0;
const common_1 = require("@nestjs/common");
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["USER"] = "user";
})(UserRole || (exports.UserRole = UserRole = {}));
var TeamRole;
(function (TeamRole) {
    TeamRole["CAPTAIN"] = "captain";
    TeamRole["VICE_CAPTAIN"] = "vice_captain";
    TeamRole["MANAGER"] = "manager";
    TeamRole["PLAYER"] = "player";
})(TeamRole || (exports.TeamRole = TeamRole = {}));
exports.ROLES_KEY = 'roles';
const Roles = (...roles) => (0, common_1.SetMetadata)(exports.ROLES_KEY, roles);
exports.Roles = Roles;
//# sourceMappingURL=roles.decorator.js.map