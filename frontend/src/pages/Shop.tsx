import React from 'react';
import { useGameStore } from '../store/gameStore';

const Shop: React.FC = () => {
  const { coins, oil, clickPower, incomePerSec, oilPerSec, maxOfflineTime, maxOilOfflineTime, buyUpgrade } = useGameStore();

  const upgrades = [
    { id: 'click', name: 'Мощная кирка', desc: '+1 к клику', price: Math.floor(50 * Math.pow(1.5, clickPower - 1)), curr: 'gold', icon: '⛏️' },
    { id: 'income', name: 'Шахтер', desc: '+5 золота/сек', price: Math.floor(100 * Math.pow(1.3, Math.floor(incomePerSec / 5))), curr: 'gold', icon: '👷' },
    { id: 'limit', name: 'Склад золота', desc: '+1 час хранения', price: Math.floor(500 * Math.pow(2, (maxOfflineTime / 3600) - 1)), curr: 'gold', icon: '📦' },
    { id: 'oilIncome', name: 'Насос', desc: '+0.1 нефти/сек', price: Math.floor(50000 * Math.pow(1.8, oilPerSec * 10)), curr: 'gold', icon: '⛽' },
    { id: 'oilLimit', name: 'Резервуар', desc: '+1 час оффлайна', price: Math.floor(10 * Math.pow(2, (maxOilOfflineTime / 3600) - 1)), curr: 'oil', icon: '🛢️' },
  ];

  return (
    <div className="p-6 pb-24 space-y-4">
      <h2 className="text-2xl font-black text-center text-white mb-6 uppercase">Магазин Улучшений</h2>
      
      {upgrades.map(up => {
        const canAfford = up.curr === 'gold' ? coins >= up.price : oil >= up.price;
        return (
          <div key={up.id} className="bg-[#1a1c2c] p-5 rounded-[32px] border border-slate-800 flex justify-between items-center transition-all active:scale-[0.98]">
            <div className="flex items-center gap-4">
              <div className="text-4xl bg-slate-800 w-16 h-16 rounded-2xl flex items-center justify-center">{up.icon}</div>
              <div>
                <div className="font-bold text-white text-lg">{up.name}</div>
                <div className="text-slate-400 text-xs mb-1">{up.desc}</div>
                <div className={`font-black ${up.curr === 'gold' ? 'text-yellow-500' : 'text-blue-400'}`}>
                  {up.price.toLocaleString()} {up.curr === 'gold' ? '💰' : '🛢️'}
                </div>
              </div>
            </div>
            <button 
              onClick={() => buyUpgrade(up.id)}
              disabled={!canAfford}
              className={`px-6 py-3 rounded-2xl font-black text-sm uppercase transition-all ${
                canAfford ? 'bg-white text-black' : 'bg-slate-800 text-slate-600'
              }`}
            >
              Купить
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default Shop;