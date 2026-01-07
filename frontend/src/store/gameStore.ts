import { create } from "zustand";
import { fetchState, clickApi, buyClickApi, fetchLeaderboard } from "../api/gameApi";

const getTelegramUserId = (): number => {
  const tg = (window as any).Telegram?.WebApp;
  return tg?.initDataUnsafe?.user?.id || 12345;
};

// Функция для вибрации
const triggerHaptic = () => {
  const tg = (window as any).Telegram?.WebApp;
  if (tg?.HapticFeedback) {
    tg.HapticFeedback.impactOccurred('light');
  }
};

interface GameState {
  coins: number;
  clickPower: number;
  incomePerSec: number;
  offlineBonus: number;
  showOfflineModal: boolean;
  leaderboard: any[];
  
  load: () => Promise<void>;
  click: () => Promise<void>;
  buyClick: () => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  closeOfflineModal: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  coins: 0,
  clickPower: 1,
  incomePerSec: 0,
  offlineBonus: 0,
  showOfflineModal: false,
  leaderboard: [],

  load: async () => {
    const tg = (window as any).Telegram?.WebApp;
    const userId = getTelegramUserId();
    const firstName = tg?.initDataUnsafe?.user?.first_name || "Шахтер";
    try {
      
      const data = await fetchState(userId, firstName);
      const bonus = data.offlineBonus || 0;
      set({
        coins: Number(data.coins),
        clickPower: data.clickPower,
        incomePerSec: data.incomePerSec,
        offlineBonus: get().offlineBonus > 0 ? get().offlineBonus : bonus,
        showOfflineModal: get().showOfflineModal || bonus > 0,
      });
    } catch (e) { console.error(e); }
  },

  click: async () => {
    triggerHaptic(); // ВИБРАЦИЯ
    const userId = getTelegramUserId();
    const { clickPower, coins } = get();
    set({ coins: coins + clickPower });
    try {
      const result = await clickApi(userId);
      if (result) set({ coins: Number(result.coins) });
    } catch (e) { console.error(e); }
  },

  buyClick: async () => {
    triggerHaptic(); // ВИБРАЦИЯ
    const userId = getTelegramUserId();
    try {
      const result = await buyClickApi(userId);
      if (result) set({ coins: Number(result.coins), clickPower: result.clickPower });
    } catch (e) { console.error(e); }
  },

  loadLeaderboard: async () => {
    try {
      const data = await fetchLeaderboard();
      set({ leaderboard: data });
    } catch (e) { console.error(e); }
  },

  closeOfflineModal: () => set({ showOfflineModal: false, offlineBonus: 0 }),
}));