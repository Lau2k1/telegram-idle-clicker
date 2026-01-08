import { create } from "zustand";

interface GameState {
  coins: number;
  oil: number;
  clickPower: number;
  incomePerSec: number;
  boostUntil: string | null;
  isBoostActive: boolean;
  offlineBonus: number;
  offlineOilBonus: number;
  showOfflineModal: boolean;
  load: () => Promise<void>;
  click: () => Promise<void>;
  buyUpgrade: (type: string) => Promise<void>;
  buyBoost: () => Promise<void>;
  closeOfflineModal: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  coins: 0, oil: 0, clickPower: 1, incomePerSec: 0,
  boostUntil: null, isBoostActive: false,
  offlineBonus: 0, offlineOilBonus: 0, showOfflineModal: false,

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
    const power = isBoostActive ? clickPower * 2 : clickPower;
    set({ coins: coins + power });
    
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    fetch(`${import.meta.env.VITE_API_URL}/game/click?userId=${userId}`, { method: 'POST' });
  },

  buyBoost: async () => {
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    const tg = (window as any).Telegram?.WebApp;

    try {
      // 1. Запрашиваем инвойс у бэкенда
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/create-boost-invoice?userId=${userId}`, { method: 'POST' });
      const { invoiceLink } = await res.json();

      // 2. Открываем окно оплаты Telegram Stars
      tg.openInvoice(invoiceLink, async (status: string) => {
        if (status === 'paid' || status === 'pending') {
          // 3. Активируем буст
          const actRes = await fetch(`${import.meta.env.VITE_API_URL}/game/activate-boost?userId=${userId}`, { method: 'POST' });
          const newData = await actRes.json();
          set({ boostUntil: newData.boostUntil, isBoostActive: true });
          tg.showAlert("Ускорение x2 активировано на 24 часа!");
        }
      });
    } catch (e) {
      tg.showAlert("Ошибка при создании платежа");
    }
  },

  buyUpgrade: async (type) => {
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    const res = await fetch(`${import.meta.env.VITE_API_URL}/game/upgrade?userId=${userId}&type=${type}`, { method: 'POST' });
    const data = await res.json();
    if (data) set({ ...data });
  },

  closeOfflineModal: () => set({ showOfflineModal: false, offlineBonus: 0, offlineOilBonus: 0 })
}));