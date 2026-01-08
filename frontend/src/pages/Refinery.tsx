import { useGameStore } from '../store/gameStore';

const Refinery = () => {
  const { oil, fuel, coins } = useGameStore();

  return (
    <div className="p-4 flex flex-col gap-6 animate-in slide-in-from-bottom duration-500">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🏭</span>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-blue-400">Завод</h1>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Переработка ресурсов</p>
        </div>
      </div>

      {/* Баланс Топлива */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 p-6 rounded-[32px] shadow-lg">
        <div className="text-[10px] uppercase font-black opacity-70 mb-1 text-white">Ракетное Топливо</div>
        <div className="flex items-center gap-3">
          <span className="text-3xl">🚀</span>
          <span className="text-3xl font-black">{Math.floor(fuel).toLocaleString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Цех 1: Золото -> Нефть */}
        <div className="bg-white/5 border border-white/5 p-5 rounded-[32px] flex flex-col gap-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-black uppercase text-sm">Синтез Нефти</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">100 💰 → 1 🛢️</p>
            </div>
            <span className="bg-blue-500/20 text-blue-400 text-[10px] px-2 py-1 rounded-full font-bold">10 сек</span>
          </div>
          <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-2xl font-black uppercase text-xs transition-all">
            Начать процесс
          </button>
        </div>

        {/* Цех 2: Нефть -> Топливо */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-[32px] flex flex-col gap-4 border-l-orange-500 border-l-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-black uppercase text-sm text-orange-400">Производство Топлива</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase">25 🛢️ → 1 🚀</p>
            </div>
            <span className="bg-orange-500/20 text-orange-400 text-[10px] px-2 py-1 rounded-full font-bold">100 сек</span>
          </div>
          <button 
            disabled={oil < 25}
            className={`w-full py-3 rounded-2xl font-black uppercase text-xs transition-all ${oil >= 25 ? 'bg-orange-600 text-white' : 'bg-white/5 text-slate-600'}`}
          >
            {oil >= 25 ? 'Запустить реактор' : 'Недостаточно нефти'}
          </button>
        </div>
      </div>
      
      <p className="text-center text-[10px] text-slate-600 uppercase font-bold px-10">
        Топливо необходимо для заправки корабля и полетов на другие планеты.
      </p>
    </div>
  );
};

export default Refinery;