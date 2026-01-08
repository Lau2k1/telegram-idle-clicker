import { useGameStore } from '../store/gameStore';
import { formatComplexTime } from '../utils/time';

const OfflineModal = () => {
  const show = useGameStore(s => s.showOfflineModal);
  const bonusCoins = useGameStore(s => s.offlineBonus);
  const bonusOil = useGameStore(s => s.offlineOilBonus);
  const seconds = useGameStore(s => s.offlineSeconds);
  const close = useGameStore(s => s.closeOfflineModal);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-[#1a1c2c] border border-blue-500/30 w-full max-w-sm rounded-[40px] p-8 text-center shadow-[0_0_50px_rgba(37,99,235,0.2)]">
        <div className="w-20 h-20 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🛰️</span>
        </div>
        
        <h2 className="text-2xl font-black mb-2 uppercase tracking-tighter text-white">С возвращением!</h2>
        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-6">
          Вас не было: <span className="text-blue-400">{formatComplexTime(seconds)}</span>
        </p>

        <div className="space-y-3 mb-8">
          <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
            <span className="text-2xl">💰</span>
            <span className="font-black text-xl text-yellow-500">+{Math.floor(bonusCoins).toLocaleString()}</span>
          </div>
          <div className="bg-white/5 p-4 rounded-2xl flex items-center justify-between border border-white/5">
            <span className="text-2xl">🛢️</span>
            <span className="font-black text-xl text-blue-400">+{bonusOil.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={close}
          className="w-full bg-blue-600 hover:bg-blue-500 active:scale-95 py-4 rounded-2xl font-black uppercase text-sm transition-all shadow-lg shadow-blue-900/40"
        >
          Забрать ресурсы
        </button>
      </div>
    </div>
  );
};

export default OfflineModal;