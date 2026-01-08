import { useEffect, useState, useRef } from 'react';
import { useGameStore } from './store/gameStore';
import OfflineModal from './components/OfflineModal';
import PlanetSelection from './pages/PlanetSelection';
import MineSelection from './pages/MineSelection';
import Game from './pages/Game';
import OilMine from './pages/OilMine';
import Refinery from './pages/Refinery';
import Shop from './pages/Shop';
import Leaderboard from './pages/Leaderboard';
import Stats from './pages/Stats';
import './App.css';

function App() {
  const { load, incomePerSec, oilPerSec, addResources, syncOnline, showOfflineModal } = useGameStore();
  const [activePage, setActivePage] = useState('planets');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const earnedCoins = useRef(0);
  const earnedOil = useRef(0);

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const tick = setInterval(() => {
      addResources(incomePerSec, oilPerSec);
      earnedCoins.current += incomePerSec;
      earnedOil.current += oilPerSec;
    }, 1000);

    const sync = setInterval(() => {
      if (earnedCoins.current > 0 || earnedOil.current > 0) {
        syncOnline(earnedCoins.current, earnedOil.current);
        earnedCoins.current = 0; earnedOil.current = 0;
      }
    }, 30000);

    return () => { clearInterval(tick); clearInterval(sync); };
  }, [incomePerSec, oilPerSec, addResources, syncOnline]);

  const navigate = (p: string) => { setActivePage(p); setIsMenuOpen(false); };

  return (
    <div className="app-container">
      <OfflineModal />
      <header className="app-header">
        <button className="menu-toggle" onClick={() => setIsMenuOpen(true)}>
           <span></span><span></span><span></span>
        </button>
        <h1 className="logo text-yellow-500">PLANET MINER</h1>
        <div className="w-8"></div>
      </header>

      <main className="main-content">
        {activePage === 'planets' && <PlanetSelection onSelect={() => setActivePage('mines')} />}
        {activePage === 'mines' && <MineSelection 
            onSelectGold={() => setActivePage('game')} 
            onSelectOil={() => setActivePage('oil-mine')} 
            onBack={() => setActivePage('planets')}
        />}
        {activePage === 'game' && <Game />}
        {activePage === 'oil-mine' && <OilMine />}
        {activePage === 'refinery' && <Refinery />}
        {activePage === 'shop' && <Shop />}
        {activePage === 'leaders' && <Leaderboard />}
        {activePage === 'stats' && <Stats />}
      </main>

      <div className={`side-menu-overlay ${isMenuOpen ? 'open' : ''}`} onClick={() => setIsMenuOpen(false)}>
        <div className="side-menu" onClick={e => e.stopPropagation()}>
          <h2 className="text-yellow-500 font-black mb-6 text-xl">МЕНЮ</h2>
          <button onClick={() => navigate('planets')} className="menu-item">🪐 Планеты</button>
          <button onClick={() => navigate('refinery')} className="menu-item">🏭 Завод</button>
          <button onClick={() => navigate('shop')} className="menu-item">🛒 Магазин</button>
          <button onClick={() => navigate('leaders')} className="menu-item">🏆 Лидеры</button>
          <button onClick={() => navigate('stats')} className="menu-item">📊 Статистика</button>
        </div>
      </div>
    </div>
  );
}

export default App;