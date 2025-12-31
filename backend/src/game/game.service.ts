import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async getState(telegramId: number) {
    let user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId: BigInt(telegramId),
          coins: 0,
          clickPower: 1,
          incomePerSec: 0, // Установим 0 по умолчанию
        },
      });
    }

    return this.applyIdle(user);
  }

  async click(telegramId: number) {
    const user = await this.getState(telegramId);
    
    // Прямое обновление в базе через метод update
    return await this.prisma.user.update({
      where: { telegramId: BigInt(telegramId) },
      data: {
        coins: { increment: user.clickPower },
      },
    });
  }

  async buyClick(telegramId: number) {
    const user = await this.getState(telegramId);
    const price = user.clickPower * 10;

    if (user.coins >= price) {
      return await this.prisma.user.update({
        where: { telegramId: BigInt(telegramId) },
        data: {
          coins: { decrement: price },
          clickPower: { increment: 1 },
        },
      });
    }
    return null; // Возвращаем null, если денег не хватило
  }

  private async applyIdle(user: any) {
    const now = new Date();
    const lastUpdate = new Date(user.lastUpdate);
    const deltaSec = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

    if (deltaSec > 0 && user.incomePerSec > 0) {
      const idleCoins = deltaSec * user.incomePerSec;
      return await this.prisma.user.update({
        where: { id: user.id },
        data: {
          coins: { increment: idleCoins },
          lastUpdate: now,
        },
      });
    }
    return user;
  }
}