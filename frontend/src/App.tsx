import { useEffect, useRef, useState } from 'react';
import { useGameStore } from './store/gameStore';
import Game from './pages/Game';
import Shop from './pages/Shop';
import OilMine from './pages/OilMine';
import Refinery from './pages/Refinery'; // Добавлено
import Leaderboard from './pages/Leaderboard';
import Stats from './pages/Stats'; // Добавлено
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

    // Синхронизация накопленного с сервером раз в 10 секунд
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
      case 'refinery': return <Refinery />; // Добавлено
      case 'leaderboard': return <Leaderboard />;
      case 'stats': return <Stats />; // Добавлено
      default: return <Game />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-white select-none font-sans">
      <OfflineModal />
      
      {/* Шапка с балансом */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between bg-[#0f111a]/80 backdrop-blur-lg z-50 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-xl">💰</span>
          <span className="font-black text-lg tracking-tight">
            {useGameStore(s => Math.floor(s.coins).toLocaleString())}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xl">🛢️</span>
          <span className="font-black text-lg text-blue-400">
            {useGameStore(s => s.oil.toFixed(2))}
          </span>
        </div>
      </div>

      <main className="pt-20 pb-24">
        {renderPage()}
      </main>

      {/* Навигация на основе вашего файла */}
      <nav className="fixed bottom-6 left-6 right-6 bg-[#1a1c2c]/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-2 flex justify-between items-center z-50 shadow-2xl">
        <button onClick={() => setActivePage('planets')} className={`flex-1 py-4 rounded-2xl ${activePage === 'planets' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>🌍</button>
        <button onClick={() => setActivePage('oil')} className={`flex-1 py-4 rounded-2xl ${activePage === 'oil' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>🛢️</button>
        <button onClick={() => setActivePage('shop')} className={`flex-1 py-4 rounded-2xl ${activePage === 'shop' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>🛒</button>
        <button onClick={() => setActivePage('leaderboard')} className={`flex-1 py-4 rounded-2xl ${activePage === 'leaderboard' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>🏆</button>
        <button onClick={() => setActivePage('stats')} className={`flex-1 py-4 rounded-2xl ${activePage === 'stats' ? 'bg-white/10 text-white' : 'text-slate-500'}`}>📊</button>
      </nav>
    </div>
  );
}

export default App;