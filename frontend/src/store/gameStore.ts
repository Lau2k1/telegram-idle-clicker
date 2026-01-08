import { create } from "zustand";

const getTelegramUserId = (): number => {
  const tg = (window as any).Telegram?.WebApp;
  return tg?.initDataUnsafe?.user?.id || 12345;
};

interface GameState {
  coins: number;
  oil: number;
  clickPower: number;
  incomePerSec: number;
  maxOfflineTime: number;
  processingUntil: string | null;
  offlineBonus: number;
  showOfflineModal: boolean;
  leaderboard: any[];
  load: () => Promise<void>;
  addCoins: (amount: number) => void;
  click: () => Promise<void>;
  buyUpgrade: (type: 'click' | 'income' | 'limit') => Promise<void>;
  syncOnline: (earned: number) => Promise<void>;
  startProcessing: (amount: number) => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  closeOfflineModal: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  coins: 0,
  oil: 0,
  clickPower: 1,
  incomePerSec: 0,
  maxOfflineTime: 3600,
  processingUntil: null,
  offlineBonus: 0,
  showOfflineModal: false,
  leaderboard: [],

  addCoins: (amount) => set((state) => ({ coins: state.coins + amount })),

  load: async () => {
    const userId = getTelegramUserId();
    const name = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.first_name || "Шахтер";
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/state?userId=${userId}&name=${encodeURIComponent(name)}`);
      const data = await res.json();
      set({
        coins: Number(data.coins),
        oil: Number(data.oil),
        clickPower: Number(data.clickPower),
        incomePerSec: Number(data.incomePerSec),
        maxOfflineTime: Number(data.maxOfflineTime),
        processingUntil: data.processingUntil,
        offlineBonus: Number(data.offlineBonus),
        showOfflineModal: Number(data.offlineBonus) > 0
      });
    } catch (e) { console.error(e); }
  },

  click: async () => {
    const { coins, clickPower } = get();
    set({ coins: coins + clickPower });
    const userId = getTelegramUserId();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/click?userId=${userId}`, { method: 'POST' });
      const data = await res.json();
      if (data) set({ coins: Number(data.coins) });
    } catch (e) { console.error(e); }
  },

  syncOnline: async (earned: number) => {
    const userId = getTelegramUserId();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/sync?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ earned: Number(earned) })
      });
      const data = await res.json();
      if (data) set({ coins: Number(data.coins) });
    } catch (e) { console.error(e); }
  },

  buyUpgrade: async (type) => {
    const userId = getTelegramUserId();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/upgrade?userId=${userId}&type=${type}`, { method: 'POST' });
      const data = await res.json();
      if (data) {
        set({
          coins: Number(data.coins),
          clickPower: Number(data.clickPower),
          incomePerSec: Number(data.incomePerSec),
          maxOfflineTime: Number(data.maxOfflineTime)
        });
      }
    } catch (e) { console.error(e); }
  },

  startProcessing: async (amount: number) => {
    const userId = getTelegramUserId();
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/process-oil?userId=${userId}&amount=${amount}`, { method: 'POST' });
      const data = await res.json();
      if (data) {
        set({ 
          coins: Number(data.coins),
          oil: Number(data.oil),
          processingUntil: data.processingUntil 
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