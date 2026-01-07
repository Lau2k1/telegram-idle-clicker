import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import './Game.css';

interface ClickEffect {
  id: number;
  x: number;
  y: number;
}

const Game: React.FC = () => {
  const { coins, click, clickPower, loadLeaderboard, leaderboard } = useGameStore();
  const [clicks, setClicks] = useState<ClickEffect[]>([]);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    const { clientX, clientY } = e;
    click(); // Вызов основной логики из стора (с вибрацией)

    // Создаем эффект анимации
    const id = Date.now();
    setClicks((prev) => [...prev, { id, x: clientX, y: clientY }]);

    // Удаляем эффект через 1 секунду
    setTimeout(() => {
      setClicks((prev) => prev.filter((c) => c.id !== id));
    }, 1000);
  };

  return (
    <div className="game-container">
      <div className="stats-header">
        <div className="stat-box">
          <span className="coin-icon">💰</span>
          <span className="coin-count">{Math.floor(coins)}</span>
        </div>
      </div>

      <div className="click-area" onPointerDown={handlePointerDown}>
        <div className="main-coin">⛏️</div>
        {clicks.map((c) => (
          <div key={c.id} className="click-float" style={{ left: c.x, top: c.y }}>
            +{clickPower}
          </div>
        ))}
      </div>

      <button onClick={loadLeaderboard} className="leaderboard-btn">
        🏆 Показать лидеров
      </button>

      {leaderboard.length > 0 && (
        <div className="leaderboard-overlay" onClick={() => useGameStore.setState({ leaderboard: [] })}>
          <div className="leaderboard-card" onClick={e => e.stopPropagation()}>
            <h3>Топ Шахтеров</h3>
            {leaderboard.map((u, i) => (
              <div key={u.telegramId} className="leader-row">
                <span>{i + 1}. {u.telegramId.slice(0, 5)}...</span>
                <span className="leader-coins">{u.coins} 💰</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Game;