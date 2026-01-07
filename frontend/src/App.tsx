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
  const [activeTab, setActiveTab] = useState('game'); // 'game', 'leaders', 'stats'
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
      }
      load().finally(() => setIsReady(true));
      isInitialMount.current = false;
    }
  }, [load]);

  if (!isReady) return <div className="loading">Загрузка...</div>;

  return (
    <div className="app-wrapper">
      <div className="content-area">
        {activeTab === 'game' && <Game />}
        {activeTab === 'leaders' && <Leaderboard />}
        {activeTab === 'stats' && <Stats />}
      </div>

      {/* Нижнее меню навигации */}
      <nav className="tab-bar">
        <button 
          className={`tab-item ${activeTab === 'game' ? 'active' : ''}`}
          onClick={() => setActiveTab('game')}
        >
          <span className="tab-icon">⛏️</span>
          <span>Игра</span>
        </button>
        
        <button 
          className={`tab-item ${activeTab === 'leaders' ? 'active' : ''}`}
          onClick={() => setActiveTab('leaders')}
        >
          <span className="tab-icon">🏆</span>
          <span>Лидеры</span>
        </button>

        <button 
          className={`tab-item ${activeTab === 'stats' ? 'active' : ''}`}
          onClick={() => setActiveTab('stats')}
        >
          <span className="tab-icon">📊</span>
          <span>Инфо</span>
        </button>
      </nav>
      
      {showOfflineModal && (
        <OfflineModal amount={offlineBonus} onClose={closeOfflineModal} />
      )}
    </div>
  );
}

export default App;