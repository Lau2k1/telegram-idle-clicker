import { useEffect, useRef, useState } from 'react';
import { useGameStore } from './store/gameStore';
import Game from './pages/Game';
import Shop from './pages/Shop';
import OilMine from './pages/OilMine';
import Refinery from './pages/Refinery';
import Leaderboard from './pages/Leaderboard';
import Stats from './pages/Stats';
import OfflineModal from './components/OfflineModal';

function App() {
  const { load, incomePerSec, oilPerSec, addResources, syncOnline, isBoostActive } = useGameStore();
  const [activePage, setActivePage] = useState('planets');
  const unsyncedCoins = useRef(0);
  const unsyncedOil = useRef(0);

  useEffect(() => {
    load();
    
    // Плавное визуальное обновление ресурсов (10 раз в секунду)
    const visualInterval = setInterval(() => {
      const state = useGameStore.getState();
      const multiplier = state.isBoostActive ? 2 : 1;
      
      const goldToAdd = (state.incomePerSec / 10) * multiplier;
      const oilToAdd = state.oilPerSec / 10;

      if (goldToAdd > 0 || oilToAdd > 0) {
        addResources(goldToAdd, oilToAdd);
        unsyncedCoins.current += goldToAdd;
        unsyncedOil.current += oilToAdd;
      }
    }, 100);

    // Синхронизация с сервером раз в 10 секунд
    const syncInterval = setInterval(() => {
      if (unsyncedCoins.current > 0 || unsyncedOil.current > 0) {
        syncOnline(unsyncedCoins.current, unsyncedOil.current);
        unsyncedCoins.current = 0;
        unsyncedOil.current = 0;
      }
    }, 10000);

    return () => {
      clearInterval(visualInterval);
      clearInterval(syncInterval);
    };
  }, [incomePerSec, oilPerSec, isBoostActive]);

  const renderPage = () => {
    switch (activePage) {
      case 'planets': return <Game />;
      case 'shop': return <Shop />;
      case 'oil': return <OilMine />;
      case 'refinery': return <Refinery />;
      case 'leaderboard': return <Leaderboard />;
      case 'stats': return <Stats />;
      default: return <Game />;
    }
  };

  const navItems = [
    { id: 'planets', label: 'Главная', icon: '🌍' },
    { id: 'oil', label: 'Добыча', icon: '🛢️' },
    { id: 'refinery', label: 'Завод', icon: '🏭' },
    { id: 'shop', label: 'Магазин', icon: '🛒' },
    { id: 'leaderboard', label: 'Топ', icon: '🏆' },
    { id: 'stats', label: 'Инфо', icon: '📊' },
  ];

  return (
    <div className="min-h-screen bg-[#0f111a] text-white select-none font-sans overflow-hidden">
      <OfflineModal />
      
      {/* Верхняя панель (Header) */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between bg-[#0f111a]/90 backdrop-blur-xl z-50 border-b border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Баланс</span>
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">💰</span>
            <span className="font-black text-lg tracking-tighter">
              {useGameStore(s => Math.floor(s.coins).toLocaleString())}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Нефть</span>
          <div className="flex items-center gap-1">
            <span className="font-black text-lg text-blue-400">
              {useGameStore(s => s.oil.toFixed(2))}
            </span>
            <span>🛢️</span>
          </div>
        </div>
      </div>

      {/* Основной контент */}
      <main className="pt-24 pb-32 h-screen overflow-y-auto px-4">
        {renderPage()}
      </main>

      {/* НОВОЕ МЕНЮ СНИЗУ (Scrollable Tabs) */}
      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-black via-[#0f111a] to-transparent pt-10 pb-6 px-4 z-50">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActivePage(item.id)}
              className={`flex items-center gap-3 px-6 py-3 rounded-2xl whitespace-nowrap transition-all duration-300 border ${
                activePage === item.id 
                ? 'bg-blue-600 border-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.4)] scale-105' 
                : 'bg-[#1a1c2c] border-white/5 text-slate-400'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className={`text-sm font-bold ${activePage === item.id ? 'text-white' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}

export default App;