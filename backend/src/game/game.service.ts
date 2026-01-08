import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  private getMultiplier(user: any): number {
    if (user.boostUntil && new Date(user.boostUntil) > new Date()) return 2;
    return 1;
  }

  async getState(telegramId: number, firstName?: string) {
    const tid = BigInt(telegramId);
    let user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    if (!user) user = await this.prisma.user.create({ data: { telegramId: tid, firstName: firstName || "Аноним" } });

    const now = new Date();
    const lastUpdate = new Date(user.lastUpdate);
    const totalSecondsOffline = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
    const multiplier = this.getMultiplier(user);

    let offlineCoins = 0;
    let offlineOil = 0;

    if (totalSecondsOffline >= 10) {
      offlineCoins = Math.min(totalSecondsOffline, user.maxOfflineTime) * user.incomePerSec * multiplier;
      offlineOil = Math.min(totalSecondsOffline, user.maxOilOfflineTime) * user.oilPerSec;
    }

    const updatedUser = await this.prisma.user.update({
      where: { telegramId: tid },
      data: { coins: { increment: offlineCoins }, oil: { increment: offlineOil }, lastUpdate: now },
    });

    return { ...this.serializeUser(updatedUser), offlineBonus: offlineCoins, offlineOilBonus: offlineOil };
  }

  // МЕТОД ДЛЯ СОХРАНЕНИЯ ОНЛАЙН ДОХОДА
  async sync(telegramId: number, earnedCoins: number, earnedOil: number) {
    const tid = BigInt(telegramId);
    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: { 
        coins: { increment: earnedCoins }, 
        oil: { increment: earnedOil }, 
        lastUpdate: new Date() 
      }
    });
    return this.serializeUser(updated);
  }

  async click(telegramId: number) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    const multiplier = this.getMultiplier(user);
    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: { coins: { increment: user.clickPower * multiplier }, lastUpdate: new Date() }
    });
    return this.serializeUser(updated);
  }

  async activateBoost(telegramId: number, hours: number) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    const currentEnd = (user.boostUntil && user.boostUntil > new Date()) ? new Date(user.boostUntil).getTime() : new Date().getTime();
    const newEnd = new Date(currentEnd + hours * 60 * 60 * 1000);
    const updated = await this.prisma.user.update({ where: { telegramId: tid }, data: { boostUntil: newEnd } });
    return this.serializeUser(updated);
  }

  async upgrade(telegramId: number, type: string) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    if (!user) return null;
    let updateData: any = {};
    let price = 0;
    let isOil = false;

    if (type === 'click') {
      price = Math.floor(50 * Math.pow(1.5, user.clickPower - 1));
      updateData = { clickPower: { increment: 1 } };
    } else if (type === 'income') {
      price = Math.floor(100 * Math.pow(1.3, Math.floor(user.incomePerSec / 5)));
      updateData = { incomePerSec: { increment: 5 } };
    } else if (type === 'oilLimit') {
      isOil = true;
      price = Math.floor(10 * Math.pow(2, (user.maxOilOfflineTime / 3600) - 1));
      updateData = { maxOilOfflineTime: { increment: 3600 } };
    }

    const currentBalance = isOil ? Number(user.oil) : Number(user.coins);
    if (currentBalance < price) return null;

    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: { [isOil ? 'oil' : 'coins']: { decrement: price }, ...updateData, lastUpdate: new Date() }
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