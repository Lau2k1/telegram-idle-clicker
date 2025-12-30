"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GameService = void 0;
const common_1 = require("@nestjs/common");
let GameService = class GameService {
    constructor() {
        this.users = new Map();
    }
    getState(userId) {
        if (!this.users.has(userId)) {
            this.users.set(userId, {
                coins: 0,
                clickPower: 1,
                incomePerSec: 1,
                lastUpdate: Date.now()
            });
        }
        const state = this.users.get(userId);
        this.applyIdle(state);
        return state;
    }
    click(userId) {
        const state = this.getState(userId);
        state.coins += state.clickPower;
    }
    buyClick(userId) {
        const state = this.getState(userId);
        const price = state.clickPower * 10;
        if (state.coins >= price) {
            state.coins -= price;
            state.clickPower += 1;
        }
    }
    applyIdle(state) {
        const now = Date.now();
        const deltaSec = Math.floor((now - state.lastUpdate) / 1000);
        if (deltaSec > 0) {
            state.coins += deltaSec * state.incomePerSec;
            state.lastUpdate = now;
        }
    }
};
exports.GameService = GameService;
exports.GameService = GameService = __decorate([
    (0, common_1.Injectable)()
], GameService);
//# sourceMappingURL=game.service.js.map