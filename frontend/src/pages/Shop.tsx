import React from 'react';
import { useGameStore } from '../store/gameStore';

const Shop: React.FC = () => {
  const { coins, clickPower, incomePerSec, maxOfflineTime, buyUpgrade } = useGameStore();

  const upgrades = [
    { id: 'click', name: 'Мощный Клик', desc: '+1 за клик', price: clickPower * 50, icon: '⚡' },
    { id: 'income', name: 'Бригада', desc: '+5/сек доход', price: (incomePerSec / 5 + 1) * 100, icon: '👷' },
    { id: 'limit', name: 'Хранилище', desc: '+1 час оффлайна', price: (maxOfflineTime / 3600) * 500, icon: '📦' },
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-black text-yellow-500 text-center mb-6">МАГАЗИН</h2>
      {upgrades.map(u => (
        <div key={u.id} className="bg-[#1a1c2c] border border-slate-700 p-4 rounded-3xl flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{u.icon}</span>
            <div>
              <div className="font-bold text-white">{u.name}</div>
              <div className="text-xs text-slate-400">{u.desc}</div>
            </div>
          </div>
          <button 
            onClick={() => buyUpgrade(u.id as any)}
            disabled={coins < u.price}
            className={`px-4 py-2 rounded-xl font-bold ${coins >= u.price ? 'bg-yellow-500 text-black' : 'bg-slate-800 text-slate-500'}`}
          >
            {u.price} 💰
          </button>
        </div>
      ))}
    </div>
  );
};

export default Shop;