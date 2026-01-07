import { useEffect, useState, useRef } from 'react';
import { useGameStore } from './store/gameStore';
import Game from './pages/Game';
import Shop from './pages/Shop';
import Leaderboard from './pages/Leaderboard';
import Stats from './pages/Stats';
import OfflineModal from './components/OfflineModal';
import './App.css';

function App() {
  const { load, showOfflineModal, offlineBonus, closeOfflineModal } = useGameStore();
  const [activePage, setActivePage] = useState('game');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      load().finally(() => setIsReady(true));
      isInitialMount.current = false;
    }
  }, [load]);

  const navigate = (p: string) => { setActivePage(p); setIsMenuOpen(false); };

  if (!isReady) return <div className="h-screen bg-[#0a0c1a] flex items-center justify-center text-yellow-500">ЗАГРУЗКА...</div>;

  return (
    <div className="app-container">
      <header className="app-header">
        <button className="menu-toggle" onClick={() => setIsMenuOpen(true)}>
          <span></span><span></span><span></span>
        </button>
        <h1 className="logo">GOLD MINER</h1>
        <div className="w-8"></div>
      </header>

      <main className="main-content">
        {activePage === 'game' && <Game />}
        {activePage === 'shop' && <Shop />}
        {activePage === 'leaders' && <Leaderboard />}
        {activePage === 'stats' && <Stats />}
      </main>

      <div className={`side-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <div className="side-menu" onClick={e => e.stopPropagation()}>
          <h2 className="text-yellow-500 font-black mb-6">МЕНЮ</h2>
          <button onClick={() => navigate('game')} className="menu-item">⛏️ Майнинг</button>
          <button onClick={() => navigate('shop')} className="menu-item">🛒 Магазин</button>
          <button onClick={() => navigate('leaders')} className="menu-item">🏆 Лидеры</button>
          <button onClick={() => navigate('stats')} className="menu-item">📊 Статистика</button>
        </div>
      </div>

      {showOfflineModal && <OfflineModal amount={offlineBonus} onClose={closeOfflineModal} />}
    </div>
  );
}

export default App;