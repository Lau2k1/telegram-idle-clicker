import { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

const Stats = () => {
  const state = useGameStore();
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    const updateTimer = () => {
      if (!state.boostUntil) {
        setTimeLeft("");
        return;
      }

      const end = new Date(state.boostUntil).getTime();
      const now = new Date().getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Истек");
        return;
      }

      const h = Math.floor(diff / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft(`${h}ч ${m}м ${s}с`);
    };

    const timer = setInterval(updateTimer, 1000);
    updateTimer();
    return () => clearInterval(timer);
  }, [state.boostUntil]);

  const stats = [
    { label: "Сила клика", value: `${state.clickPower} 💰`, icon: "⚡" },
    { label: "Добыча золота", value: `${state.incomePerSec}/сек`, icon: "🪙" },
    { label: "Добыча нефти", value: `${state.oilPerSec}/сек`, icon: "🛢️" },
    { label: "Оффлайн золото", value: `${state.maxOfflineTime / 3600}ч`, icon: "⏳" },
    { label: "Оффлайн нефть", value: `${state.maxOilOfflineTime / 3600}ч`, icon: "📦" },
  ];

  return (
    <div className="p-4 flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <span className="text-4xl">📊</span>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-blue-400">Статистика</h1>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Данные вашей колонии</p>
        </div>
      </div>

      {/* Карточка буста */}
      <div className={`p-6 rounded-[32px] border transition-all ${state.isBoostActive ? 'bg-blue-600/20 border-blue-500' : 'bg-white/5 border-white/5 opacity-60'}`}>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{state.isBoostActive ? "🚀" : "💤"}</span>
            <div>
              <h3 className="font-black uppercase text-sm">Множитель x2</h3>
              <p className="text-[10px] text-slate-400 uppercase font-bold">Действует на клик и доход</p>
            </div>
          </div>
          <div className="text-right">
            <div className={`font-black text-lg ${state.isBoostActive ? 'text-blue-400' : 'text-slate-500'}`}>
              {state.isBoostActive ? timeLeft : "Не активен"}
            </div>
          </div>
        </div>
      </div>

      {/* Сетка параметров */}
      <div className="grid grid-cols-1 gap-3">
        {stats.map((s, i) => (
          <div key={i} className="bg-white/5 border border-white/5 p-5 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-2xl">{s.icon}</span>
              <span className="text-sm font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
            </div>
            <span className="font-black text-lg text-white">{s.value}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl text-[11px] text-yellow-500/70 text-center uppercase font-bold tracking-widest">
        Все данные синхронизированы с облаком Telegram
      </div>
    </div>
  );
};

export default Stats;