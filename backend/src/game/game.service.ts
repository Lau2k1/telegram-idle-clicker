import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma.service";

interface GameState {
  coins: number;
  clickPower: number;
  incomePerSec: number;
  lastUpdate: number;
}

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {} // Внедряем базу

  async getState(telegramId: number) {
    let user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) }
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { telegramId: BigInt(telegramId) }
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
