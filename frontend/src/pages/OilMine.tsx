import React from 'react';
import { useGameStore } from '../store/gameStore';

const OilMine: React.FC = () => {
  const { oil, oilPerSec } = useGameStore();

  return (
    <div className="p-6 flex flex-col items-center">
      <div className="w-full bg-[#1a1c2c] p-8 rounded-[40px] border border-blue-500/30 text-center shadow-2xl shadow-blue-500/10">
        <div className="text-blue-400 text-xs font-black uppercase tracking-widest mb-2">РЕЗЕРВУАР НЕФТИ</div>
        <div className="text-5xl font-black text-white mb-2">{oil.toFixed(2)}</div>
        <div className="text-blue-400 font-bold flex items-center justify-center gap-2">
            <span className="animate-pulse">●</span> +{oilPerSec}/сек
        </div>
      </div>

      <div className="my-16 relative">
        <div className="text-9xl animate-bounce">🏗️</div>
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/40 blur-md rounded-full"></div>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl text-center">
        <p className="text-slate-300 text-sm">
          На этой локации добыча идет <span className="text-blue-400 font-bold">полностью автоматически</span>. 
          Используйте Магазин, чтобы купить больше насосов.
        </p>
      </div>
    </div>
  );
};

export default OilMine;