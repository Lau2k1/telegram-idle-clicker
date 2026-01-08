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

  // Если игрока не было больше 10 секунд
  if (totalSecondsOffline >= 10) {
    offlineCoins = Math.min(totalSecondsOffline, user.maxOfflineTime) * user.incomePerSec * multiplier;
    offlineOil = Math.min(totalSecondsOffline, user.maxOilOfflineTime) * user.oilPerSec;
  }

  const updatedUser = await this.prisma.user.update({
    where: { telegramId: tid },
    data: { 
      coins: { increment: offlineCoins }, 
      oil: { increment: offlineOil }, 
      lastUpdate: now 
    },
  });

  return { 
    ...this.serializeUser(updatedUser), 
    offlineBonus: offlineCoins, 
    offlineOilBonus: offlineOil,
    offlineSeconds: totalSecondsOffline // Передаем время для модалки
  };
}

  // МЕТОД ДЛЯ СОХРАНЕНИЯ ОНЛАЙН ДОХОДА
  async sync(telegramId: number, earnedCoins: number, earnedOil: number) {
    const tid = BigInt(telegramId);
    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: {
        coins: { increment: earnedCoins },
        oil: { increment: earnedOil },
        lastUpdate: new Date(),
      },
    });
    return this.serializeUser(updated);
  }

  async getLeaderboard() {
    const users = await this.prisma.user.findMany({
      orderBy: { coins: "desc" },
      take: 50, // Берем топ-50 игроков
      select: {
        firstName: true,
        coins: true,
      },
    });
    return users.map((user) => ({
      ...user,
      coins: Number(user.coins),
    }));
  }

  async click(telegramId: number) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({
      where: { telegramId: tid },
    });
    const multiplier = this.getMultiplier(user);
    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: {
        coins: { increment: user.clickPower * multiplier },
        lastUpdate: new Date(),
      },
    });
    return this.serializeUser(updated);
  }

  async activateBoost(telegramId: number, hours: number) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({
      where: { telegramId: tid },
    });
    const currentEnd =
      user.boostUntil && user.boostUntil > new Date()
        ? new Date(user.boostUntil).getTime()
        : new Date().getTime();
    const newEnd = new Date(currentEnd + hours * 60 * 60 * 1000);
    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: { boostUntil: newEnd },
    });
    return this.serializeUser(updated);
  }

async upgrade(telegramId: number, type: string) {
  const tid = BigInt(telegramId);
  const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
  if (!user) return null;

  let updateData: any = {};
  let price = 0;
  let isOilPayment = false;

  // ТУТ ИСПРАВЛЕННЫЕ ФОРМУЛЫ ЦЕН
  if (type === 'click') {
    price = Math.floor(50 * Math.pow(1.5, user.clickPower - 1));
    updateData = { clickPower: { increment: 1 } };
  } else if (type === 'income') {
    price = Math.floor(100 * Math.pow(1.3, Math.floor(user.incomePerSec / 5)));
    updateData = { incomePerSec: { increment: 5 } };
  } else if (type === 'oilPerSecGold') {
    price = Math.floor(500 * Math.pow(1.4, Math.floor(user.oilPerSec * 10)));
    updateData = { oilPerSec: { increment: 0.1 } };
  } else if (type === 'oilPerSecOil') {
    isOilPayment = true;
    price = Math.floor(20 * Math.pow(1.6, Math.floor(user.oilPerSec * 5)));
    updateData = { oilPerSec: { increment: 0.2 } };
  } else if (type === 'oilLimit') {
    isOilPayment = true;
    price = Math.floor(10 * Math.pow(2, (user.maxOilOfflineTime / 3600) - 1));
    updateData = { maxOilOfflineTime: { increment: 3600 } };
  }

  const balance = isOilPayment ? Number(user.oil) : Number(user.coins);
  
  if (balance < price) {
    throw new Error("Недостаточно средств");
  }

  const updated = await this.prisma.user.update({
    where: { telegramId: tid },
    data: { 
      [isOilPayment ? 'oil' : 'coins']: { decrement: price }, // СПИСЫВАЕМ СРЕДСТВА
      ...updateData,
      lastUpdate: new Date()
    }
  });

  return this.serializeUser(updated);
}

async startRefining(telegramId: number, type: 'oil' | 'fuel', amount: number) {
  const tid = BigInt(telegramId);
  const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
  if (!user) return null;

  const now = new Date();
  
  // Проверяем, не занят ли завод
  if (type === 'oil' && user.refiningOilUntil && user.refiningOilUntil > now) throw new Error("Завод уже перерабатывает золото");
  if (type === 'fuel' && user.refiningFuelUntil && user.refiningFuelUntil > now) throw new Error("Реактор уже перерабатывает нефть");

  let cost = 0;
  let duration = 0;
  let updateField = {};

  if (type === 'oil') {
    cost = amount * 100; // 100 золота за 1 нефть
    if (Number(user.coins) < cost) throw new Error("Недостаточно золота");
    duration = amount * 10; // 10 секунд на единицу
    updateField = { 
      coins: { decrement: cost },
      refiningOilUntil: new Date(now.getTime() + duration * 1000),
      refiningAmount: amount 
    };
  } else {
    cost = amount * 25; // 25 нефти за 1 топливо
    if (Number(user.oil) < cost) throw new Error("Недостаточно нефти");
    duration = amount * 100; // 100 секунд на единицу
    updateField = { 
      oil: { decrement: cost },
      refiningFuelUntil: new Date(now.getTime() + duration * 1000),
      refiningAmount: amount 
    };
  }

  return await this.prisma.user.update({
    where: { telegramId: tid },
    data: updateField
  });
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
      isBoostActive: user.boostUntil && new Date(user.boostUntil) > new Date(),
    };
  }
}
