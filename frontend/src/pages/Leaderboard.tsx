import { useEffect, useState } from 'react';

interface Leader {
  firstName: string;
  coins: number;
}

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);

  useEffect(() => {
    // Загружаем список лидеров при открытии вкладки
    fetch(`${import.meta.env.VITE_API_URL}/game/leaderboard`)
      .then(res => res.json())
      .then(data => setLeaders(data));
  }, []);

  return (
    <div className="p-4 flex flex-col gap-4">
      <h1 className="text-2xl font-black uppercase italic text-blue-400">Топ игроков</h1>
      <div className="bg-white/5 rounded-3xl border border-white/5 overflow-hidden">
        {leaders.map((user, index) => (
          <div key={index} className="flex justify-between items-center p-4 border-b border-white/5 last:border-0">
            <div className="flex items-center gap-3">
              <span className={`w-6 text-center font-bold ${index < 3 ? 'text-yellow-500' : 'text-slate-500'}`}>
                {index + 1}
              </span>
              <span className="font-bold">{user.firstName}</span>
            </div>
            <div className="flex items-center gap-1 font-black text-yellow-500">
              {Math.floor(user.coins).toLocaleString()} 💰
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Leaderboard;