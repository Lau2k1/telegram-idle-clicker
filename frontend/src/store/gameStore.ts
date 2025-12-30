import { create } from "zustand";
import { fetchState, clickApi, buyClickApi } from "../api/gameApi";

interface GameState {
  coins: number;
  clickPower: number;
  incomePerSec: number;
  load: () => Promise<void>;
  click: () => Promise<void>;
  buyClick: () => Promise<void>;
}

export const useGameStore = create<GameState>((set) => ({
  coins: 0,
  clickPower: 1,
  incomePerSec: 0,

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
  }
}));
