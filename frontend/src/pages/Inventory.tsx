import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const Inventory: React.FC = () => {
  const { inventory, useItem } = useGameStore();
  const [activeTab, setActiveTab] = useState<'ALL' | 'ACCELERATORS'>('ALL');

  const getItemName = (id: string) => {
    // Map IDs to readable names if possible, or format
    const names: Record<string, string> = {
      time_warp_1m: "Ускоритель (1 мин)",
      time_warp_3m: "Ускоритель (3 мин)",
      time_warp_15m: "Ускоритель (15 мин)",
      time_warp_1h: "Ускоритель (1 ч)",
      time_warp_4h: "Ускоритель (4 ч)",
      time_warp_8h: "Ускоритель (8 ч)",
      time_warp_15h: "Ускоритель (15 ч)",
      time_warp_24h: "Ускоритель (24 ч)",
      time_warp_3d: "Ускоритель (3 дн)",
      time_warp_7d: "Ускоритель (7 дн)",
    };
    return names[id] || id.replace(/_/g, ' ').toUpperCase();
  };

  const filteredInventory = inventory.filter(item => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'ACCELERATORS') return item.itemId.startsWith('time_warp');
    return true;
  });

  return (
    <div className="inventory-page p-4 pb-24 animate-in fade-in duration-300">
      <h1 className="text-2xl font-black uppercase tracking-tighter text-blue-400 mb-6 text-center">
        Сумка Шахтёра
      </h1>

      {/* Tabs */}
      <div className="flex p-1 bg-white/5 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('ALL')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'ALL' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          Все
        </button>
        <button
          onClick={() => setActiveTab('ACCELERATORS')}
          className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
            activeTab === 'ACCELERATORS' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:bg-white/5'
          }`}
        >
          Ускорители
        </button>
      </div>
      
      {filteredInventory.length === 0 ? (
        <div className="text-center text-slate-500 mt-10">
          <div className="text-6xl mb-4 opacity-20">🎒</div>
          <p className="font-bold">В твоей сумке пусто.</p>
          <p className="text-xs mt-2 opacity-60">Покупай предметы в магазине</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {filteredInventory.map((item) => (
            <div key={item.id} className="bg-white/5 p-4 rounded-2xl border border-white/10 flex flex-col items-center relative group">
              <div className="text-4xl mb-3 bg-white/5 w-16 h-16 rounded-full flex items-center justify-center">
                {item.itemId.startsWith('time_warp') ? '⚡' : '📦'}
              </div>
              <span className="text-sm font-bold text-center text-white leading-tight mb-1">
                {getItemName(item.itemId)}
              </span>
              <span className="text-xs text-slate-400 mb-3">
                Количество: <span className="text-white font-bold">{item.quantity}</span>
              </span>
              
              <button
                onClick={() => useItem(item.itemId)}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 active:scale-95 rounded-xl text-xs font-black uppercase transition-all"
              >
                Использовать
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inventory;
