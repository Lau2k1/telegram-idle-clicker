import { useEffect, useState } from 'react';

interface Leader {
  firstName: string;
  coins: number;
}

const Leaderboard = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaders = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/game/leaderboard`);
        const data = await res.json();
        setLeaders(data);
      } catch (e) {
        console.error("Ошибка загрузки топа:", e);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaders();
  }, []);

  if (loading) {
    return <div className="p-10 text-center text-slate-500 animate-pulse uppercase font-black">Загрузка рейтинга...</div>;
  }

  return (
    <div className="p-4 flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🏆</span>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter">Зал славы</h1>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Лучшие колонизаторы</p>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        {leaders.length > 0 ? leaders.map((user, index) => (
          <div 
            key={index} 
            className={`flex justify-between items-center p-4 rounded-2xl border transition-all ${
              index === 0 ? 'bg-yellow-500/10 border-yellow-500/50 scale-[1.02]' : 
              index === 1 ? 'bg-slate-300/10 border-slate-300/30' :
              index === 2 ? 'bg-orange-400/10 border-orange-400/30' :
              'bg-white/5 border-white/5'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black ${
                index === 0 ? 'bg-yellow-500 text-black' : 'bg-white/10 text-slate-400'
              }`}>
                {index + 1}
              </div>
              <span className="font-bold text-lg">{user.firstName || "Аноним"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-yellow-500 text-lg">
                {Math.floor(user.coins).toLocaleString()}
              </span>
              <span className="text-sm">💰</span>
            </div>
          </div>
        )) : (
          <div className="text-center p-10 bg-white/5 rounded-3xl border border-white/5 text-slate-500 italic">
            Список пуст. Станьте первым!
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;