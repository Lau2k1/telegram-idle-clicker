import React from 'react';
import { useGameStore } from '../store/gameStore';

const Stats: React.FC = () => {
  const state = useGameStore();
  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-black text-yellow-500 text-center mb-6 uppercase">Твои показатели</h2>
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-[#1a1c2c] p-4 rounded-3xl border border-slate-800">
          <div className="text-slate-400 text-xs uppercase font-bold mb-1">Сила клика</div>
          <div className="text-2xl font-black text-white">{state.clickPower} ⚡</div>
        </div>
        <div className="bg-[#1a1c2c] p-4 rounded-3xl border border-slate-800">
          <div className="text-slate-400 text-xs uppercase font-bold mb-1">Золото в сек (Online)</div>
          <div className="text-2xl font-black text-yellow-500">{state.incomePerSec} 💰</div>
        </div>
        <div className="bg-[#1a1c2c] p-4 rounded-3xl border border-slate-800">
          <div className="text-slate-400 text-xs uppercase font-bold mb-1">Нефть в сек (Online)</div>
          <div className="text-2xl font-black text-blue-400">{state.oilPerSec.toFixed(2)} 🛢️</div>
        </div>
        <div className="bg-[#1a1c2c] p-4 rounded-3xl border border-slate-800">
          <div className="text-slate-400 text-xs uppercase font-bold mb-1">Склад оффлайна</div>
          <div className="text-2xl font-black text-green-400">{state.maxOfflineTime / 3600} ч</div>
        </div>
      </div>
    </div>
  );
};

export default Stats;