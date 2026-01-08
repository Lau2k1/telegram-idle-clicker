import { useState, useEffect } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatComplexTime } from '../utils/time';

const Refinery = () => {
  const { coins, oil, fuel, load } = useGameStore();
  const [amount, setAmount] = useState(1);
  const [loading, setLoading] = useState(false);

  // Функция для запуска
  const handleStart = async (type: 'oil' | 'fuel') => {
    setLoading(true);
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    try {
      await fetch(`${import.meta.env.VITE_API_URL}/game/start-refining?userId=${userId}&type=${type}&amount=${amount}`, { method: 'POST' });
      await load(); // Обновляем состояние, чтобы увидеть таймер
    } catch (e) {
      alert("Ошибка запуска");
    }
    setLoading(false);
  };

  return (
    <div className="p-4 flex flex-col gap-6">
      <h1 className="text-2xl font-black uppercase tracking-tighter text-blue-400">Завод</h1>

      {/* Выбор количества */}
      <div className="bg-white/5 p-6 rounded-[32px] border border-white/10">
        <label className="text-[10px] uppercase font-black text-slate-500 mb-2 block">Количество для переработки</label>
        <div className="flex items-center gap-4">
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
            className="flex-1 bg-black/40 border border-white/10 rounded-2xl py-3 px-4 font-black text-xl outline-none focus:border-blue-500 transition-all"
          />
          <div className="flex gap-2">
            {[10, 50, 100].map(v => (
              <button key={v} onClick={() => setAmount(v)} className="bg-white/5 px-3 py-2 rounded-xl text-xs font-bold hover:bg-white/10">{v}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Кнопки запуска */}
      <div className="grid grid-cols-1 gap-4">
        {/* Золото -> Нефть */}
        <div className="bg-white/5 p-5 rounded-[32px] border border-white/5">
          <div className="flex justify-between mb-4">
            <span className="font-bold">Синтез Нефти</span>
            <span className="text-blue-400 font-black">{amount * 100} 💰</span>
          </div>
          <button 
            onClick={() => handleStart('oil')}
            disabled={coins < amount * 100 || loading}
            className="w-full bg-blue-600 disabled:opacity-30 py-4 rounded-2xl font-black uppercase text-sm"
          >
            Начать ({formatComplexTime(amount * 10)})
          </button>
        </div>

        {/* Нефть -> Топливо */}
        <div className="bg-white/5 p-5 rounded-[32px] border border-white/5">
          <div className="flex justify-between mb-4">
            <span className="font-bold">Реактор Топлива</span>
            <span className="text-orange-500 font-black">{amount * 25} 🛢️</span>
          </div>
          <button 
            onClick={() => handleStart('fuel')}
            disabled={oil < amount * 25 || loading}
            className="w-full bg-orange-600 disabled:opacity-30 py-4 rounded-2xl font-black uppercase text-sm"
          >
            Начать ({formatComplexTime(amount * 100)})
          </button>
        </div>
      </div>
    </div>
  );
};

export default Refinery;