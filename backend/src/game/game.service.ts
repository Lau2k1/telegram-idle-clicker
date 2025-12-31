import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class GameService {
  constructor(private prisma: PrismaService) {}

  /**
   * Получение или создание состояния пользователя
   */
  async getState(telegramId: number) {
    let user = await this.prisma.user.findUnique({
      where: { telegramId: BigInt(telegramId) },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          telegramId: BigInt(telegramId),
          coins: 0,
          clickPower: 1,
          incomePerSec: 0,
        },
      });
    }

    // Рассчитываем пассивный доход (idle)
    const updatedUser = await this.applyIdle(user);
    
    // Возвращаем объект, заменяя BigInt на Number для корректного JSON
    return this.mapUser(updatedUser);
  }

  /**
   * Логика клика
   */
  async click(telegramId: number) {
    const user = await this.getState(telegramId);
    
    const updated = await this.prisma.user.update({
      where: { telegramId: BigInt(telegramId) },
      data: {
        coins: { increment: user.clickPower },
      },
    });

    return this.mapUser(updated);
  }

  /**
   * Покупка улучшения клика
   */
  async buyClick(telegramId: number) {
    const user = await this.getState(telegramId);
    const price = user.clickPower * 10;

    if (user.coins >= price) {
      const updated = await this.prisma.user.update({
        where: { telegramId: BigInt(telegramId) },
        data: {
          coins: { decrement: price },
          clickPower: { increment: 1 },
        },
      });
      return this.mapUser(updated);
    }
    return null;
  }

  /**
   * Приватный метод для начисления монет за время отсутствия
   */
  private async applyIdle(user: any) {
    const now = new Date();
    const lastUpdate = new Date(user.lastUpdate);
    const deltaSec = Math.floor((now.getTime() - lastUpdate.getTime()) / 1000);

    if (deltaSec > 0 && user.incomePerSec > 0) {
      const idleCoins = deltaSec * user.incomePerSec;
      return await this.prisma.user.update({
        where: { id: user.id },
        data: {
          coins: { increment: idleCoins },
          lastUpdate: now,
        },
      });
    }
    return user;
  }

  /**
   * Вспомогательный метод для конвертации BigInt -> Number.
   * Без этого NestJS будет выдавать ошибку 500 при попытке отправить JSON.
   */
  private mapUser(user: any) {
    return {
      ...user,
      telegramId: Number(user.telegramId), // Конвертируем BigInt в Number
    };
  }
}