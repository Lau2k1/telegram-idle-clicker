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
    let user = await this.prisma.user.findUnique({
      where: { telegramId: tid },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { telegramId: tid, firstName: firstName || "Аноним" },
      });
    }

    const now = new Date();
    let needsUpdate = false;
    const updateData: any = {};

    // Проверка завершения: Золото -> Нефть
    if (user.refiningOilUntil && user.refiningOilUntil <= now) {
      updateData.oil = { increment: user.refiningOilAmount };
      updateData.refiningOilUntil = null;
      updateData.refiningOilAmount = 0;
      needsUpdate = true;
    }

    // Проверка завершения: Нефть -> Топливо
    if (user.refiningFuelUntil && user.refiningFuelUntil <= now) {
      updateData.fuel = { increment: user.refiningFuelAmount };
      updateData.refiningFuelUntil = null;
      updateData.refiningFuelAmount = 0;
      needsUpdate = true;
    }

    if (needsUpdate) {
      user = await this.prisma.user.update({
        where: { telegramId: tid },
        data: updateData,
      });
    }

    return this.serializeUser(user);
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
    const user = await this.prisma.user.findUnique({
      where: { telegramId: tid },
    });
    if (!user) return null;

    let updateData: any = {};
    let price = 0;
    let isOilPayment = false;

    // ТУТ ИСПРАВЛЕННЫЕ ФОРМУЛЫ ЦЕН
    if (type === "click") {
      price = Math.floor(50 * Math.pow(1.5, user.clickPower - 1));
      updateData = { clickPower: { increment: 1 } };
    } else if (type === "income") {
      price = Math.floor(
        100 * Math.pow(1.3, Math.floor(user.incomePerSec / 5))
      );
      updateData = { incomePerSec: { increment: 5 } };
    } else if (type === "oilPerSecGold") {
      price = Math.floor(500 * Math.pow(1.4, Math.floor(user.oilPerSec * 10)));
      updateData = { oilPerSec: { increment: 0.1 } };
    } else if (type === "oilPerSecOil") {
      isOilPayment = true;
      price = Math.floor(20 * Math.pow(1.6, Math.floor(user.oilPerSec * 5)));
      updateData = { oilPerSec: { increment: 0.2 } };
    } else if (type === "oilLimit") {
      isOilPayment = true;
      price = Math.floor(10 * Math.pow(2, user.maxOilOfflineTime / 3600 - 1));
      updateData = { maxOilOfflineTime: { increment: 3600 } };
    }

    const balance = isOilPayment ? Number(user.oil) : Number(user.coins);

    if (balance < price) {
      throw new Error("Недостаточно средств");
    }

    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: {
        [isOilPayment ? "oil" : "coins"]: { decrement: price }, // СПИСЫВАЕМ СРЕДСТВА
        ...updateData,
        lastUpdate: new Date(),
      },
    });

    return this.serializeUser(updated);
  }

  async startRefining(telegramId: number, type: string, amount: number) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({
      where: { telegramId: tid },
    });
    if (!user) throw new Error("Пользователь не найден");

    const now = new Date();
    let cost = 0;
    let duration = 0;
    let data: any = {};

    if (type === "oil") {
      cost = amount * 100;
      if (Number(user.coins) < cost) throw new Error("Недостаточно золота");
      // Если уже идет переработка этого типа — запрещаем
      if (user.refiningOilUntil && user.refiningOilUntil > now)
        throw new Error("Завод уже занят синтезом нефти");

      duration = amount * 10; // 10 сек на 1 нефть
      data = {
        coins: { decrement: cost },
        refiningOilUntil: new Date(now.getTime() + duration * 1000),
        refiningOilAmount: amount,
      };
    } else if (type === "fuel") {
      cost = amount * 25;
      if (Number(user.oil) < cost) throw new Error("Недостаточно нефти");
      // Если уже идет переработка этого типа — запрещаем
      if (user.refiningFuelUntil && user.refiningFuelUntil > now)
        throw new Error("Реактор уже занят производством топлива");

      duration = amount * 100; // 100 сек на 1 топливо
      data = {
        oil: { decrement: cost },
        refiningFuelUntil: new Date(now.getTime() + duration * 1000),
        refiningFuelAmount: amount,
      };
    }

    const updatedUser = await this.prisma.user.update({
      where: { telegramId: tid },
      data: data,
    });

    return this.serializeUser(updatedUser);
  }

  private serializeUser(user: any) {
    return {
      ...user,
      telegramId: user.telegramId.toString(),
      coins: Number(user.coins),
      oil: Number(user.oil),
      fuel: Number(user.fuel || 0),
      incomePerSec: Number(user.incomePerSec),
      oilPerSec: Number(user.oilPerSec),
      clickPower: Number(user.clickPower),
      refiningOilUntil: user.refiningOilUntil
        ? user.refiningOilUntil.toISOString()
        : null,
      refiningFuelUntil: user.refiningFuelUntil
        ? user.refiningFuelUntil.toISOString()
        : null,
      refiningOilAmount: user.refiningOilAmount || 0,
      refiningFuelAmount: user.refiningFuelAmount || 0,
    };
  }
}
