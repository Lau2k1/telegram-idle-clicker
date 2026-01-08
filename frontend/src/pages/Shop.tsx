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
      <div className={`p-6 rounded-[35px] border-2 transition-all ${isBoostActive ? 'border-yellow-500 bg-yellow-500/10 shadow-[0_0_20px_rgba(234,179,8,0.2)]' : 'border-slate-800 bg-[#1a1c2c]'}`}>
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-white italic">X2 BOOST 🚀</h3>
            <p className="text-slate-400 text-[10px] uppercase tracking-tighter">На 24 часа</p>
          </div>
          {isBoostActive ? (
            <div className="text-right">
              <div className="text-yellow-500 font-black text-xs">АКТИВЕН</div>
              <div className="text-white text-[10px] opacity-50">
                до {new Date(boostUntil!).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          ) : (
            <button 
              onClick={buyBoost} 
              className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-900/40 transition-transform active:scale-90"
            >
              50 ⭐️
            </button>
          )}
        </div>
      </div>

      {/* ЗАГОЛОВОК УЛУЧШЕНИЙ */}
      <h3 className="text-slate-500 text-xs font-bold uppercase tracking-widest ml-2">Оборудование</h3>

      {/* ОБЫЧНЫЕ УЛУЧШЕНИЯ */}
      <div className="space-y-3">
        {upgrades.map(up => {
          const canAfford = coins >= up.price;
          return (
            <div key={up.id} className="bg-[#1a1c2c] p-5 rounded-[28px] flex justify-between items-center border border-slate-800">
               <div>
                 <div className="text-white font-bold">{up.name}</div>
                 <div className="text-yellow-500 font-black text-sm">{up.price.toLocaleString()} 💰</div>
               </div>
               <button 
                 onClick={() => buyUpgrade(up.id)} 
                 disabled={!canAfford}
                 className={`px-6 py-2 rounded-xl font-bold transition-all ${canAfford ? 'bg-white text-black active:scale-95' : 'bg-slate-800 text-slate-600'}`}
               >
                 КУПИТЬ
               </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ВОТ ЭТА СТРОКА ИСПРАВЛЯЕТ ОШИБКУ:
export default Shop;