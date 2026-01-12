import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma.service";

@Injectable()
export class GameService {
  private readonly BOT_TOKEN = "8465844685:AAGnZ7rVhxpbrBiR2zW6abi7judVlyAt-oY";

  private readonly ITEMS = {
    time_warp_1m: {
      name: "Ускоритель (1 мин)",
      description: "Сокращает время переработки на 1 минуту",
      price: 1,
      type: "time_warp",
      duration: 60,
    },
    time_warp_3m: {
      name: "Ускоритель (3 мин)",
      description: "Сокращает время переработки на 3 минуты",
      price: 2,
      type: "time_warp",
      duration: 180,
    },
    time_warp_15m: {
      name: "Ускоритель (15 мин)",
      description: "Сокращает время переработки на 15 минут",
      price: 5,
      type: "time_warp",
      duration: 900,
    },
    time_warp_1h: {
      name: "Ускоритель (1 ч)",
      description: "Сокращает время переработки на 1 час",
      price: 10,
      type: "time_warp",
      duration: 3600,
    },
    time_warp_4h: {
      name: "Ускоритель (4 ч)",
      description: "Сокращает время переработки на 4 часа",
      price: 25,
      type: "time_warp",
      duration: 14400,
    },
    time_warp_8h: {
      name: "Ускоритель (8 ч)",
      description: "Сокращает время переработки на 8 часов",
      price: 40,
      type: "time_warp",
      duration: 28800,
    },
    time_warp_15h: {
      name: "Ускоритель (15 ч)",
      description: "Сокращает время переработки на 15 часов",
      price: 70,
      type: "time_warp",
      duration: 54000,
    },
    time_warp_24h: {
      name: "Ускоритель (24 ч)",
      description: "Сокращает время переработки на 24 часа",
      price: 100,
      type: "time_warp",
      duration: 86400,
    },
    time_warp_3d: {
      name: "Ускоритель (3 дн)",
      description: "Сокращает время переработки на 3 дня",
      price: 150,
      type: "time_warp",
      duration: 259200,
    },
    time_warp_7d: {
      name: "Ускоритель (7 дн)",
      description: "Сокращает время переработки на 7 дней",
      price: 220,
      type: "time_warp",
      duration: 604800,
    },
  };

  constructor(private prisma: PrismaService) {}

  private getMultiplier(user: any): number {
    if (user.boostUntil && new Date(user.boostUntil) > new Date()) return 2;
    return 1;
  }

  async getState(telegramId: number, firstName?: string) {
    const tid = BigInt(telegramId);
    let user = await this.prisma.user.findUnique({
      where: { telegramId: tid },
      include: { inventory: true },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: { telegramId: tid, firstName: firstName || "Аноним" },
        include: { inventory: true },
      });
    }

    const now = new Date();
    let needsUpdate = false;
    const updateData: any = {};

    // --- РАСЧЕТ ОФЛАЙН ДОХОДА ---
    let offlineBonus = 0;
    let offlineOilBonus = 0;
    let offlineSeconds = 0;

    const diffMs = now.getTime() - new Date(user.lastUpdate).getTime();
    const diffSec = Math.floor(diffMs / 1000);

    // Начисляем, только если прошло больше 60 секунд
    if (diffSec > 60) {
      // Расчет для Золота
      const timeToReward = Math.min(diffSec, user.maxOfflineTime);
      if (user.incomePerSec > 0) {
        // Множитель буста учитываем, если он был активен (упрощенно - текущий статус)
        // Для точности можно было бы высчитывать пересечение периодов,
        // но для MVP берем текущий статус буста или проверяем user.boostUntil
        const isBoosted = user.boostUntil && new Date(user.boostUntil) > now;
        const multiplier = isBoosted ? 2 : 1;
        
        offlineBonus = user.incomePerSec * timeToReward * multiplier;
        updateData.coins = { increment: offlineBonus };
      }

      // Расчет для Нефти
      const timeToOilReward = Math.min(diffSec, user.maxOilOfflineTime);
      if (user.oilPerSec > 0) {
        const isBoosted = user.boostUntil && new Date(user.boostUntil) > now;
        const multiplier = isBoosted ? 2 : 1;

        offlineOilBonus = user.oilPerSec * timeToOilReward * multiplier;
        updateData.oil = { increment: offlineOilBonus };
      }

      if (offlineBonus > 0 || offlineOilBonus > 0) {
        offlineSeconds = diffSec;
        updateData.lastUpdate = now;
        needsUpdate = true;
      }
    }

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
        include: { inventory: true },
      });
    }

    const serialized = this.serializeUser(user);
    // Добавляем инфо о бонусе в ответ, чтобы фронт показал модалку
    return {
      ...serialized,
      offlineBonus,
      offlineOilBonus,
      offlineSeconds,
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
    if (!user) return null;

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

  async useItem(telegramId: number, itemId: string) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({
      where: { telegramId: tid },
      include: { inventory: true },
    });
    if (!user) throw new Error("Пользователь не найден");

    const inventoryItem = user.inventory.find((i) => i.itemId === itemId);
    if (!inventoryItem || inventoryItem.quantity <= 0) {
      throw new Error("Предмет отсутствует в инвентаре");
    }

    const itemDef = this.ITEMS[itemId as keyof typeof this.ITEMS];
    if (!itemDef) throw new Error("Неизвестный предмет");

    const now = new Date();
    const updateData: any = {};
    let used = false;

    if (itemDef.type === "time_warp") {
      // Сокращаем время переработки
      const durationMs = itemDef.duration * 1000;

      if (user.refiningOilUntil && user.refiningOilUntil > now) {
        const newTime = new Date(user.refiningOilUntil.getTime() - durationMs);
        updateData.refiningOilUntil = newTime < now ? now : newTime;
        used = true;
      }

      if (user.refiningFuelUntil && user.refiningFuelUntil > now) {
        const newTime = new Date(user.refiningFuelUntil.getTime() - durationMs);
        updateData.refiningFuelUntil = newTime < now ? now : newTime;
        used = true;
      }

      if (!used) {
        throw new Error("Нет активных процессов переработки");
      }
    }

    // Транзакция: списать предмет, применить эффект
    const updatedUser = await this.prisma.$transaction(async (prisma) => {
      // 1. Уменьшаем кол-во
      if (inventoryItem.quantity === 1) {
        await prisma.inventoryItem.delete({
          where: { id: inventoryItem.id },
        });
      } else {
        await prisma.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: { quantity: { decrement: 1 } },
        });
      }

      // 2. Обновляем юзера
      return prisma.user.update({
        where: { telegramId: tid },
        data: updateData,
        include: { inventory: true },
      });
    });

    return this.serializeUser(updatedUser);
  }

  // --- TELEGRAM PAYMENTS & WEBHOOK ---

  async createInvoiceLink(userId: string, itemId: string = "boost_24h") {
    try {
      let title = "Буст x2 (24ч)";
      let description = "Удвоение добычи ресурсов и силы клика";
      let price = 50;
      let payload = `boost_24h_${userId}`;

      if (itemId !== "boost_24h") {
        const item = this.ITEMS[itemId as keyof typeof this.ITEMS];
        if (!item) throw new Error("Товар не найден");
        
        title = item.name;
        description = item.description;
        price = item.price;
        payload = `item_${itemId}_${userId}`;
      }

      const response = await fetch(
        `https://api.telegram.org/bot${this.BOT_TOKEN}/createInvoiceLink`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: title,
            description: description,
            payload: payload,
            provider_token: "", // Для Telegram Stars это поле должно быть ПУСТЫМ
            currency: "XTR", // Код валюты для Telegram Stars
            prices: [{ label: title, amount: price }], // Цена в Звездах
          }),
        }
      );

      const data = await response.json();

      if (!data.ok) {
        console.error("Ошибка Telegram API:", data);
        return { error: data.description || "Ошибка API" };
      }

      return { invoiceLink: data.result };
    } catch (e) {
      console.error("Ошибка сервера при создании счета:", e);
      return { error: "Internal Server Error" };
    }
  }

  async handleWebhook(update: any) {
    // 1. Обработка pre_checkout_query (подтверждение готовности принять оплату)
    if (update.pre_checkout_query) {
      const queryId = update.pre_checkout_query.id;
      await fetch(
        `https://api.telegram.org/bot${this.BOT_TOKEN}/answerPreCheckoutQuery`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pre_checkout_query_id: queryId,
            ok: true,
          }),
        }
      );
      return { status: "ok" };
    }

    // 2. Обработка успешной оплаты
    if (update.message && update.message.successful_payment) {
      const payment = update.message.successful_payment;
      const payload = payment.invoice_payload; // "boost_24h_12345" или "item_time_warp_1h_12345"
      
      if (payload) {
        if (payload.startsWith("boost_24h_")) {
          const userId = payload.split("_")[2];
          if (userId) {
            console.log(`Boost Payment success for user ${userId}`);
            await this.activateBoost(Number(userId), 24);
          }
        } else if (payload.startsWith("item_")) {
          // payload format: item_ITEMID_USERID
          const parts = payload.split("_");
          const userIdStr = parts[parts.length - 1];
          const itemId = parts.slice(1, parts.length - 1).join("_");
          const userId = Number(userIdStr);

          if (userId && itemId) {
             console.log(`Item Payment success for user ${userId}, item ${itemId}`);
             await this.addItemToInventory(userId, itemId);
          }
        }
      }
      return { status: "ok" };
    }

    return { status: "ignored" };
  }

  async addItemToInventory(telegramId: number, itemId: string) {
    const tid = BigInt(telegramId);
    const user = await this.prisma.user.findUnique({ where: { telegramId: tid } });
    if (!user) return;

    // Используем upsert
    const existingItem = await this.prisma.inventoryItem.findUnique({
      where: {
        userId_itemId: {
          userId: user.id,
          itemId: itemId,
        },
      },
    });

    if (existingItem) {
      await this.prisma.inventoryItem.update({
        where: { id: existingItem.id },
        data: { quantity: { increment: 1 } },
      });
    } else {
      await this.prisma.inventoryItem.create({
        data: {
          userId: user.id,
          itemId: itemId,
          quantity: 1,
        },
      });
    }
  }

  async setWebhook(url: string) {
    const webhookUrl = `${url}/game/webhook`;
    const response = await fetch(
      `https://api.telegram.org/bot${this.BOT_TOKEN}/setWebhook?url=${webhookUrl}`
    );
    return await response.json();
  }

  private serializeUser(user: any) {
    const now = new Date();
    const isBoostActive = user.boostUntil ? new Date(user.boostUntil) > now : false;

    return {
      ...user,
      telegramId: user.telegramId.toString(),
      coins: Number(user.coins),
      oil: Number(user.oil),
      fuel: Number(user.fuel || 0),
      isBoostActive: isBoostActive, // Передаем статус активности
      boostUntil: user.boostUntil ? user.boostUntil.toISOString() : null,
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
      inventory: user.inventory || [],
    };
  }
}
