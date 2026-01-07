import { useEffect, useState, useRef } from 'react';
import { useGameStore } from './store/gameStore';
import Game from './pages/Game';
import Leaderboard from './pages/Leaderboard';
import Stats from './pages/Stats';
import OfflineModal from './components/OfflineModal';
import './App.css';

function App() {
  const { load, showOfflineModal, offlineBonus, closeOfflineModal } = useGameStore();
  const [isReady, setIsReady] = useState(false);
  const [activePage, setActivePage] = useState('game');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
        tg.headerColor = '#1a1c2c';
        tg.backgroundColor = '#0a0c1a';
      }
      load().finally(() => setIsReady(true));
      isInitialMount.current = false;
    }
  }, [load]);

  const navigate = (page: string) => {
    setActivePage(page);
    setIsMenuOpen(false);
  };

  if (!isReady) return <div className="flex h-screen items-center justify-center bg-[#0a0c1a] text-yellow-500 font-bold">ЗАГРУЗКА...</div>;

  return (
    <div className="app-container">
      <header className="app-header">
        <button className="menu-toggle" onClick={() => setIsMenuOpen(true)}>
          <span></span>
          <span></span>
          <span></span>
        </button>
        <h1 className="logo">GOLD MINER</h1>
        <div className="w-8"></div> {/* Заглушка для центровки */}
      </header>

      <main className="main-content">
        {activePage === 'game' && <Game />}
        {activePage === 'leaders' && <Leaderboard />}
        {activePage === 'stats' && <Stats />}
      </main>

      {/* Меню */}
      <div className={`side-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <div className="side-menu" onClick={e => e.stopPropagation()}>
          <h2 className="text-yellow-500 font-black text-xl mb-4">МЕНЮ</h2>
          <button onClick={() => navigate('game')} className={`menu-item ${activePage === 'game' ? 'active' : ''}`}>
            ⛏️ Майнинг
          </button>
          <button onClick={() => navigate('leaders')} className={`menu-item ${activePage === 'leaders' ? 'active' : ''}`}>
            🏆 Лидерборд
          </button>
          <button onClick={() => navigate('stats')} className={`menu-item ${activePage === 'stats' ? 'active' : ''}`}>
            📊 Статистика
          </button>
        </div>
      </div>
      
      {showOfflineModal && <OfflineModal amount={offlineBonus} onClose={closeOfflineModal} />}
    </div>
  );
}

export default App;