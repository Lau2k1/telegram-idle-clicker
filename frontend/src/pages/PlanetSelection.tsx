import React from 'react';

const PlanetSelection: React.FC<{ onSelect: () => void }> = ({ onSelect }) => {
  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-black text-white mb-10 tracking-widest uppercase">Выберите планету</h2>
      <div 
        onClick={onSelect}
        className="relative group cursor-pointer transition-transform active:scale-95"
      >
        <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full group-hover:bg-blue-500/40 transition-all"></div>
        <div className="relative bg-[#1a1c2c] border-4 border-blue-500 p-10 rounded-full w-64 h-64 mx-auto flex flex-col items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.3)]">
          <span className="text-8xl mb-2">🌍</span>
          <h3 className="text-xl font-black text-white uppercase tracking-tighter">Земля</h3>
          <div className="text-[10px] text-blue-400 font-bold">ДОСТУПНО</div>
        </div>
      </div>
      
      <div className="mt-12 opacity-30 grayscale pointer-events-none">
        <div className="bg-[#1a1c2c] border-4 border-slate-700 p-8 rounded-full w-48 h-48 mx-auto flex flex-col items-center justify-center">
          <span className="text-6xl mb-2">🔴</span>
          <h3 className="text-sm font-black text-slate-500 uppercase">Марс</h3>
          <div className="text-[8px] text-slate-500 font-bold">НУЖНО 100 НЕФТИ</div>
        </div>
      </div>
    </div>
  );
};

export default PlanetSelection;