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
exports.GameController = void 0;
const common_1 = require("@nestjs/common");
const game_service_1 = require("./game.service");
function getUserId(initData) {
    if (!initData || initData.trim().length === 0) {
        return 1;
    }
    try {
        const params = new URLSearchParams(initData);
        const userRaw = params.get("user");
        if (!userRaw) {
            return 1;
        }
        const user = JSON.parse(userRaw);
        if (!user || typeof user.id !== "number") {
            return 1;
        }
        return user.id;
    }
    catch (e) {
        console.error("initData parse error", e);
        return 1;
    }
}
let GameController = class GameController {
    constructor(game) {
        this.game = game;
    }
    getState(initData) {
        const userId = getUserId(initData);
        return this.game.getState(userId);
    }
    click(initData) {
        const userId = getUserId(initData);
        this.game.click(userId);
        return { ok: true };
    }
    buy(initData) {
        const userId = getUserId(initData);
        this.game.buyClick(userId);
        return { ok: true };
    }
};
exports.GameController = GameController;
__decorate([
    (0, common_1.Get)("state"),
    __param(0, (0, common_1.Headers)("x-telegram-initdata")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "getState", null);
__decorate([
    (0, common_1.Post)("click"),
    __param(0, (0, common_1.Headers)("x-telegram-initdata")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "click", null);
__decorate([
    (0, common_1.Post)("buy-click"),
    __param(0, (0, common_1.Headers)("x-telegram-initdata")),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], GameController.prototype, "buy", null);
exports.GameController = GameController = __decorate([
    (0, common_1.Controller)("game"),
    __metadata("design:paramtypes", [game_service_1.GameService])
], GameController);
//# sourceMappingURL=game.controller.js.map