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
      const totalSecondsOffline = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

      let offlineCoins = 0;
      let offlineOil = 0;

      if (totalSecondsOffline >= 10) {
        // Золото: лимит по maxOfflineTime
        const goldSeconds = Math.min(totalSecondsOffline, user.maxOfflineTime);
        offlineCoins = goldSeconds * user.incomePerSec;

        // Нефть: лимит по maxOilOfflineTime
        const oilSeconds = Math.min(totalSecondsOffline, user.maxOilOfflineTime);
        offlineOil = oilSeconds * user.oilPerSec;
      }

      const updatedUser = await this.prisma.user.update({
        where: { telegramId: tid },
        data: {
          coins: { increment: offlineCoins },
          oil: { increment: offlineOil },
          lastUpdate: now,
          // Очистка таймера завода, если время вышло
          processingUntil: user.processingUntil && now > new Date(user.processingUntil) ? null : user.processingUntil
        },
      });

      return { 
        ...this.serializeUser(updatedUser), 
        offlineBonus: offlineCoins,
        offlineOilBonus: offlineOil 
      };
    } catch (error) { console.error(error); throw error; }
  }

  async upgrade(telegramId: number, type: string) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    if (!user) return null;

    let updateData: any = {};
    let price = 0;
    let isOilPurchase = false;

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
    } else if (type === 'oilLimit') {
      // Улучшение резервуара покупается за НЕФТЬ
      isOilPurchase = true;
      price = Math.floor(10 * Math.pow(2, (user.maxOilOfflineTime / 3600) - 1));
      updateData = { maxOilOfflineTime: { increment: 3600 } };
    }

    if (!isOilPurchase && user.coins >= price) {
      const updated = await this.prisma.user.update({
        where: { telegramId: tid },
        data: { coins: { decrement: price }, ...updateData, lastUpdate: new Date() }
      });
      return this.serializeUser(updated);
    } 
    
    if (isOilPurchase && user.oil >= price) {
      const updated = await this.prisma.user.update({
        where: { telegramId: tid },
        data: { oil: { decrement: price }, ...updateData, lastUpdate: new Date() }
      });
      return this.serializeUser(updated);
    }

    return null;
  }

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

  async click(telegramId: number) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
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
    const users = await this.prisma.user.findMany({ orderBy: { coins: 'desc' }, take: 10 });
    return users.map(u => this.serializeUser(u));
  }

  private serializeUser(user: any) {
    return {
      ...user,
      telegramId: user.telegramId.toString(),
      coins: Number(user.coins),
      oil: Number(user.oil),
      oilPerSec: Number(user.oilPerSec),
      maxOfflineTime: Number(user.maxOfflineTime),
      maxOilOfflineTime: Number(user.maxOilOfflineTime),
      processingUntil: user.processingUntil ? user.processingUntil.toISOString() : null,
    };
  }
}