import React, { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

const Leaderboard: React.FC = () => {
  const { leaderboard, loadLeaderboard } = useGameStore();

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-black mb-6 text-center text-yellow-500">ТОП ШАХТЕРОВ</h2>
      <div className="bg-[#1e293b] rounded-3xl overflow-hidden shadow-xl">
        {leaderboard.map((user, index) => (
          <div key={user.telegramId} className="flex items-center justify-between p-4 border-b border-slate-700 last:border-0">
            <div className="flex items-center gap-4">
              <span className={`w-8 h-8 flex items-center justify-center rounded-full font-bold ${index < 3 ? 'bg-yellow-500 text-black' : 'bg-slate-800'}`}>
                {index + 1}
              </span>
              <span className="font-medium text-slate-200">ID: {user.telegramId.slice(0, 8)}</span>
            </div>
            <span className="font-bold text-yellow-500">{user.coins.toLocaleString()} 💰</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;