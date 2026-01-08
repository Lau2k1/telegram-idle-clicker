import { create } from "zustand";

interface GameState {
  // Базовые ресурсы
  coins: number;
  oil: number;
  fuel: number;
  
  // Характеристики (доход в секунду)
  clickPower: number;
  incomePerSec: number;
  oilPerSec: number;
  maxOfflineTime: number;
  maxOilOfflineTime: number;
  
  // Буст x2
  isBoostActive: boolean;
  boostUntil: string | null;
  
  // Офлайн доход
  offlineBonus: number;
  offlineOilBonus: number;
  offlineSeconds: number;
  showOfflineModal: boolean;

  // Очередь переработки (Раздельные поля)
  refiningOilUntil: string | null;
  refiningFuelUntil: string | null;
  refiningOilAmount: number;
  refiningFuelAmount: number;

  // Методы управления
  load: () => Promise<void>;
  addResources: (c: number, o: number) => void;
  click: () => Promise<void>;
  syncOnline: (c: number, o: number) => Promise<void>;
  buyUpgrade: (type: string) => Promise<void>;
  buyBoost: () => Promise<void>;
  closeOfflineModal: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  coins: 0,
  oil: 0,
  fuel: 0,
  clickPower: 1,
  incomePerSec: 0,
  oilPerSec: 0,
  maxOfflineTime: 3600,
  maxOilOfflineTime: 3600,
  isBoostActive: false,
  boostUntil: null,
  offlineBonus: 0,
  offlineOilBonus: 0,
  offlineSeconds: 0,
  showOfflineModal: false,
  refiningOilUntil: null,
  refiningFuelUntil: null,
  refiningOilAmount: 0,
  refiningFuelAmount: 0,

  // Локальное добавление (используется в App.tsx для тиков)
  addResources: (c, o) => set(s => ({ 
    coins: Number((s.coins + c).toFixed(4)), 
    oil: Number((s.oil + o).toFixed(4)) 
  })),

  // Загрузка состояния с сервера
  load: async () => {
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/state?userId=${userId}`);
      const data = await res.json();
      
      set((state) => ({
        ...data,
        // Проверка: множитель x2 активен, если сервер прислал true
        isBoostActive: data.isBoostActive,
        // Окно открывается сервером, но не закрывается при фоновых обновлениях
        showOfflineModal: state.showOfflineModal || (data.offlineBonus > 0 || data.offlineOilBonus > 0)
      }));
    } catch (e) {
      console.error("Critical: Load failed", e);
    }
  },

  // Клик по планете с учетом буста
  click: async () => {
    const { coins, clickPower, isBoostActive } = get();
    const multiplier = isBoostActive ? 2 : 1;
    const addedValue = clickPower * multiplier;
    
    set({ coins: coins + addedValue });
    
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    // Сервер сам пересчитает клик на своей стороне
    fetch(`${import.meta.env.VITE_API_URL}/game/click?userId=${userId}`, { method: 'POST' });
  },

  // Синхронизация накопленного прогресса
  syncOnline: async (earnedCoins, earnedOil) => {
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/sync?userId=${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ earnedCoins, earnedOil })
      });
      const data = await res.json();
      
      if (data) {
        set((state) => ({ 
          ...data,
          // Важно: Сохраняем текущую видимость модалки
          showOfflineModal: state.showOfflineModal 
        }));
      }
    } catch (e) {
      console.warn("Sync failed - check connection");
    }
  },

  // Улучшения
  buyUpgrade: async (type) => {
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/upgrade?userId=${userId}&type=${type}`, { method: 'POST' });
      const data = await res.json();
      if (data && !data.error) set({ ...data });
    } catch (e) {
      console.error("Upgrade failed");
    }
  },

  // Покупка буста x2 (Telegram Stars)
  buyBoost: async () => {
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    const tg = (window as any).Telegram?.WebApp;
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/game/create-boost-invoice?userId=${userId}`, { method: 'POST' });
      const { invoiceLink } = await res.json();
      
      if (invoiceLink) {
        tg.openInvoice(invoiceLink, async (status: string) => {
          if (status === 'paid' || status === 'pending') {
            // После оплаты принудительно активируем буст
            const actRes = await fetch(`${import.meta.env.VITE_API_URL}/game/activate-boost?userId=${userId}`, { method: 'POST' });
            const newData = await actRes.json();
            set({ ...newData });
          }
        });
      }
    } catch (e) {
      console.error("Payment flow failed");
    }
  },

  // Закрытие офлайн-окна и сброс его данных
  closeOfflineModal: () => {
    set({ 
      showOfflineModal: false, 
      offlineBonus: 0, 
      offlineOilBonus: 0,
      offlineSeconds: 0 
    });
  }
}));