import { useEffect, useState, useRef } from 'react';
import { useGameStore } from './store/gameStore';
import PlanetSelection from './pages/PlanetSelection';
import MineSelection from './pages/MineSelection';
import Game from './pages/Game';
import OilMine from './pages/OilMine';
import Refinery from './pages/Refinery';
import Shop from './pages/Shop';
import './App.css';

function App() {
  const { load, incomePerSec, oilPerSec, addResources, syncOnline, showOfflineModal } = useGameStore();
  const [activePage, setActivePage] = useState('planets');
  const earnedCoins = useRef(0);
  const earnedOil = useRef(0);

  useEffect(() => { load(); }, []);

  // Система тиков (Онлайн доход)
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
  }, [incomePerSec, oilPerSec]);

  return (
    <div className="app-container">
      <header className="app-header">
        <button onClick={() => setActivePage('planets')} className="text-yellow-500 font-bold">🪐 ПЛАНЕТЫ</button>
        <h1 className="logo">GOLD MINER</h1>
        <button onClick={() => setActivePage('shop')} className="text-2xl">🛒</button>
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
      </main>

      <nav className="fixed bottom-0 w-full bg-[#1a1c2c] flex justify-around p-4 border-t border-slate-800">
        <button onClick={() => setActivePage('planets')}>🌍 Миры</button>
        <button onClick={() => setActivePage('refinery')}>🏭 Завод</button>
        <button onClick={() => setActivePage('shop')}>🛒 Магазин</button>
      </nav>
    </div>
  );
}

export default App;