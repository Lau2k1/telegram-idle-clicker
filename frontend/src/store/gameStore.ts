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
  buyUpgrade: (type: string) => Promise<void>;
  buyBoost: () => Promise<void>;
  closeOfflineModal: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  coins: 0, oil: 0, clickPower: 1, incomePerSec: 0, oilPerSec: 0,
  isBoostActive: false, boostUntil: null, 
  offlineBonus: 0, offlineOilBonus: 0, showOfflineModal: false,

  addResources: (c, o) => set(s => ({ 
    coins: s.coins + c, 
    oil: s.oil + o 
  })),

  load: async () => {
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/state?userId=${userId}`);
    const data = await res.json();
    set({
      ...data,
      showOfflineModal: (data.offlineBonus > 0 || data.offlineOilBonus > 0)
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

  buyUpgrade: async (type) => {
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/upgrade?userId=${userId}&type=${type}`, { method: 'POST' });
    const data = await res.json();
    if (data) set({ ...data });
  },

  buyBoost: async () => {
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    const tg = (window as any).Telegram?.WebApp;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/create-boost-invoice?userId=${userId}`, { method: 'POST' });
      const { invoiceLink } = await res.json();
      
      tg.openInvoice(invoiceLink, async (status: string) => {
        if (status === 'paid' || status === 'pending') {
          const actRes = await fetch(`${import.meta.env.VITE_API_URL}/game/activate-boost?userId=${userId}`, { method: 'POST' });
          const newData = await actRes.json();
          set({ ...newData });
          tg.showAlert("Буст x2 активирован!");
        }
      });
    } catch (e) {
      tg.showAlert("Ошибка оплаты");
    }
  },

  closeOfflineModal: () => set({ showOfflineModal: false, offlineBonus: 0, offlineOilBonus: 0 })
}));