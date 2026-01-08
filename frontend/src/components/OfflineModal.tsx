import React from 'react';
import { useGameStore } from '../store/gameStore';

const OfflineModal: React.FC = () => {
  const { showOfflineModal, offlineBonus, offlineOilBonus, closeOfflineModal } = useGameStore();

  if (!showOfflineModal) return null;

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
      <div className="bg-[#1a1c2c] w-full max-w-sm rounded-[40px] border border-slate-800 p-8 text-center shadow-2xl">
        <h2 className="text-2xl font-black text-white mb-2 uppercase">С возвращением!</h2>
        <p className="text-slate-400 text-sm mb-8">Вот что добыли ваши шахты, пока вас не было:</p>
        
        <div className="space-y-4 mb-10">
          <div className="bg-yellow-500/10 p-4 rounded-3xl border border-yellow-500/20">
            <div className="text-yellow-500 text-xs font-bold uppercase mb-1">Золото</div>
            <div className="text-3xl font-black text-white">+{Math.floor(offlineBonus).toLocaleString()} 💰</div>
          </div>
          <div className="bg-blue-500/10 p-4 rounded-3xl border border-blue-500/20">
            <div className="text-blue-500 text-xs font-bold uppercase mb-1">Нефть</div>
            <div className="text-3xl font-black text-white">+{offlineOilBonus.toFixed(2)} 🛢️</div>
          </div>
        </div>

        <button 
          onClick={closeOfflineModal}
          className="w-full bg-white text-black py-5 rounded-3xl font-black text-lg active:scale-95 transition-all"
        >
          ЗАБРАТЬ РЕСУРСЫ
        </button>
      </div>
    </div>
  );
};

export default OfflineModal;