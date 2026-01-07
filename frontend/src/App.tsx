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
        tg.backgroundColor = '#0a0c1a';
        tg.headerColor = '#0a0c1a';
      }
      load().finally(() => setIsReady(true));
      isInitialMount.current = false;
    }
  }, [load]);

  const navigateTo = (page: string) => {
    setActivePage(page);
    setIsMenuOpen(false);
  };

  if (!isReady) return <div className="loading-screen">Загрузка...</div>;

  return (
    <div className="app-container">
      {/* Шапка с кнопкой меню */}
      <header className="app-header">
        <button className="menu-toggle" onClick={() => setIsMenuOpen(true)}>
          <div className="hamburger"></div>
        </button>
        <h1 className="logo">MINER GAME</h1>
        <div style={{width: '40px'}}></div> {/* Для баланса */}
      </header>

      <main className="main-content">
        {activePage === 'game' && <Game />}
        {activePage === 'leaders' && <Leaderboard />}
        {activePage === 'stats' && <Stats />}
      </main>

      {/* Выдвижное Меню */}
      <div className={`side-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <div className="side-menu" onClick={e => e.stopPropagation()}>
          <div className="menu-header">
            <h3>МЕНЮ</h3>
            <button className="close-menu" onClick={() => setIsMenuOpen(false)}>×</button>
          </div>
          <nav className="menu-links">
            <button onClick={() => navigateTo('game')} className={activePage === 'game' ? 'active' : ''}>
              <span>⛏️</span> Главная
            </button>
            <button onClick={() => navigateTo('leaders')} className={activePage === 'leaders' ? 'active' : ''}>
              <span>🏆</span> Лидеры
            </button>
            <button onClick={() => navigateTo('stats')} className={activePage === 'stats' ? 'active' : ''}>
              <span>📊</span> Статистика
            </button>
          </nav>
        </div>
      </div>
      
      {showOfflineModal && <OfflineModal amount={offlineBonus} onClose={closeOfflineModal} />}
    </div>
  );
}

export default App;