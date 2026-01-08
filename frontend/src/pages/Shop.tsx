import { useGameStore } from '../store/gameStore';

const Shop = () => {
  const { coins, oil, clickPower, incomePerSec, oilPerSec, maxOilOfflineTime, buyUpgrade } = useGameStore();

  // Расчет цен (соответствует логике бэкенда)
  const clickPrice = Math.floor(50 * Math.pow(1.5, clickPower - 1));
  const incomePrice = Math.floor(100 * Math.pow(1.3, Math.floor(incomePerSec / 5)));
  const oilLimitPrice = Math.floor(10 * Math.pow(2, (maxOilOfflineTime / 3600) - 1));

  const upgrades = [
    {
      id: 'click',
      title: 'Инструменты',
      desc: `Сила клика: +1 (Сейчас: ${clickPower})`,
      price: clickPrice,
      currency: 'coins',
      icon: '⛏️',
      canBuy: coins >= clickPrice
    },
    {
      id: 'income',
      title: 'Авто-шахта',
      desc: `Доход: +5/сек (Сейчас: ${incomePerSec})`,
      price: incomePrice,
      currency: 'coins',
      icon: '⚙️',
      canBuy: coins >= incomePrice
    },
    {
      id: 'oilLimit',
      title: 'Хранилище нефти',
      desc: `Лимит: +1 час (Сейчас: ${maxOilOfflineTime / 3600}ч)`,
      price: oilLimitPrice,
      currency: 'oil',
      icon: '🔋',
      canBuy: oil >= oilLimitPrice
    }
  ];

  return (
    <div className="p-4 flex flex-col gap-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-3">
        <span className="text-4xl">🛒</span>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter text-blue-400">Магазин</h1>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-[0.2em]">Улучшение технологий</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {upgrades.map((item) => (
          <button
            key={item.id}
            onClick={() => buyUpgrade(item.id)}
            disabled={!item.canBuy}
            className={`flex items-center justify-between p-5 rounded-[28px] border transition-all active:scale-95 ${
              item.canBuy 
              ? 'bg-white/5 border-white/10' 
              : 'bg-black/20 border-red-900/20 grayscale'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl bg-white/5 w-14 h-14 rounded-2xl flex items-center justify-center">
                {item.icon}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg leading-tight">{item.title}</h3>
                <p className="text-xs text-slate-400">{item.desc}</p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className={`font-black text-lg ${item.canBuy ? 'text-yellow-500' : 'text-red-500'}`}>
                {item.price}
              </span>
              <span className="text-[10px] uppercase font-bold opacity-50">
                {item.currency === 'coins' ? 'Золото 💰' : 'Нефть 🛢️'}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Инфо-блок о бустах (Stars) */}
      <div className="mt-4 p-6 rounded-[32px] bg-gradient-to-br from-blue-600 to-purple-700 shadow-xl relative overflow-hidden group">
        <div className="relative z-10">
          <h3 className="font-black text-xl uppercase tracking-tighter mb-1">Мгновенный буст x2</h3>
          <p className="text-sm opacity-80 mb-4">Удвой доход и клики на всех планетах прямо сейчас!</p>
          <button 
            onClick={() => (useGameStore.getState() as any).buyBoost()}
            className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black uppercase text-sm shadow-lg active:scale-90 transition-transform"
          >
            Активировать за 50 ⭐
          </button>
        </div>
        <span className="absolute -right-4 -bottom-4 text-8xl opacity-20 group-hover:scale-110 transition-transform">⭐</span>
      </div>
    </div>
  );
};

export default Shop;