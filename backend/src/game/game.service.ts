import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  // Глобальный множитель: проверяет, не истек ли буст
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
      // Золото: лимит * доход * множитель
      const goldSeconds = Math.min(totalSecondsOffline, user.maxOfflineTime);
      offlineCoins = goldSeconds * user.incomePerSec * multiplier;

      // Нефть (на нефть буст обычно не делают, но можно добавить)
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

    return this.serializeUser(await this.prisma.user.update({
      where: { telegramId: tid },
      data: { 
        coins: { increment: user.clickPower * multiplier }, 
        lastUpdate: new Date() 
      }
    }));
  }

  async activateBoost(telegramId: number, hours: number) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    
    // Если буст уже есть, продлеваем его, если нет - считаем от текущего времени
    const currentEnd = user.boostUntil && user.boostUntil > new Date() 
      ? new Date(user.boostUntil).getTime() 
      : new Date().getTime();

    const newBoostUntil = new Date(currentEnd + hours * 60 * 60 * 1000);

    return this.serializeUser(await this.prisma.user.update({
      where: { telegramId: tid },
      data: { boostUntil: newBoostUntil }
    }));
  }

  async upgrade(telegramId: number, type: string) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    if (!user) return null;

    let updateData: any = {};
    let price = 0;
    let isOilPurchase = false;

    // Расчет цен (как в предыдущих версиях)
    if (type === 'click') {
      price = Math.floor(50 * Math.pow(1.5, user.clickPower - 1));
      updateData = { clickPower: { increment: 1 } };
    } else if (type === 'income') {
      price = Math.floor(100 * Math.pow(1.3, Math.floor(user.incomePerSec / 5)));
      updateData = { incomePerSec: { increment: 5 } };
    } else if (type === 'oilLimit') {
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

  private serializeUser(user: any) {
    return {
      ...user,
      telegramId: user.telegramId.toString(),
      coins: Number(user.coins),
      oil: Number(user.oil),
      oilPerSec: Number(user.oilPerSec),
      maxOfflineTime: Number(user.maxOfflineTime),
      maxOilOfflineTime: Number(user.maxOilOfflineTime),
      boostUntil: user.boostUntil ? user.boostUntil.toISOString() : null,
      processingUntil: user.processingUntil ? user.processingUntil.toISOString() : null,
    };
  }
}