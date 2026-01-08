import { create } from "zustand";

interface GameState {
  coins: number;
  oil: number;
  clickPower: number;
  incomePerSec: number;
  oilPerSec: number;
  isBoostActive: boolean;
  boostUntil: string | null;
  offlineBonus: number;
  offlineOilBonus: number;
  showOfflineModal: boolean;
  load: () => Promise<void>;
  addResources: (c: number, o: number) => void;
  click: () => Promise<void>;
  syncOnline: (c: number, o: number) => Promise<void>;
  closeOfflineModal: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  coins: 0, oil: 0, clickPower: 1, incomePerSec: 0, oilPerSec: 0,
  isBoostActive: false, boostUntil: null, 
  offlineBonus: 0, offlineOilBonus: 0, showOfflineModal: false,

  addResources: (c, o) => set(s => ({ 
    coins: Number((s.coins + c).toFixed(4)), 
    oil: Number((s.oil + o).toFixed(4)) 
  })),

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
    const { coins, clickPower, isBoostActive } = get();
    const multiplier = isBoostActive ? 2 : 1;
    const addedValue = clickPower * multiplier;
    
    set({ coins: coins + addedValue });

    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    fetch(`${import.meta.env.VITE_API_URL}/game/click?userId=${userId}`, { method: 'POST' });
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

  closeOfflineModal: () => set({ showOfflineModal: false, offlineBonus: 0, offlineOilBonus: 0 })
}));