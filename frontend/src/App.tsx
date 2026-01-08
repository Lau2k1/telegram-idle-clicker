import { useEffect, useRef, useState } from "react";
import { useGameStore } from "./store/gameStore";
import Game from "./pages/Game";
import Shop from "./pages/Shop";
import OilMine from "./pages/OilMine";
import Refinery from "./pages/Refinery";
import Leaderboard from "./pages/Leaderboard";
import Stats from "./pages/Stats";
import OfflineModal from "./components/OfflineModal";

function App() {
  const {
    load,
    incomePerSec,
    oilPerSec,
    addResources,
    syncOnline,
    isBoostActive,
  } = useGameStore();

  const [activePage, setActivePage] = useState("planets");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const unsyncedCoins = useRef(0);
  const unsyncedOil = useRef(0);

  // 1. ИНИЦИАЛИЗАЦИЯ
  useEffect(() => {
    load();
  }, [load]);

  // 2. ИГРОВОЙ ЦИКЛ
  useEffect(() => {
    const visualInterval = setInterval(() => {
      const state = useGameStore.getState();
      const multiplier = state.isBoostActive ? 2 : 1;

      const goldToAdd = state.incomePerSec * multiplier;
      const oilToAdd = state.oilPerSec * multiplier;

      if (goldToAdd > 0 || oilToAdd > 0) {
        addResources(goldToAdd, oilToAdd);
        unsyncedCoins.current += goldToAdd;
        unsyncedOil.current += oilToAdd;
      }
    }, 1000);

    const syncInterval = setInterval(() => {
      const state = useGameStore.getState();
      if (
        !state.showOfflineModal &&
        (unsyncedCoins.current > 0 || unsyncedOil.current > 0)
      ) {
        syncOnline(unsyncedCoins.current, unsyncedOil.current);
        unsyncedCoins.current = 0;
        unsyncedOil.current = 0;
      }
    }, 10000);

    return () => {
      clearInterval(visualInterval);
      clearInterval(syncInterval);
    };
  }, [incomePerSec, oilPerSec, isBoostActive, addResources, syncOnline]);

  const renderPage = () => {
    switch (activePage) {
      case "planets": return <Game />;
      case "oil": return <OilMine />;
      case "shop": return <Shop />;
      case "refinery": return <Refinery />;
      case "leaderboard": return <Leaderboard />;
      case "stats": return <Stats />;
      default: return <Game />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0f111a] text-white select-none font-sans overflow-hidden flex flex-col">
      <OfflineModal />

      <header className="h-20 shrink-0 p-4 flex justify-between bg-black/40 backdrop-blur-md z-40 border-b border-white/5">
        <div className="flex flex-col">
          <span className="text-[10px] text-yellow-500/70 uppercase font-black tracking-widest">
            Золото {isBoostActive && "x2"}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <span className="font-black text-xl tracking-tighter">
              {useGameStore((s) => Math.floor(s.coins).toLocaleString())}
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center px-2">
          <span className="text-[10px] text-orange-500/70 uppercase font-black tracking-widest leading-none mb-1">
            Fuel
          </span>
          <div className="flex items-center gap-1">
            <span className="font-black text-lg text-orange-500">
              {useGameStore((s) => Math.floor(s.fuel))}
            </span>
            <span className="text-sm">🚀</span>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-blue-400/70 uppercase font-black tracking-widest">
            {isBoostActive && "x2"} Нефть
          </span>
          <div className="flex items-center gap-2">
            <span className="font-black text-xl text-blue-400">
              {useGameStore((s) => Math.floor(s.oil).toLocaleString())}
            </span>
            <span className="text-xl">🛢️</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-32">{renderPage()}</main>

      <div className="fixed bottom-6 left-0 right-0 flex justify-center z-50 pointer-events-none">
        <button
          onClick={() => setIsMenuOpen(true)}
          className="pointer-events-auto flex flex-col items-center justify-center w-20 h-20 bg-blue-600 rounded-full border-4 border-[#1a1c2c] shadow-[0_10px_30px_rgba(37,99,235,0.6)] active:scale-95 transition-all"
        >
          <span className="text-2xl">🚀</span>
          <span className="text-[10px] font-black uppercase tracking-widest">
            Меню
          </span>
        </button>
      </div>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-[#0f111a]/95 backdrop-blur-2xl z-[60] p-6 flex flex-col overflow-y-auto animate-in fade-in slide-in-from-bottom duration-300">
          <div className="flex justify-between items-center mb-10">
            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Навигация</h2>
            <button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl">✕</button>
          </div>

          <section className="mb-8">
            <h3 className="text-slate-500 text-[12px] font-bold uppercase tracking-[0.2em] mb-4">Планета</h3>
            <div className="flex gap-4">
              <button className="flex-1 p-4 rounded-3xl bg-blue-600 border border-blue-400 flex flex-col items-center gap-2">
                <span className="text-3xl">🌍</span>
                <span className="font-bold">Земля</span>
              </button>
              <button className="flex-1 p-4 rounded-3xl bg-white/5 border border-white/5 opacity-40 flex flex-col items-center gap-2 pointer-events-none">
                <span className="text-3xl">🔴</span>
                <span className="font-bold text-slate-500">Марс</span>
              </button>
            </div>
          </section>

          <section className="mb-8">
            <h3 className="text-slate-500 text-[12px] font-bold uppercase tracking-[0.2em] mb-4">Шахты Земли</h3>
            <div className="grid grid-cols-1 gap-3">
              <button
                onClick={() => { setActivePage("planets"); setIsMenuOpen(false); }}
                className={`flex items-center gap-4 p-5 rounded-3xl border ${activePage === "planets" ? "bg-white/10 border-blue-500" : "bg-white/5 border-white/5"}`}
              >
                <div className="w-12 h-12 bg-yellow-500/20 rounded-2xl flex items-center justify-center text-2xl">💰</div>
                <div>
                  <div className="font-bold text-lg">Золотой прииск</div>
                  <div className="text-xs text-slate-400">Клик и пассивный доход</div>
                </div>
              </button>
              <button
                onClick={() => { setActivePage("oil"); setIsMenuOpen(false); }}
                className={`flex items-center gap-4 p-5 rounded-3xl border ${activePage === "oil" ? "bg-white/10 border-blue-500" : "bg-white/5 border-white/5"}`}
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-2xl flex items-center justify-center text-2xl">🛢️</div>
                <div>
                  <div className="font-bold text-lg">Нефтяная вышка</div>
                  <div className="text-xs text-slate-400">Добыча нефти</div>
                </div>
              </button>
            </div>
          </section>

          <section>
            <h3 className="text-slate-500 text-[12px] font-bold uppercase tracking-[0.2em] mb-4">Сервисы</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { id: "shop", l: "Магазин", i: "🛒" },
                { id: "leaderboard", l: "Топ", i: "🏆" },
                { id: "stats", l: "Статистика", i: "📊" },
                { id: "refinery", l: "Переработка", i: "🏭" },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => { setActivePage(item.id); setIsMenuOpen(false); }}
                  className={`flex items-center gap-3 p-4 rounded-2xl border transition-colors ${activePage === item.id ? "bg-blue-600 border-blue-400" : "bg-white/5 border-white/5 active:bg-white/10"}`}
                >
                  <span>{item.i}</span>
                  <span className="font-bold text-sm">{item.l}</span>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

export default App;