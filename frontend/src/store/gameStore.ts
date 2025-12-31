import { create } from "zustand";
import { fetchState, clickApi, buyClickApi } from "../api/gameApi";

const getTelegramUserId = (): number => {
  const tg = window.Telegram?.WebApp;
  
  // Логируем для отладки, чтобы вы видели в консоли
  console.log("TG SDK Object:", tg);
  console.log("TG InitData:", tg?.initDataUnsafe);

  const userId = tg?.initDataUnsafe?.user?.id;

  if (userId) {
    return userId;
  }

  // Если мы в обычном браузере (не в ТГ), используем тестовый ID, 
  // чтобы приложение не крашилось с ошибкой 400
  console.warn("User ID не найден! Использую тестовый ID 12345");
  return 12345; 
};

interface GameState {
  coins: number;
  clickPower: number;
  incomePerSec: number;
  
  // Основные действия
  load: () => Promise<void>;
  click: () => Promise<void>;
  buyClick: () => Promise<void>;
}

export const useGameStore = create<GameState>((set, get) => ({
  coins: 0,
  clickPower: 1,
  incomePerSec: 0,

  // Загрузка состояния из базы данных
  load: async () => {
    const userId = getTelegramUserId();
    if (!userId) {
      console.warn("User ID not found, ensure you are in Telegram");
    }

    try {
      const data = await fetchState(userId);
      set({
        // Важно: приводим к числу, так как с бэкенда может прийти строка из-за BigInt
        coins: Number(data.coins),
        clickPower: data.clickPower,
        incomePerSec: data.incomePerSec,
      });
    } catch (error) {
      console.error("Failed to load game state:", error);
    }
  },

  // Обработка клика
  click: async () => {
    const userId = getTelegramUserId();
    const { clickPower, coins } = get();

    // 1. Оптимистичное обновление (мгновенная реакция интерфейса)
    set({ coins: coins + clickPower });

    try {
      // 2. Отправка на сервер для сохранения в БД
      const result = await clickApi(userId);
      // 3. Синхронизируем точное значение монет с сервером
      if (result && result.coins !== undefined) {
        set({ coins: Number(result.coins) });
      }
    } catch (error) {
      console.error("Failed to sync click:", error);
      // В случае ошибки можно откатить состояние, но обычно в кликерах это не критично
    }
  },

  // Покупка улучшения
  buyClick: async () => {
    const userId = getTelegramUserId();
    
    try {
      const result = await buyClickApi(userId);
      
      if (result.success) {
        set({
          coins: Number(result.coins),
          clickPower: result.clickPower,
        });
      } else {
        alert("Недостаточно монет!");
      }
    } catch (error) {
      console.error("Failed to buy upgrade:", error);
    }
  },
}));