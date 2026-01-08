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
          data: { telegramId: tid, firstName: firstName || "Аноним" },
        });
      }

      const now = new Date();
      const lastUpdate = new Date(user.lastUpdate);
      let secondsOffline = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
      if (secondsOffline > user.maxOfflineTime) secondsOffline = user.maxOfflineTime;

      let updateData: any = { lastUpdate: now };
      let offlineCoins = 0;
      let offlineOil = 0;

      if (secondsOffline >= 10) {
        offlineCoins = secondsOffline * user.incomePerSec;
        offlineOil = secondsOffline * user.oilPerSec;
        updateData.coins = { increment: offlineCoins };
        updateData.oil = { increment: offlineOil };
      }

      if (user.processingUntil && now >= new Date(user.processingUntil)) {
        updateData.processingUntil = null;
      }

      const updatedUser = await this.prisma.user.update({
        where: { telegramId: tid },
        data: updateData,
      });

      return { 
        ...this.serializeUser(updatedUser), 
        offlineBonus: offlineCoins,
        offlineOilBonus: offlineOil 
      };
    } catch (error) { console.error(error); throw error; }
  }

  // Метод, который требовал контроллер (syncCoins переименован в syncResources для поддержки нефти)
  async syncResources(telegramId: number, earnedCoins: number, earnedOil: number) {
    const tid = BigInt(telegramId);
    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: { 
        coins: { increment: earnedCoins },
        oil: { increment: earnedOil },
        lastUpdate: new Date() 
      },
    });
    return this.serializeUser(updated);
  }

  async upgrade(telegramId: number, type: 'click' | 'income' | 'limit' | 'oilIncome') {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    if (!user) return null;

    let price = 0;
    let updateData = {};

    if (type === 'click') {
      price = Math.floor(50 * Math.pow(1.5, user.clickPower - 1));
      updateData = { clickPower: { increment: 1 } };
    } else if (type === 'income') {
      price = Math.floor(100 * Math.pow(1.3, Math.floor(user.incomePerSec / 5)));
      updateData = { incomePerSec: { increment: 5 } };
    } else if (type === 'limit') {
      price = Math.floor(500 * Math.pow(2, (user.maxOfflineTime / 3600) - 1));
      updateData = { maxOfflineTime: { increment: 3600 } };
    } else if (type === 'oilIncome') {
      price = Math.floor(50000 * Math.pow(1.8, user.oilPerSec * 10));
      updateData = { oilPerSec: { increment: 0.1 } };
    }

    if (user.coins >= price) {
      return this.serializeUser(await this.prisma.user.update({
        where: { telegramId: tid },
        data: { coins: { decrement: price }, ...updateData, lastUpdate: new Date() },
      }));
    }
    return null;
  }

  async click(telegramId: number) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    if (!user) return null;
    return this.serializeUser(await this.prisma.user.update({
      where: { telegramId: tid },
      data: { coins: { increment: user.clickPower }, lastUpdate: new Date() }
    }));
  }

  async startProcessing(telegramId: number, amount: number) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    const cost = amount * 10000;
    if (!user || user.coins < cost || user.processingUntil) return null;

    return this.serializeUser(await this.prisma.user.update({
      where: { telegramId: tid },
      data: {
        coins: { decrement: cost },
        oil: { increment: amount },
        processingUntil: new Date(Date.now() + amount * 10000)
      }
    }));
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
      oilPerSec: Number(user.oilPerSec),
      maxOfflineTime: Number(user.maxOfflineTime),
      processingUntil: user.processingUntil ? user.processingUntil.toISOString() : null,
    };
  }
}