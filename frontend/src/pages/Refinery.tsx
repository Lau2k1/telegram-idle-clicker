import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

const Refinery: React.FC = () => {
  const { coins, oil, processingUntil, startProcessing, load } = useGameStore();
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!processingUntil) return;

    const interval = setInterval(() => {
      const diff = Math.ceil((new Date(processingUntil).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        load(); // Обновляем состояние, когда закончили
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [processingUntil, load]);

  return (
    <div className="p-6 flex flex-col items-center gap-8">
      <h2 className="text-2xl font-black text-blue-400">НЕФТЕЗАВОД</h2>
      
      <div className="flex gap-4 w-full">
        <div className="flex-1 bg-[#1a1c2c] p-4 rounded-3xl border border-slate-700 text-center">
          <div className="text-xs text-slate-400">ЗОЛОТО</div>
          <div className="text-xl font-bold text-yellow-500">{Math.floor(coins).toLocaleString()}</div>
        </div>
        <div className="flex-1 bg-[#1a1c2c] p-4 rounded-3xl border border-slate-700 text-center">
          <div className="text-xs text-slate-400">НЕФТЬ</div>
          <div className="text-xl font-bold text-blue-500">{oil} 🛢️</div>
        </div>
      </div>

      <div className="relative w-48 h-48 bg-[#1a1c2c] rounded-full border-8 border-slate-800 flex items-center justify-center">
        {processingUntil ? (
          <div className="text-center">
            <div className="text-3xl font-black text-blue-400 animate-pulse">{timeLeft}с</div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">Идет возгонка...</div>
          </div>
        ) : (
          <div className="text-6xl">🏭</div>
        )}
      </div>

      <div className="bg-[#1a1c2c] p-6 rounded-3xl border border-slate-700 w-full text-center">
        <p className="text-sm text-slate-400 mb-4">Курс: <span className="text-white font-bold">10,000 💰 = 1 🛢️</span></p>
        <button
          onClick={startProcessing}
          disabled={!!processingUntil || coins < 10000}
          className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
            !processingUntil && coins >= 10000 
            ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20 active:scale-95' 
            : 'bg-slate-800 text-slate-600'
          }`}
        >
          {processingUntil ? 'ЗАВОД ЗАНЯТ' : 'НАЧАТЬ ПЕРЕРАБОТКУ'}
        </button>
      </div>
    </div>
  );
};

export default Refinery;