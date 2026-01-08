import { create } from "zustand";

interface GameState {
  coins: number;
  oil: number;
  clickPower: number;
  incomePerSec: number;
  oilPerSec: number;
  maxOfflineTime: number;
  maxOilOfflineTime: number;
  processingUntil: string | null;
  offlineBonus: number;
  offlineOilBonus: number;
  showOfflineModal: boolean;
  leaderboard: any[];
  load: () => Promise<void>;
  addResources: (c: number, o: number) => void;
  click: () => Promise<void>;
  syncOnline: (c: number, o: number) => Promise<void>;
  buyUpgrade: (type: string) => Promise<void>;
  loadLeaderboard: () => Promise<void>;
  startProcessing: (amount: number) => Promise<void>;
  closeOfflineModal: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  coins: 0, oil: 0, clickPower: 1, incomePerSec: 0, oilPerSec: 0,
  maxOfflineTime: 3600, maxOilOfflineTime: 3600, processingUntil: null,
  offlineBonus: 0, offlineOilBonus: 0, showOfflineModal: false, leaderboard: [],

  addResources: (c, o) => set(s => ({ coins: s.coins + c, oil: s.oil + o })),

  load: async () => {
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/state?userId=${userId}`);
    const data = await res.json();
    set({
      ...data,
      showOfflineModal: data.offlineBonus > 0 || data.offlineOilBonus > 0
    });
  },

  click: async () => {
    const { coins, clickPower } = get();
    set({ coins: coins + clickPower });
    fetch(`${import.meta.env.VITE_API_URL}/game/click?userId=${(window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345}`, { method: 'POST' });
  },

  syncOnline: async (c, o) => {
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/sync?userId=${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ earnedCoins: c, earnedOil: o })
    });
    const data = await res.json();
    if (data) set({ coins: data.coins, oil: data.oil });
  },

  buyUpgrade: async (type) => {
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/upgrade?userId=${userId}&type=${type}`, { method: 'POST' });
    const data = await res.json();
    if (data) set({ ...data });
  },

  loadLeaderboard: async () => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/leaderboard`);
    const data = await res.json();
    set({ leaderboard: data });
  },

  startProcessing: async (amount) => {
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/process-oil?userId=${userId}&amount=${amount}`, { method: 'POST' });
    const data = await res.json();
    if (data) set({ coins: data.coins, oil: data.oil, processingUntil: data.processingUntil });
  },

  closeOfflineModal: () => set({ showOfflineModal: false, offlineBonus: 0, offlineOilBonus: 0 })
}));