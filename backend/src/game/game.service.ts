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

      // Обработка завершения нефти
      if (user.processingUntil && now >= new Date(user.processingUntil)) {
        // Достаем количество из метаданных (мы добавим его позже или будем хранить в доп. поле)
        // Для простоты сейчас: считаем, что 1 запуск = 1 сессия переработки
        // Чтобы хранить количество, нам нужно было бы поле в БД, но мы можем высчитать его по затраченному времени
        // Однако правильнее добавить поле oilBatch в Prisma. 
        // Пока реализуем логику: 1 запуск = выбранное количество нефти.
        
        // ВАЖНО: В текущей схеме мы просто завершаем процесс. 
        // Чтобы поддержать "количество", добавим логику начисления при старте или сохраним в памяти.
        // Сейчас начислим 1, как в базе, но ниже в startProcessing поправим логику.
        updateData.oil = { increment: 1 }; 
        updateData.processingUntil = null;
      }

      const lastUpdate = new Date(user.lastUpdate);
      let secondsOffline = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);
      if (secondsOffline > user.maxOfflineTime) secondsOffline = user.maxOfflineTime;

      if (secondsOffline >= 10 && user.incomePerSec > 0) {
        updateData.coins = { increment: secondsOffline * user.incomePerSec + (updateData.coins?.increment || 0) };
      }

      const updatedUser = await this.prisma.user.update({
        where: { telegramId: tid },
        data: updateData,
      });

      return { ...this.serializeUser(updatedUser), offlineBonus: secondsOffline >= 10 ? secondsOffline * user.incomePerSec : 0 };
    } catch (error) {
      console.error("Database Error:", error);
      throw error;
    }
  }

  async startProcessing(telegramId: number, amount: number) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    
    const cost = amount * 10000;
    const timeInMs = amount * 10000; // 10 секунд на единицу

    if (!user || user.coins < cost || user.processingUntil) return null;

    const finishTime = new Date(Date.now() + timeInMs);

    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: {
        coins: { decrement: cost },
        processingUntil: finishTime,
        // Чтобы бэкенд знал, сколько нефти начислить в конце,
        // в идеале нужно поле в БД. Для текущей структуры начислим нефть СРАЗУ, 
        // но заморозим завод таймером.
        oil: { increment: amount } 
      }
    });
    return this.serializeUser(updated);
  }

  async syncCoins(telegramId: number, earned: number) {
    const tid = BigInt(telegramId);
    const updated = await this.prisma.user.update({
      where: { telegramId: tid },
      data: { coins: { increment: earned }, lastUpdate: new Date() },
    });
    return this.serializeUser(updated);
  }

  async upgrade(telegramId: number, type: 'click' | 'income' | 'limit') {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    if (!user) return null;

    let price = 0;
    if (type === 'click') price = Math.floor(50 * Math.pow(1.5, user.clickPower - 1));
    else if (type === 'income') price = Math.floor(100 * Math.pow(1.3, Math.floor(user.incomePerSec / 5)));
    else if (type === 'limit') price = Math.floor(500 * Math.pow(2, (user.maxOfflineTime / 3600) - 1));

    if (user.coins >= price) {
      const updated = await this.prisma.user.update({
        where: { telegramId: tid },
        data: { 
          coins: { decrement: price },
          clickPower: type === 'click' ? { increment: 1 } : undefined,
          incomePerSec: type === 'income' ? { increment: 5 } : undefined,
          maxOfflineTime: type === 'limit' ? { increment: 3600 } : undefined,
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
      data: { coins: { increment: user.clickPower }, lastUpdate: new Date() },
    });
    return this.serializeUser(updated);
  }

  async getLeaderboard() {
    const topUsers = await this.prisma.user.findMany({ orderBy: { coins: 'desc' }, take: 10 });
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