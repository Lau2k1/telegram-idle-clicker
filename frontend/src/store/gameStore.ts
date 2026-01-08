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
  oilPerSec: number;
  maxOfflineTime: number;
  processingUntil: string | null;
  offlineBonus: number;
  offlineOilBonus: number;
  showOfflineModal: boolean;
  
  load: () => Promise<void>;
  addResources: (c: number, o: number) => void;
  click: () => Promise<void>;
  syncOnline: (c: number, o: number) => Promise<void>;
  buyUpgrade: (type: string) => Promise<void>;
  startProcessing: (amount: number) => Promise<void>;
  closeOfflineModal: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  coins: 0, oil: 0, clickPower: 1, incomePerSec: 0, oilPerSec: 0,
  maxOfflineTime: 3600, processingUntil: null, 
  offlineBonus: 0, offlineOilBonus: 0, showOfflineModal: false,

  addResources: (c, o) => set(s => ({ coins: s.coins + c, oil: s.oil + o })),

  load: async () => {
    const userId = getTelegramUserId();
    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/state?userId=${userId}`);
    const data = await res.json();
    set({
      coins: data.coins,
      oil: data.oil,
      clickPower: data.clickPower,
      incomePerSec: data.incomePerSec,
      oilPerSec: data.oilPerSec,
      maxOfflineTime: data.maxOfflineTime,
      processingUntil: data.processingUntil,
      offlineBonus: data.offlineBonus,
      offlineOilBonus: data.offlineOilBonus,
      showOfflineModal: data.offlineBonus > 0 || data.offlineOilBonus > 0
    });
  },

  click: async () => {
    const { coins, clickPower } = get();
    set({ coins: coins + clickPower });
    await fetch(`${import.meta.env.VITE_API_URL}/game/click?userId=${getTelegramUserId()}`, { method: 'POST' });
  },

  syncOnline: async (c, o) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/sync?userId=${getTelegramUserId()}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ earnedCoins: c, earnedOil: o })
    });
    const data = await res.json();
    if (data) set({ coins: data.coins, oil: data.oil });
  },

  buyUpgrade: async (type) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/upgrade?userId=${getTelegramUserId()}&type=${type}`, { method: 'POST' });
    const data = await res.json();
    if (data) set({ ...data });
  },

  startProcessing: async (amount) => {
    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/process-oil?userId=${getTelegramUserId()}&amount=${amount}`, { method: 'POST' });
    const data = await res.json();
    if (data) set({ coins: data.coins, oil: data.oil, processingUntil: data.processingUntil });
  },

  closeOfflineModal: () => set({ showOfflineModal: false })
}));