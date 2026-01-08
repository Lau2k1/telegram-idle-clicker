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
            oil: 0,
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
      let updateData: any = { lastUpdate: now };

      // 1. Проверка завершения переработки нефти
      if (user.processingUntil && now >= new Date(user.processingUntil)) {
        updateData.oil = { increment: 1 };
        updateData.processingUntil = null;
      }

      // 2. Расчет оффлайн дохода
      const lastUpdate = new Date(user.lastUpdate);
      let secondsOffline = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
      
      if (secondsOffline > user.maxOfflineTime) {
        secondsOffline = user.maxOfflineTime;
      }

      let offlineBonus = 0;
      if (secondsOffline >= 10 && user.incomePerSec > 0) {
        offlineBonus = secondsOffline * user.incomePerSec;
        updateData.coins = { increment: offlineBonus + (updateData.coins?.increment || 0) };
      }

      const updatedUser = await this.prisma.user.update({
        where: { telegramId: tid },
        data: updateData,
      });

      return { ...this.serializeUser(updatedUser), offlineBonus };
    } catch (error) {
      console.error("Database Error in getState:", error);
      throw error;
    }
  }

  async startProcessing(telegramId: number) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    
    // Условие: 10к золота, отсутствие текущей переработки
    if (!user || user.coins < 10000 || user.processingUntil) return null;

    const finishTime = new Date(Date.now() + 10000); // 10 секунд

    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: {
        coins: { decrement: 10000 },
        processingUntil: finishTime
      }
    });
    return this.serializeUser(updated);
  }

  async syncCoins(telegramId: number, earned: number) {
    const tid = BigInt(telegramId);
    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: { 
        coins: { increment: earned },
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

    // Прогрессивные формулы цен
    if (type === 'click') {
      price = Math.floor(50 * Math.pow(1.5, user.clickPower - 1));
      updateData = { clickPower: { increment: 1 } };
    } else if (type === 'income') {
      const level = Math.floor(user.incomePerSec / 5);
      price = Math.floor(100 * Math.pow(1.3, level));
      updateData = { incomePerSec: { increment: 5 } };
    } else if (type === 'limit') {
      const hours = user.maxOfflineTime / 3600;
      price = Math.floor(500 * Math.pow(2, hours - 1));
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

  async click(telegramId: number) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    if (!user) return null;

    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: { 
        coins: { increment: user.clickPower },
        lastUpdate: new Date()
      },
    });
    return this.serializeUser(updated);
  }

  async getLeaderboard() {
    const topUsers = await this.prisma.user.findMany({
      orderBy: { coins: 'desc' },
      take: 10,
    });
    return topUsers.map(user => this.serializeUser(user));
  }

  private serializeUser(user: any) {
    return {
      ...user,
      telegramId: user.telegramId.toString(),
      coins: Number(user.coins),
      oil: Number(user.oil),
      maxOfflineTime: Number(user.maxOfflineTime),
      processingUntil: user.processingUntil ? user.processingUntil.toISOString() : null,
    };
  }
}