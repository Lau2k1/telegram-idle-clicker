import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  private getMultiplier(user: any): number {
    if (user.boostUntil && new Date(user.boostUntil) > new Date()) {
      return 2;
    }
    return 1;
  }

  async getState(telegramId: number, firstName?: string) {
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
    const multiplier = this.getMultiplier(user);

    let offlineCoins = 0;
    let offlineOil = 0;

    if (totalSecondsOffline >= 10) {
      const goldSeconds = Math.min(totalSecondsOffline, user.maxOfflineTime);
      offlineCoins = goldSeconds * user.incomePerSec * multiplier;
      
      const oilSeconds = Math.min(totalSecondsOffline, user.maxOilOfflineTime);
      offlineOil = oilSeconds * user.oilPerSec;
    }

    const updatedUser = await this.prisma.user.update({
      where: { telegramId: tid },
      data: {
        coins: { increment: offlineCoins },
        oil: { increment: offlineOil },
        lastUpdate: now,
      },
    });

    return { 
      ...this.serializeUser(updatedUser), 
      offlineBonus: offlineCoins,
      offlineOilBonus: offlineOil,
      isBoostActive: multiplier === 2
    };
  }

  async click(telegramId: number) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    const multiplier = this.getMultiplier(user);

    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: { 
        coins: { increment: user.clickPower * multiplier }, 
        lastUpdate: new Date() 
      }
    });
    return this.serializeUser(updated);
  }

  async activateBoost(telegramId: number, hours: number) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    const currentEnd = user.boostUntil && user.boostUntil > new Date() ? new Date(user.boostUntil).getTime() : new Date().getTime();
    const newBoostUntil = new Date(currentEnd + hours * 60 * 60 * 1000);

    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: { boostUntil: newBoostUntil }
    });
    return this.serializeUser(updated);
  }

  private serializeUser(user: any) {
    return {
      ...user,
      telegramId: user.telegramId.toString(),
      coins: Number(user.coins),
      oil: Number(user.oil),
      clickPower: Number(user.clickPower),
      incomePerSec: Number(user.incomePerSec),
      oilPerSec: Number(user.oilPerSec),
      maxOfflineTime: Number(user.maxOfflineTime),
      maxOilOfflineTime: Number(user.maxOilOfflineTime),
      boostUntil: user.boostUntil ? user.boostUntil.toISOString() : null,
      isBoostActive: user.boostUntil && new Date(user.boostUntil) > new Date()
    };
  }
}