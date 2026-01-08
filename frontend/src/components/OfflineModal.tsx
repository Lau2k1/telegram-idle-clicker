import { useGameStore } from '../store/gameStore';

const OfflineModal = () => {
  const { showOfflineModal, offlineBonus, offlineOilBonus, closeOfflineModal } = useGameStore();

  if (!showOfflineModal) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-[#1a1c2c] border border-blue-500/30 w-full max-w-sm rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-center">
        <div className="text-5xl mb-4">💤</div>
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-2">С возвращением!</h2>
        <p className="text-slate-400 text-sm mb-6">Ваши шахты работали, пока вы отдыхали:</p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
            <div className="text-2xl mb-1">💰</div>
            <div className="font-black text-yellow-500">+{Math.floor(offlineBonus)}</div>
            <div className="text-[10px] uppercase opacity-50 font-bold">Золото</div>
          </div>
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5">
            <div className="text-2xl mb-1">🛢️</div>
            <div className="font-black text-blue-400">+{offlineOilBonus.toFixed(2)}</div>
            <div className="text-[10px] uppercase opacity-50 font-bold">Нефть</div>
          </div>
        </div>

        <button 
          onClick={closeOfflineModal}
          className="w-full bg-blue-600 py-4 rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-blue-900/40"
        >
          Забрать ресурсы
        </button>
      </div>
    </div>
  );
};

export default OfflineModal;