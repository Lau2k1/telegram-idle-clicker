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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const unsyncedCoins = useRef(0);
  const unsyncedOil = useRef(0);

  useEffect(() => {
    load();
    const visualInterval = setInterval(() => {
      const state = useGameStore.getState();
      const multiplier = state.isBoostActive ? 2 : 1;
      const goldStep = (state.incomePerSec / 10) * multiplier;
      const oilStep = state.oilPerSec / 10;

      if (goldStep > 0 || oilStep > 0) {
        addResources(goldStep, oilStep);
        unsyncedCoins.current += goldStep;
        unsyncedOil.current += oilStep;
      }
    }, 100);

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

  const navItems = [
    { id: 'planets', label: 'Земля (Добыча)', icon: '🌍' },
    { id: 'oil', label: 'Нефтяная вышка', icon: '🛢️' },
    { id: 'refinery', label: 'Завод', icon: '🏭' },
    { id: 'shop', label: 'Магазин', icon: '🛒' },
    { id: 'leaderboard', label: 'Рейтинг', icon: '🏆' },
    { id: 'stats', label: 'Статистика', icon: '📊' },
  ];

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

  const handlePageSelect = (id: string) => {
    setActivePage(id);
    setIsMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-white select-none font-sans overflow-hidden">
      <OfflineModal />
      
      {/* HEADER: Ресурсы текущей планеты */}
      <div className="fixed top-0 left-0 right-0 p-4 flex justify-between bg-black/40 backdrop-blur-md z-40 border-b border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] text-yellow-500/70 uppercase font-black tracking-widest">Earth Resources</span>
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <span className="font-black text-xl tracking-tighter">
              {useGameStore(s => Math.floor(s.coins).toLocaleString())}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-blue-400/70 uppercase font-black tracking-widest">Crude Oil</span>
          <div className="flex items-center gap-2">
            <span className="font-black text-xl text-blue-400">
              {useGameStore(s => s.oil.toFixed(2))}
            </span>
            <span className="text-xl">🛢️</span>
          </div>
        </div>
      </div>

      <main className="h-screen overflow-y-auto">
        {renderPage()}
      </main>

      {/* КНОПКА ОТКРЫТИЯ МЕНЮ */}
      <button 
        onClick={() => setIsMenuOpen(true)}
        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-blue-600 rounded-full border-4 border-[#0f111a] shadow-[0_0_20px_rgba(37,99,235,0.5)] flex items-center justify-center text-3xl z-50 active:scale-90 transition-transform"
      >
        🚀
      </button>

      {/* ШТОРКА МЕНЮ (OVERLAY) */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] flex flex-col p-6 animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-black uppercase tracking-tighter text-blue-400">Навигация</h2>
            <button 
              onClick={() => setIsMenuOpen(false)}
              className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handlePageSelect(item.id)}
                className={`flex items-center gap-4 p-5 rounded-[24px] transition-all border ${
                  activePage === item.id 
                  ? 'bg-blue-600 border-blue-400 shadow-lg' 
                  : 'bg-white/5 border-white/5 active:bg-white/10'
                }`}
              >
                <span className="text-3xl">{item.icon}</span>
                <div className="text-left">
                  <div className="font-bold text-lg">{item.label}</div>
                  <div className="text-[10px] uppercase opacity-50 tracking-widest">Перейти в раздел</div>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-auto text-center p-4 border-t border-white/5">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              В разработке: Марс, Луна, Венера 🚀
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;