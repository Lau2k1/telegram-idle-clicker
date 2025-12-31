import { create } from "zustand";
import { fetchState, clickApi, buyClickApi } from "../api/gameApi";


const getTgUserId = () => {
  return window.Telegram?.WebApp?.initDataUnsafe?.user?.id || 0;
};

interface GameState {
  coins: number;
  clickPower: number;
  incomePerSec: number;
  userId?: number;
  username?: string;
  load: () => Promise<void>;
  click: () => Promise<void>;
  buyClick: () => Promise<void>;
  setUserFromTelegram: () => void;
  
}

export const useGameStore = create<GameState>((set) => ({
  coins: 0,
  clickPower: 1,
  incomePerSec: 0,

  load: async () => {
    const userId = getTgUserId();
    if (!userId) return; 
    
    try {
      const s = await fetchState(userId); // Передаем ID
      set({ 
        coins: Number(s.coins), 
        clickPower: s.clickPower, 
        incomePerSec: s.incomePerSec 
      });
    } catch (e) {
      console.error("Ошибка загрузки:", e);
    }
  },

  load: async () => {
    const s = await fetchState();
    set(s);
  },

  click: async () => {
    await clickApi();
    const s = await fetchState();
    set(s);
  },

  buyClick: async () => {
    await buyClickApi();
    const s = await fetchState();
    set(s);
  },
  setUserFromTelegram: () => {
  const tg = window.Telegram?.WebApp;
  const user = tg?.initDataUnsafe?.user;

  if (user) {
    set({
      userId: user.id,
      username: user.username,
    });
  }
}

}));
