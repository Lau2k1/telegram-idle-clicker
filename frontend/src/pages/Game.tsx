import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import './Game.css';

interface ClickEffect {
  id: number;
  x: number;
  y: number;
}

const Game: React.FC = () => {
  const { coins, click, clickPower } = useGameStore();
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
        <div className="balance-label">ВАШИ МОНЕТЫ</div>
        <div className="balance-amount">
          <span>💰</span>
          {Math.floor(coins).toLocaleString()}
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

      <div className="bg-[#1a1c2c] px-6 py-3 rounded-2xl border border-slate-700 text-slate-400">
        Сила клика: <span className="text-yellow-500 font-bold">{clickPower}</span>
      </div>
    </div>
  );
};

export default Game;