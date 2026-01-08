import React from 'react';
import { useGameStore } from '../store/gameStore';

const Shop: React.FC = () => {
  const { isBoostActive, boostUntil, buyBoost, buyUpgrade, coins, oil, clickPower, incomePerSec } = useGameStore();

  const upgrades = [
    { id: 'click', name: 'Кирка', price: Math.floor(50 * Math.pow(1.5, clickPower - 1)), curr: 'gold' },
    { id: 'income', name: 'Шахтер', price: Math.floor(100 * Math.pow(1.3, Math.floor(incomePerSec / 5))), curr: 'gold' },
  ];

  return (
    <div className="p-6 pb-24 space-y-4">
      {/* СЕКЦИЯ БУСТА */}
      <div className={`p-6 rounded-[35px] border-2 transition-all ${isBoostActive ? 'border-yellow-500 bg-yellow-500/10' : 'border-slate-800 bg-slate-900/50'}`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-white">X2 ДОХОД 🚀</h3>
            <p className="text-slate-400 text-xs uppercase tracking-tighter">На 24 часа</p>
          </div>
          {isBoostActive ? (
            <div className="bg-yellow-500 text-black px-4 py-2 rounded-2xl font-black text-xs">
              АКТИВНО
            </div>
          ) : (
            <button onClick={buyBoost} className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-900/40">
              50 ⭐️
            </button>
          )}
        </div>
      </div>

      {/* ОБЫЧНЫЕ УЛУЧШЕНИЯ */}
      {upgrades.map(up => (
        <div key={up.id} className="bg-[#1a1c2c] p-4 rounded-3xl flex justify-between items-center border border-slate-800">
           <div className="text-white font-bold">{up.name}</div>
           <button onClick={() => buyUpgrade(up.id)} className="bg-white text-black px-4 py-2 rounded-xl font-bold">
             {up.price} 💰
           </button>
        </div>
      ))}
    </div>
  );
};