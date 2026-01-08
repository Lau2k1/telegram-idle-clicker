import { useGameStore } from '../store/gameStore';

const OfflineModal = () => {
  const { 
    showOfflineModal, 
    offlineBonus, 
    offlineOilBonus, 
    offlineSeconds, 
    closeOfflineModal 
  } = useGameStore();

  if (!showOfflineModal) return null;

  // Функция форматирования времени
  const formatOfflineTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours} ч. ${minutes} мин.`;
    }
    return `${minutes} мин.`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-[#1a1c2c] border border-blue-500/30 w-full max-w-sm rounded-[40px] p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-center relative overflow-hidden">
        
        {/* Декор фона */}
        <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-600/10 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="text-6xl mb-4 animate-bounce">💤</div>
          
          <h2 className="text-2xl font-black uppercase tracking-tighter mb-1 text-white">
            С возвращением!
          </h2>
          
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-6">
            Вас не было: <span className="text-blue-400">{formatOfflineTime(offlineSeconds)}</span>
          </p>
          
          <div className="grid grid-cols-1 gap-3 mb-8">
            <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">💰</span>
                <span className="text-sm font-bold text-slate-300 uppercase">Золото</span>
              </div>
              <div className="font-black text-xl text-yellow-500">
                +{Math.floor(offlineBonus).toLocaleString()}
              </div>
            </div>

            <div className="bg-white/5 p-5 rounded-3xl border border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🛢️</span>
                <span className="text-sm font-bold text-slate-300 uppercase">Нефть</span>
              </div>
              <div className="font-black text-xl text-blue-400">
                +{offlineOilBonus.toFixed(2)}
              </div>
            </div>
          </div>

          <button 
            onClick={closeOfflineModal}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_10px_20px_rgba(37,99,235,0.3)] active:scale-95 transition-all"
          >
            Забрать прибыль
          </button>
        </div>
      </div>
    </div>
  );
};

export default OfflineModal;