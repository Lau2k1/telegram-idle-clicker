import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import './Game.css';

interface ClickEffect {
  id: number;
  x: number;
  y: number;
}

const Game: React.FC = () => {
  const { coins, click, clickPower, incomePerSec } = useGameStore();
  const [clicks, setClicks] = useState<ClickEffect[]>([]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    click();

    const id = Date.now();
    setClicks((prev) => [...prev, { id, x: clientX, y: clientY }]);
    setTimeout(() => {
      setClicks((prev) => prev.filter((c) => c.id !== id));
    }, 800);
  };

  return (
    <div className="game-page">
      <div className="balance-card">
        <div className="balance-label">БАЛАНС</div>
        <div className="balance-amount">
          <span>💰</span>
          {Math.floor(coins).toLocaleString()}
        </div>
        {/* НОВОЕ ПОЛЕ: Доход в секунду */}
        <div className="text-green-400 text-sm font-bold mt-1 flex items-center justify-center gap-1">
          <span className="animate-pulse">●</span>
          Доход: +{incomePerSec}/сек
        </div>
      </div>

      <div className="click-zone" onPointerDown={handlePointerDown}>
        <div className="miner-button">⛏️</div>
        
        {clicks.map((c) => (
          <div key={c.id} className="floating-number" style={{ left: c.x - 20, top: c.y - 20 }}>
            +{clickPower}
          </div>
        ))}
      </div>

      <div className="bg-[#1a1c2c] px-6 py-3 rounded-2xl border border-slate-700 text-slate-400 flex gap-4">
        <div>Клик: <span className="text-yellow-500 font-bold">{clickPower}</span></div>
        <div className="w-px h-4 bg-slate-700 self-center"></div>
        <div>Оффлайн: <span className="text-blue-400 font-bold">{useGameStore.getState().maxOfflineTime / 3600}ч</span></div>
      </div>
    </div>
  );
};

export default Game;