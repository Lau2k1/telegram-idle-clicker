import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatComplexTime } from '../utils/time';
import RefiningTimer from '../components/RefiningTimer';

const Refinery = () => {
  const { coins, oil, load, refiningOilUntil, refiningFuelUntil, refiningAmount } = useGameStore();
  const [amount, setAmount] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const startProcess = async (type: 'oil' | 'fuel') => {
    if (amount <= 0) return;
    setIsProcessing(true);
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/game/start-refining?userId=${userId}&type=${type}&amount=${amount}`,
        { method: 'POST' }
      );
      if (response.ok) await load();
      else alert("Завод уже занят или недостаточно ресурсов");
    } catch (e) {
      alert("Ошибка сети");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6 animate-in fade-in duration-500">
      <h1 className="text-2xl font-black uppercase tracking-tighter text-blue-400">Завод</h1>

      {/* АКТИВНЫЕ ПРОЦЕССЫ (ТАЙМЕРЫ) */}
      <div className="flex flex-col gap-3">
        {refiningOilUntil && (
          <RefiningTimer 
            until={refiningOilUntil} 
            label="Синтез нефти в процессе" 
            onComplete={load} 
          />
        )}
        {refiningFuelUntil && (
          <RefiningTimer 
            until={refiningFuelUntil} 
            label="Производство топлива в процессе" 
            onComplete={load} 
          />
        )}
      </div>

      {/* ФОРМА ЗАПУСКА (Скрываем, если уже идет процесс того же типа) */}
      <div className="bg-white/5 p-6 rounded-[32px] border border-white/10">
        <label className="text-[10px] uppercase font-black text-slate-500 mb-2 block text-center">Количество для производства:</label>
        <input 
          type="number" 
          value={amount} 
          onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 font-black text-2xl text-center outline-none focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Цех Нефти */}
        {!refiningOilUntil && (
          <div className="bg-white/5 p-6 rounded-[32px] border border-white/5">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-black uppercase text-sm">Синтез Нефти</h3>
                <p className="text-[10px] text-slate-500 font-bold">Нужно: {amount * 100} 💰</p>
              </div>
              <div className="text-xs font-bold text-blue-400">{formatComplexTime(amount * 10)}</div>
            </div>
            <button 
              onClick={() => startProcess('oil')}
              disabled={coins < amount * 100 || isProcessing}
              className="w-full bg-blue-600 disabled:opacity-20 py-4 rounded-2xl font-black uppercase text-sm"
            >
              Произвести {amount} 🛢️
            </button>
          </div>
        )}

        {/* Цех Топлива */}
        {!refiningFuelUntil && (
          <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 border-l-orange-500 border-l-4">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-black uppercase text-sm text-orange-400">Реактор Топлива</h3>
                <p className="text-[10px] text-slate-500 font-bold">Нужно: {amount * 25} 🛢️</p>
              </div>
              <div className="text-xs font-bold text-orange-400">{formatComplexTime(amount * 100)}</div>
            </div>
            <button 
              onClick={() => startProcess('fuel')}
              disabled={oil < amount * 25 || isProcessing}
              className="w-full bg-orange-600 disabled:opacity-20 py-4 rounded-2xl font-black uppercase text-sm"
            >
              Произвести {amount} 🚀
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Refinery;