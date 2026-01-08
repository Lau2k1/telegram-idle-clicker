import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const Game = () => {
  const { clickPower, isBoostActive, click } = useGameStore();
  const [animations, setAnimations] = useState<{ id: number; x: number; y: number; value: number }[]>([]);

  const handlePlanetClick = (e: React.MouseEvent | React.TouchEvent) => {
    // 1. Считаем реальное значение для анимации (с учетом буста)
    const multiplier = isBoostActive ? 2 : 1;
    const clickValue = clickPower * multiplier;

    // 2. Вызываем логику начисления
    click();

    // 3. Координаты клика
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const id = Date.now();
    
    // 4. Добавляем анимацию с корректным числом
    setAnimations(prev => [...prev, { id, x, y, value: clickValue }]);

    setTimeout(() => {
      setAnimations(prev => prev.filter(anim => anim.id !== id));
    }, 1000);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden pt-12">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {animations.map(anim => (
        <span
          key={anim.id}
          style={{ left: anim.x, top: anim.y }}
          className="fixed pointer-events-none font-black text-3xl text-white z-[100] animate-float-up"
        >
          +{anim.value}
        </span>
      ))}

      <div className="relative z-10 group cursor-pointer" onClick={handlePlanetClick}>
        <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl group-hover:bg-blue-500/30 transition-all duration-500" />
        <div className="relative transform active:scale-90 transition-transform duration-75 ease-out select-none">
          <div className="text-[180px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            ⛏️
          </div>
        </div>
      </div>

      <div className="mt-12 text-center z-10">
        <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] mb-2">
          Сила добычи
        </p>
        <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
          <span className="text-2xl">⚡</span>
          <span className="text-2xl font-black">
            {/* Здесь тоже показываем умноженное значение в статистике */}
            {clickPower * (isBoostActive ? 2 : 1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Game;