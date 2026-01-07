import { create } from "zustand";

const getTelegramUserId = (): number => {
  const tg = (window as any).Telegram?.WebApp;
  return tg?.initDataUnsafe?.user?.id || 12345;
};

interface GameState {
  coins: number;
  clickPower: number;
  incomePerSec: number;
  maxOfflineTime: number;
  offlineBonus: number;
  showOfflineModal: boolean;
  leaderboard: any[];
  load: () => Promise<void>;
  click: () => Promise<void>;
  buyUpgrade: (type: 'click' | 'income' | 'limit') => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  closeOfflineModal: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  coins: 0,
  clickPower: 1,
  incomePerSec: 0,
  maxOfflineTime: 3600,
  offlineBonus: 0,
  showOfflineModal: false,
  leaderboard: [],

  load: async () => {
    const tg = (window as any).Telegram?.WebApp;
    const userId = getTelegramUserId();
    const name = tg?.initDataUnsafe?.user?.first_name || "Шахтер";
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/state?userId=${userId}&name=${name}`);
      const data = await res.json();
      set({
        coins: data.coins,
        clickPower: data.clickPower,
        incomePerSec: data.incomePerSec,
        maxOfflineTime: data.maxOfflineTime,
        offlineBonus: data.offlineBonus,
        showOfflineModal: data.offlineBonus > 0
      });
    } catch (e) { console.error(e); }
  },

  click: async () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    
    const { coins, clickPower } = get();
    set({ coins: coins + clickPower });
    
    const userId = getTelegramUserId();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/click?userId=${userId}`, { method: 'POST' });
      const data = await res.json();
      if (data) set({ coins: data.coins });
    } catch (e) { console.error(e); }
  },

  buyUpgrade: async (type) => {
    const tg = (window as any).Telegram?.WebApp;
    const userId = getTelegramUserId();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/upgrade?userId=${userId}&type=${type}`, { method: 'POST' });
      const data = await res.json();
      if (data) {
        if (tg?.HapticFeedback) tg.HapticFeedback.notificationOccurred('success');
        set({
          coins: data.coins,
          clickPower: data.clickPower,
          incomePerSec: data.incomePerSec,
          maxOfflineTime: data.maxOfflineTime
        });
      }
    } catch (e) { console.error(e); }
  },

  loadLeaderboard: async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/leaderboard`);
      const data = await res.json();
      set({ leaderboard: data });
    } catch (e) { console.error(e); }
  },

  closeOfflineModal: () => set({ showOfflineModal: false, offlineBonus: 0 })
}));