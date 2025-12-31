import { create } from "zustand";
import { fetchState, clickApi, buyClickApi } from "../api/gameApi";

const getTelegramUserId = (): number => {
  const tg = (window as any).Telegram?.WebApp;
  return tg?.initDataUnsafe?.user?.id || 12345;
};

interface GameState {
  coins: number;
  clickPower: number;
  incomePerSec: number;
  offlineBonus: number;
  showOfflineModal: boolean;
  load: () => Promise<void>;
  click: () => Promise<void>;
  buyClick: () => Promise<void>;
  closeOfflineModal: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  coins: 0,
  clickPower: 1,
  incomePerSec: 0,
  offlineBonus: 0,
  showOfflineModal: false,

  load: async () => {
    const userId = getTelegramUserId();
    try {
      const data = await fetchState(userId);
      
      // Используем временную переменную для расчета бонуса
      const bonus = data.offlineBonus || 0;
      
      set({
        coins: Number(data.coins),
        clickPower: data.clickPower,
        incomePerSec: data.incomePerSec,
        offlineBonus: bonus,
        // Окно откроется только если бонус > 0 и оно еще не было открыто
        showOfflineModal: bonus > 0, 
      });
    } catch (error) {
      console.error("Failed to load game state:", error);
    }
  },

  click: async () => {
    const userId = getTelegramUserId();
    const { clickPower, coins } = get();
    // Оптимистичное обновление
    set({ coins: coins + clickPower });
    try {
      const result = await clickApi(userId);
      if (result) set({ coins: Number(result.coins) });
    } catch (error) {
      console.error("Failed to sync click:", error);
    }
  },

  buyClick: async () => {
    const userId = getTelegramUserId();
    try {
      const result = await buyClickApi(userId);
      if (result) {
        set({ coins: Number(result.coins), clickPower: result.clickPower });
      }
    } catch (error) {
      console.error("Failed to buy upgrade:", error);
    }
  },

  // Эта функция теперь гарантированно вызывается ТОЛЬКО кнопкой
  closeOfflineModal: () => {
    set({ showOfflineModal: false, offlineBonus: 0 });
  },
}));