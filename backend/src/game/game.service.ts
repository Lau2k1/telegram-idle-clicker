import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  async getState(telegramId: number, firstName?: string) {
    try {
      const tid = BigInt(telegramId);
      let user = await this.prisma.user.findUnique({ where: { telegramId: tid } });

      if (!user) {
        user = await this.prisma.user.create({
          data: {
            telegramId: tid,
            firstName: firstName || "Аноним", // Сохраняем имя
            coins: 0,
            clickPower: 1,
            incomePerSec: 0,
          },
        });
      } else if (firstName && user.firstName !== firstName) {
        // Обновляем имя, если оно изменилось в Telegram
        user = await this.prisma.user.update({
          where: { id: user.id },
          data: { firstName }
        });
      }

      const now = new Date();
      const lastUpdate = new Date(user.lastUpdate);
      const secondsOffline = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
      
      let offlineBonus = 0;
      let updatedUser = user;

      if (secondsOffline >= 10 && user.incomePerSec > 0) {
        offlineBonus = secondsOffline * user.incomePerSec;
        updatedUser = await this.prisma.user.update({
          where: { id: user.id },
          data: { coins: { increment: offlineBonus }, lastUpdate: now },
        });
      } else {
        updatedUser = await this.prisma.user.update({
          where: { id: user.id },
          data: { lastUpdate: now }
        });
      }

      return { ...this.serializeUser(updatedUser), offlineBonus };
    } catch (error) {
      console.error("Database Error:", error);
      throw error;
    }
  }

  async getLeaderboard() {
    const topUsers = await this.prisma.user.findMany({
      orderBy: { coins: 'desc' },
      take: 10,
    });
    return topUsers.map(user => this.serializeUser(user));
  }

  async click(telegramId: number) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    if (!user) return null;

    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: { coins: { increment: user.clickPower } },
    });
    return this.serializeUser(updated);
  }

  private serializeUser(user: any) {
    return {
      ...user,
      telegramId: user.telegramId.toString(),
      firstName: user.firstName || "Игрок",
      coins: Number(user.coins),
    };
  }
}