import { useGameStore } from '../store/gameStore';

const OfflineModal = () => {
  // Используем селекторы для точного отслеживания
  const isVisible = useGameStore(s => s.showOfflineModal);
  const bonusCoins = useGameStore(s => s.offlineBonus);
  const bonusOil = useGameStore(s => s.offlineOilBonus);
  const seconds = useGameStore(s => s.offlineSeconds);
  const close = useGameStore(s => s.closeOfflineModal);

  // Если окно не должно быть видно или бонусы уже сброшены - не рендерим
  if (!isVisible || (bonusCoins === 0 && bonusOil === 0)) return null;

  const formatTime = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    return h > 0 ? `${h} ч. ${m} мин.` : `${m} мин.`;
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
      <div className="bg-[#1a1c2c] border border-blue-500/30 w-full max-w-sm rounded-[40px] p-8 shadow-2xl text-center relative">
        <div className="text-6xl mb-4 animate-bounce">🚀</div>
        
        <h2 className="text-2xl font-black uppercase tracking-tighter mb-1">С возвращением!</h2>
        <p className="text-slate-400 text-xs font-bold uppercase mb-6">
          Вас не было: <span className="text-blue-400">{formatTime(seconds)}</span>
        </p>
        
        <div className="space-y-3 mb-8">
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex justify-between items-center">
            <span className="text-2xl">💰</span>
            <span className="font-black text-xl text-yellow-500">+{Math.floor(bonusCoins).toLocaleString()}</span>
          </div>
          <div className="bg-white/5 p-4 rounded-3xl border border-white/5 flex justify-between items-center">
            <span className="text-2xl">🛢️</span>
            <span className="font-black text-xl text-blue-400">+{bonusOil.toFixed(2)}</span>
          </div>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            close();
          }}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all active:scale-95"
        >
          Забрать всё
        </button>
      </div>
    </div>
  );
};

export default OfflineModal;