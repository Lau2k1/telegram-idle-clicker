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
            firstName: firstName || "Аноним",
            coins: 0,
            clickPower: 1,
            incomePerSec: 0,
            maxOfflineTime: 3600
          },
        });
      } else if (firstName && user.firstName !== firstName) {
        user = await this.prisma.user.update({
          where: { telegramId: tid },
          data: { firstName }
        });
      }

      const now = new Date();
      const lastUpdate = new Date(user.lastUpdate);
      let secondsOffline = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
      
      if (secondsOffline > user.maxOfflineTime) {
        secondsOffline = user.maxOfflineTime;
      }

      let offlineBonus = 0;
      let updatedUser = user;

      if (secondsOffline >= 10 && user.incomePerSec > 0) {
        offlineBonus = secondsOffline * user.incomePerSec;
        updatedUser = await this.prisma.user.update({
          where: { telegramId: tid },
          data: { coins: { increment: offlineBonus }, lastUpdate: now },
        });
      } else {
        updatedUser = await this.prisma.user.update({
          where: { telegramId: tid },
          data: { lastUpdate: now }
        });
      }

      return { ...this.serializeUser(updatedUser), offlineBonus };
    } catch (error) {
      console.error("Database Error:", error);
      throw error;
    }
  }

  // НОВЫЙ МЕТОД: Синхронизация монет, заработанных онлайн
  async syncCoins(telegramId: number, coinsEarned: number) {
    const tid = BigInt(telegramId);
    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: { 
        coins: { increment: coinsEarned },
        lastUpdate: new Date() 
      },
    });
    return this.serializeUser(updated);
  }

  async upgrade(telegramId: number, type: 'click' | 'income' | 'limit') {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    if (!user) return null;

    let price = 0;
    let updateData = {};

    if (type === 'click') {
      price = Math.floor(50 * Math.pow(1.5, user.clickPower - 1));
      updateData = { clickPower: { increment: 1 } };
    } else if (type === 'income') {
      const currentLevel = Math.floor(user.incomePerSec / 5);
      price = Math.floor(100 * Math.pow(1.3, currentLevel));
      updateData = { incomePerSec: { increment: 5 } };
    } else if (type === 'limit') {
      const currentLevel = user.maxOfflineTime / 3600;
      price = Math.floor(500 * Math.pow(2, currentLevel - 1));
      updateData = { maxOfflineTime: { increment: 3600 } };
    }

    if (user.coins >= price) {
      const updated = await this.prisma.user.update({
        where: { telegramId: tid },
        data: { 
          coins: { decrement: price },
          ...updateData,
          lastUpdate: new Date()
        },
      });
      return this.serializeUser(updated);
    }
    return null;
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
    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: { 
        coins: { increment: 1 }, // Здесь можно добавить учет clickPower из базы
        lastUpdate: new Date() 
      },
    });
    return this.serializeUser(updated);
  }

  private serializeUser(user: any) {
    return {
      ...user,
      telegramId: user.telegramId.toString(),
      coins: Number(user.coins),
      maxOfflineTime: Number(user.maxOfflineTime)
    };
  }
}