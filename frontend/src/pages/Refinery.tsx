import React, { useEffect, useState } from 'react';
import { useGameStore } from '../store/gameStore';

const Refinery: React.FC = () => {
  const { coins, oil, processingUntil, startProcessing, load } = useGameStore();
  const [amount, setAmount] = useState<number>(1);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (!processingUntil) return;
    const interval = setInterval(() => {
      const diff = Math.ceil((new Date(processingUntil).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        setTimeLeft(0);
        load();
        clearInterval(interval);
      } else {
        setTimeLeft(diff);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [processingUntil, load]);

  const maxPossible = Math.floor(coins / 10000);

  return (
    <div className="p-6 flex flex-col items-center gap-6">
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

      <div className="w-full bg-[#1a1c2c] p-6 rounded-3xl border border-slate-700 flex flex-col items-center gap-4">
        <div className="text-sm text-slate-400 font-bold uppercase tracking-widest">Количество барелей</div>
        
        <div className="flex items-center gap-6">
          <button 
            onClick={() => setAmount(Math.max(1, amount - 1))}
            className="w-12 h-12 rounded-full bg-slate-800 text-2xl font-bold"
          >-</button>
          <span className="text-4xl font-black text-white w-16 text-center">{amount}</span>
          <button 
            onClick={() => setAmount(Math.min(100, amount + 1))}
            className="w-12 h-12 rounded-full bg-slate-800 text-2xl font-bold"
          >+</button>
        </div>

        <div className="flex gap-2">
            {[5, 10, 50].map(val => (
                <button 
                  key={val}
                  onClick={() => setAmount(val)}
                  className="px-3 py-1 bg-slate-800 rounded-lg text-xs font-bold text-slate-400"
                >+{val}</button>
            ))}
            <button 
              onClick={() => setAmount(maxPossible > 0 ? maxPossible : 1)}
              className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-xs font-bold"
            >MAX</button>
        </div>
      </div>

      <div className="bg-[#1a1c2c] p-6 rounded-3xl border border-slate-700 w-full text-center">
        <div className="flex justify-between text-sm mb-4">
            <span className="text-slate-400">Стоимость:</span>
            <span className="text-yellow-500 font-bold">{(amount * 10000).toLocaleString()} 💰</span>
        </div>
        <div className="flex justify-between text-sm mb-6">
            <span className="text-slate-400">Время ожидания:</span>
            <span className="text-blue-400 font-bold">{amount * 10} сек</span>
        </div>

        <button
          onClick={() => startProcessing(amount)}
          disabled={!!processingUntil || coins < amount * 10000}
          className={`w-full py-4 rounded-2xl font-black text-lg transition-all ${
            !processingUntil && coins >= amount * 10000 
            ? 'bg-blue-500 text-white active:scale-95 shadow-lg shadow-blue-500/30' 
            : 'bg-slate-800 text-slate-600'
          }`}
        >
          {processingUntil ? `В ПРОЦЕССЕ (${timeLeft}с)` : 'ЗАПУСТИТЬ ЗАВОД'}
        </button>
      </div>
    </div>
  );
};

export default Refinery;