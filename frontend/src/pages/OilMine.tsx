import React from 'react';
import { useGameStore } from '../store/gameStore';
import { Drill } from 'lucide-react'; // Импорт иконки

const OilMine: React.FC = () => {
  const { oil, oilPerSec } = useGameStore();

  return (
    <div className="p-6 flex flex-col items-center">
      {/* Карточка баланса */}
      <div className="w-full bg-[#1a1c2c] p-8 rounded-[40px] border border-blue-500/30 text-center shadow-2xl shadow-blue-500/10">
        <div className="text-blue-400 text-xs font-black uppercase tracking-widest mb-2">РЕЗЕРВУАР НЕФТИ</div>
        <div className="text-5xl font-black text-white mb-2">
          {oil.toFixed(2)} <span className="text-2xl text-blue-500">🛢️</span>
        </div>
        <div className="text-blue-400 font-bold flex items-center justify-center gap-2">
            <span className="animate-pulse text-blue-500">●</span> +{oilPerSec.toFixed(2)}/сек
        </div>
      </div>

      {/* Центральная иконка с анимацией */}
      <div className="my-16 relative">
        <div className="text-blue-500 animate-bounce">
          <Drill 
            size={160}          // Размер иконки (в пикселях)
            strokeWidth={1.5}    // Толщина линий
            className="drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" 
          />
        </div>
        
        {/* Тень под иконкой */}
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-32 h-4 bg-black/40 blur-md rounded-full"></div>
      </div>

      {/* Инфо-блок */}
      <div className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-3xl text-center backdrop-blur-sm">
        <p className="text-slate-300 text-sm leading-relaxed">
          На этой локации добыча идет <span className="text-blue-400 font-bold uppercase">автоматически</span>. 
          <br />
          Улучшайте оборудование в магазине, чтобы качать больше.
        </p>
      </div>
    </div>
  );
};

export default OilMine;