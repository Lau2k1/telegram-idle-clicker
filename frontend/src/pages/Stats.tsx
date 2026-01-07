import React from 'react';
import { useGameStore } from '../store/gameStore';

const Stats: React.FC = () => {
  const { coins, clickPower, incomePerSec } = useGameStore();

  return (
    <div className="p-6 text-center">
      <h2 className="text-2xl font-black mb-8 text-yellow-500 uppercase">Твои показатели</h2>
      
      <div className="grid grid-cols-1 gap-4">
        <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-700">
          <p className="text-slate-400 text-sm uppercase mb-1">Всего монет</p>
          <p className="text-3xl font-black text-white">{coins.toLocaleString()}</p>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-700">
          <p className="text-slate-400 text-sm uppercase mb-1">Сила клика</p>
          <p className="text-3xl font-black text-blue-400">{clickPower}</p>
        </div>

        <div className="bg-[#1e293b] p-6 rounded-3xl border border-slate-700">
          <p className="text-slate-400 text-sm uppercase mb-1">Доход в секунду</p>
          <p className="text-3xl font-black text-green-400">{incomePerSec}</p>
        </div>
      </div>
    </div>
  );
};

export default Stats;