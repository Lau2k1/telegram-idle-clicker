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
        return { ...this.serializeUser(user), offlineBonus: 0 };
      }

      const now = new Date();
      const lastUpdate = new Date(user.lastUpdate);
      const secondsOffline = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
      
      let offlineBonus = 0;
      let updatedUser = user;

      // Если игрока не было больше 10 секунд и у него есть пассивный доход
      if (secondsOffline >= 10 && user.incomePerSec > 0) {
        offlineBonus = secondsOffline * user.incomePerSec;
        
        updatedUser = await this.prisma.user.update({
          where: { id: user.id },
          data: {
            coins: { increment: offlineBonus },
            lastUpdate: now,
          },
        });
      } else {
        // Если дохода нет, просто обновляем время последнего входа
        updatedUser = await this.prisma.user.update({
          where: { id: user.id },
          data: { lastUpdate: now }
        });
      }

      return {
        ...this.serializeUser(updatedUser),
        offlineBonus // Отправляем сумму бонуса фронтенду
      };
    } catch (error) {
      console.error("Database Error in getState:", error);
      throw error;
    }
  }

  async click(telegramId: number) {
    try {
      const tid = BigInt(telegramId);
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
          where: { tid },
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

  private serializeUser(user: any) {
    return {
      ...user,
      telegramId: user.telegramId.toString(),
      coins: Number(user.coins),
    };
  }
}