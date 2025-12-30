import { Injectable } from "@nestjs/common";

interface GameState {
  coins: number;
  clickPower: number;
  incomePerSec: number;
  lastUpdate: number;
}

@Injectable()
export class GameService {
  private users = new Map<number, GameState>();

  getState(userId: number): GameState {
    if (!this.users.has(userId)) {
      this.users.set(userId, {
        coins: 0,
        clickPower: 1,
        incomePerSec: 1,
        lastUpdate: Date.now()
      });
    }

    const state = this.users.get(userId)!;
    this.applyIdle(state);
    return state;
  }

  click(userId: number) {
    const state = this.getState(userId);
    state.coins += state.clickPower;
  }

  buyClick(userId: number) {
    const state = this.getState(userId);
    const price = state.clickPower * 10;
    if (state.coins >= price) {
      state.coins -= price;
      state.clickPower += 1;
    }
  }

  private applyIdle(state: GameState) {
    const now = Date.now();
    const deltaSec = Math.floor((now - state.lastUpdate) / 1000);
    if (deltaSec > 0) {
      state.coins += deltaSec * state.incomePerSec;
      state.lastUpdate = now;
    }
  }
}
