import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async getState(telegramId: number) {
    try {
      const tid = BigInt(telegramId);
      let user = await this.prisma.user.findUnique({
        where: { telegramId: tid },
      });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            telegramId: tid,
            coins: 0,
            clickPower: 1,
            incomePerSec: 0,
          },
        });
      }

      const updatedUser = await this.applyIdle(user);
      return this.serializeUser(updatedUser);
    } catch (error) {
      console.error("Database Error in getState:", error);
      throw error;
    }
  }

  async click(telegramId: number) {
    try {
      const tid = BigInt(telegramId);
      // Сначала получаем текущую силу клика
      const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
      const power = user ? user.clickPower : 1;

      const updated = await this.prisma.user.update({
        where: { telegramId: tid },
        data: {
          coins: { increment: power },
        },
      });

      return this.serializeUser(updated);
    } catch (error) {
      console.error("Database Error in click:", error);
      throw error;
    }
  }

  async buyClick(telegramId: number) {
    try {
      const tid = BigInt(telegramId);
      const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
      if (!user) return null;

      const price = user.clickPower * 10;

      if (Number(user.coins) >= price) {
        const updated = await this.prisma.user.update({
          where: { telegramId: tid },
          data: {
            coins: { decrement: price },
            clickPower: { increment: 1 },
          },
        });
        return this.serializeUser(updated);
      }
      return null;
    } catch (error) {
      console.error("Database Error in buyClick:", error);
      throw error;
    }
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

  // Метод-хелпер для очистки данных перед отправкой в JSON
  private serializeUser(user: any) {
    return {
      ...user,
      // Превращаем BigInt в строку, это самый надежный способ для JSON
      telegramId: user.telegramId.toString(),
      // На случай если coins в БД стали Decimal или очень большим числом
      coins: Number(user.coins),
    };
  }
}