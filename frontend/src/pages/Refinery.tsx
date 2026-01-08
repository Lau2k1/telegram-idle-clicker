import { useState } from 'react';
import { useGameStore } from '../store/gameStore';
import { formatComplexTime } from '../utils/time';
import RefiningTimer from '../components/RefiningTimer';

const Refinery = () => {
  const { 
    coins, oil, fuel, load, 
    refiningOilUntil, refiningFuelUntil,
    refiningOilAmount, refiningFuelAmount 
  } = useGameStore();
  
  const [amount, setAmount] = useState<number>(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const startProcess = async (type: 'oil' | 'fuel') => {
    if (amount <= 0 || isProcessing) return;
    setIsProcessing(true);
    
    const userId = (window as any).Telegram?.WebApp?.initDataUnsafe?.user?.id || 12345;
    
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/game/start-refining?userId=${userId}&type=${type}&amount=${amount}`,
        { method: 'POST' }
      );
      
      if (response.ok) {
        await load(); // Обновляем стейт, чтобы увидеть запущенный таймер
      } else {
        const err = await response.json();
        alert(err.message || "Ошибка запуска");
      }
    } catch (e) {
      alert("Ошибка сети");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 flex flex-col gap-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🏭</span>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-blue-400">Завод</h1>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Переработка ресурсов</p>
        </div>
      </div>

      {/* Поле ввода количества (Ручное) */}
      <div className="bg-white/5 p-6 rounded-[32px] border border-white/10 shadow-inner">
        <label className="text-[10px] uppercase font-black text-slate-500 mb-2 block text-center">План производства (единиц):</label>
        <input 
          type="number" 
          min="1"
          value={amount} 
          onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 px-6 font-black text-2xl text-center outline-none focus:border-blue-500 transition-all text-white"
        />
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* ЦЕХ 1: СИНТЕЗ НЕФТИ */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-black uppercase text-sm">Синтез Нефти</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Расход: {amount * 100} 💰</p>
            </div>
            {!refiningOilUntil && (
              <span className="text-[10px] font-black text-blue-400">{formatComplexTime(amount * 10)}</span>
            )}
          </div>

          {refiningOilUntil ? (
            <RefiningTimer 
              until={refiningOilUntil} 
              label={`Производится ${refiningOilAmount} 🛢️`} 
              onComplete={load} 
            />
          ) : (
            <button 
              onClick={() => startProcess('oil')}
              disabled={coins < amount * 100 || isProcessing}
              className="w-full bg-blue-600 disabled:opacity-20 py-4 rounded-2xl font-black uppercase text-sm active:scale-95 transition-all"
            >
              Запустить синтез
            </button>
          )}
        </div>

        {/* ЦЕХ 2: РЕАКТОР ТОПЛИВА */}
        <div className="bg-white/5 p-6 rounded-[32px] border border-white/5 border-l-orange-500 border-l-4 relative">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-black uppercase text-sm text-orange-400">Реактор Топлива</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">Расход: {amount * 25} 🛢️</p>
            </div>
            {!refiningFuelUntil && (
              <span className="text-[10px] font-black text-orange-400">{formatComplexTime(amount * 100)}</span>
            )}
          </div>

          {refiningFuelUntil ? (
            <RefiningTimer 
              until={refiningFuelUntil} 
              label={`Производится ${refiningFuelAmount} 🚀`} 
              onComplete={load} 
            />
          ) : (
            <button 
              onClick={() => startProcess('fuel')}
              disabled={oil < amount * 25 || isProcessing}
              className="w-full bg-orange-600 disabled:opacity-20 py-4 rounded-2xl font-black uppercase text-sm active:scale-95 transition-all"
            >
              Запустить реактор
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Refinery;