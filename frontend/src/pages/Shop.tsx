import React from "react";
import { useGameStore } from "../store/gameStore";

const Shop: React.FC = () => {
  const { coins, clickPower, incomePerSec, maxOfflineTime, oilPerSec, buyUpgrade } =
    useGameStore();

  const upgrades = [
    {
      id: "click",
      name: "Мощный Клик",
      desc: "+1 к силе нажатия",
      price: Math.floor(50 * Math.pow(1.5, clickPower - 1)),
      icon: "⚡",
    },
    {
      id: "income",
      name: "Бригада",
      desc: "+5 монеток в секунду",
      price: Math.floor(100 * Math.pow(1.3, Math.floor(incomePerSec / 5))),
      icon: "👷",
    },
    {
      id: "limit",
      name: "Хранилище",
      desc: "+1 час к лимиту оффлайна",
      price: Math.floor(500 * Math.pow(2, maxOfflineTime / 3600 - 1)),
      icon: "📦",
    },
    {
      id: "oilIncome",
      name: "Нефтяной насос",
      desc: "+0.1 нефти/сек",
      price: Math.floor(50000 * Math.pow(1.8, oilPerSec * 10)),
      icon: "⛽",
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-black text-yellow-500 text-center mb-6">
        МАГАЗИН
      </h2>
      <div className="bg-yellow-500/10 border border-yellow-500/20 p-3 rounded-2xl mb-4 text-center">
        <span className="text-yellow-500 font-bold">
          Ваш баланс: {Math.floor(coins).toLocaleString()} 💰
        </span>
      </div>

      {upgrades.map((u) => (
        <div
          key={u.id}
          className="bg-[#1a1c2c] border border-slate-700 p-4 rounded-3xl flex justify-between items-center transition-all active:scale-[0.98]"
        >
          <div className="flex items-center gap-3">
            <span className="text-3xl bg-[#24273d] w-12 h-12 flex items-center justify-center rounded-2xl">
              {u.icon}
            </span>
            <div>
              <div className="font-bold text-white leading-tight">{u.name}</div>
              <div className="text-[10px] text-slate-400 uppercase tracking-wider">
                {u.desc}
              </div>
            </div>
          </div>
          <button
            onClick={() => buyUpgrade(u.id as any)}
            disabled={coins < u.price}
            className={`px-5 py-2 rounded-xl font-black text-sm shadow-lg ${
              coins >= u.price
                ? "bg-yellow-500 text-black shadow-yellow-500/20"
                : "bg-slate-800 text-slate-500"
            }`}
          >
            {u.price.toLocaleString()} 💰
          </button>
        </div>
      ))}
    </div>
  );
};

export default Shop;
