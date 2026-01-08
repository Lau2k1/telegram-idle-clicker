import { useEffect, useState, useRef } from 'react';
import { useGameStore } from './store/gameStore';
import Game from './pages/Game';
import Shop from './pages/Shop';
import Leaderboard from './pages/Leaderboard';
import Stats from './pages/Stats';
import OfflineModal from './components/OfflineModal';
import Refinery from './pages/Refinery';
import './App.css';

function App() {
  const { load, incomePerSec, addCoins, syncOnline, showOfflineModal, offlineBonus, closeOfflineModal } = useGameStore();
  const [activePage, setActivePage] = useState('game');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  
  const earnedRef = useRef(0);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      load().finally(() => setIsReady(true));
      isInitialMount.current = false;
    }
  }, [load]);

  // СИСТЕМА ОНЛАЙН ДОХОДА
  useEffect(() => {
    if (!isReady || incomePerSec <= 0) return;

    const tickInterval = setInterval(() => {
      addCoins(incomePerSec);
      earnedRef.current += incomePerSec;
    }, 1000);

    const syncInterval = setInterval(() => {
      if (earnedRef.current > 0) {
        syncOnline(earnedRef.current);
        earnedRef.current = 0;
      }
    }, 30000); // Синхронизация каждые 30 секунд

    return () => {
      clearInterval(tickInterval);
      clearInterval(syncInterval);
      // Синхронизация при закрытии/уходе
      if (earnedRef.current > 0) syncOnline(earnedRef.current);
    };
  }, [isReady, incomePerSec, addCoins, syncOnline]);

  const navigate = (p: string) => { setActivePage(p); setIsMenuOpen(false); };

  if (!isReady) return <div className="h-screen bg-[#0a0c1a] flex items-center justify-center text-yellow-500 font-bold">ЗАГРУЗКА...⌛</div>;

  return (
    <div className="app-container">
      <header className="app-header">
        <button className="menu-toggle" onClick={() => setIsMenuOpen(true)}>
          <span></span><span></span><span></span>
        </button>
        <h1 className="logo text-yellow-500">GOLD MINER</h1>
        <div className="w-8"></div>
      </header>

      <main className="main-content">
        {activePage === 'game' && <Game />}
        {activePage === 'shop' && <Shop />}
        {activePage === 'refinery' && <Refinery />}
        {activePage === 'leaders' && <Leaderboard />}
        {activePage === 'stats' && <Stats />}
      </main>

      <div className={`side-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <div className="side-menu" onClick={e => e.stopPropagation()}>
          <h2 className="text-yellow-500 font-black mb-6 text-xl">МЕНЮ</h2>
          <button onClick={() => navigate('game')} className={`menu-item ${activePage === 'game' ? 'active' : ''}`}>⛏️ Майнинг</button>
          <button onClick={() => navigate('shop')} className={`menu-item ${activePage === 'shop' ? 'active' : ''}`}>🛒 Магазин</button>
          <button onClick={() => navigate('refinery')} className={`menu-item ${activePage === 'refinery' ? 'active' : ''}`}>🏭 Переработка</button>
          <button onClick={() => navigate('leaders')} className={`menu-item ${activePage === 'leaders' ? 'active' : ''}`}>🏆 Лидеры</button>
          <button onClick={() => navigate('stats')} className={`menu-item ${activePage === 'stats' ? 'active' : ''}`}>📊 Статистика</button>
        </div>
      </div>

      {showOfflineModal && <OfflineModal amount={offlineBonus} onClose={closeOfflineModal} />}
    </div>
  );
}

export default App;