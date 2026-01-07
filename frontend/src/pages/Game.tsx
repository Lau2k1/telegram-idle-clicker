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
      <div className="balance-display">
        <span className="balance-label">БАЛАНС</span>
        <div className="balance-value">
          <span className="coin-icon">💰</span>
          {Math.floor(coins).toLocaleString()}
        </div>
      </div>

      <div className="mining-section" onPointerDown={handlePointerDown}>
        <div className="coin-wrapper">
          <div className="main-miner">⛏️</div>
        </div>
        
        {clicks.map((c) => (
          <div key={c.id} className="floating-text" style={{ left: c.x, top: c.y }}>
            +{clickPower}
          </div>
        ))}
      </div>

      <div className="power-info">
        Сила клика: <span>{clickPower}</span>
      </div>
    </div>
  );
};

export default Game;