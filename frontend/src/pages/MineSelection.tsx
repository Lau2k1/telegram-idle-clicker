import React from 'react';

const MineSelection: React.FC<{ onSelectGold: () => void, onSelectOil: () => void, onBack: () => void }> = ({ onSelectGold, onSelectOil, onBack }) => {
  return (
    <div className="p-6 space-y-4">
      <button onClick={onBack} className="text-slate-400 text-sm">← Назад к планетам</button>
      <h2 className="text-2xl font-black text-center mb-8 text-white">ВЫБОР ШАХТЫ</h2>
      
      <div onClick={onSelectGold} className="bg-[#1a1c2c] p-6 rounded-3xl border border-yellow-500/50 flex items-center gap-4 cursor-pointer active:scale-95 transition-all">
        <span className="text-4xl">⛏️</span>
        <div>
          <div className="font-bold text-yellow-500">Золотой рудник</div>
          <div className="text-xs text-slate-400">Ручная и пассивная добыча золота</div>
        </div>
      </div>

      <div onClick={onSelectOil} className="bg-[#1a1c2c] p-6 rounded-3xl border border-blue-500/50 flex items-center gap-4 cursor-pointer active:scale-95 transition-all">
        <span className="text-4xl">🏗️</span>
        <div>
          <div className="font-bold text-blue-400">Нефтяные залежи</div>
          <div className="text-xs text-slate-400">Автоматическая добыча нефти</div>
        </div>
      </div>
    </div>
  );
};

export default MineSelection;