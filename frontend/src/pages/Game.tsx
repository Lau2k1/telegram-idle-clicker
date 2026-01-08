import React, { useState } from 'react';
import { useGameStore } from '../store/gameStore';

const Game = () => {
  const { clickPower, isBoostActive, click } = useGameStore();
  const [animations, setAnimations] = useState<{ id: number; x: number; y: number; value: number }[]>([]);

  const handlePlanetClick = (e: React.MouseEvent | React.TouchEvent) => {
    // 1. Рассчитываем реальную силу клика с учетом буста
    const multiplier = isBoostActive ? 2 : 1;
    const clickValue = clickPower * multiplier;

    // 2. Вызываем метод клика из стора
    click();

    // 3. Логика координат для анимации
    const x = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const y = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;

    const id = Date.now();
    
    // 4. Добавляем анимацию с ПРАВИЛЬНЫМ значением (clickValue)
    setAnimations(prev => [...prev, { id, x, y, value: clickValue }]);

    // Удаляем анимацию через 1 секунду
    setTimeout(() => {
      setAnimations(prev => prev.filter(anim => anim.id !== id));
    }, 1000);
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-4 overflow-hidden pt-12">
      {/* Анимированный фон */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      {/* Вылетающие цифры */}
      {animations.map(anim => (
        <span
          key={anim.id}
          style={{ 
            left: anim.x, 
            top: anim.y,
            textShadow: isBoostActive ? '0 0 10px rgba(250,204,21,0.8)' : 'none'
          }}
          className={`fixed pointer-events-none font-black text-3xl z-[100] animate-float-up 
            ${isBoostActive ? 'text-yellow-400' : 'text-white'}`}
        >
          +{anim.value}
        </span>
      ))}

      {/* Планета / Кирка */}
      <div className="relative z-10 group cursor-pointer" onClick={handlePlanetClick}>
        <div className={`absolute inset-0 rounded-full blur-2xl transition-all duration-500 
          ${isBoostActive ? 'bg-yellow-500/30 scale-125' : 'bg-blue-500/20 group-hover:bg-blue-500/30'}`} 
        />
        
        <div className="relative transform active:scale-90 transition-transform duration-75 ease-out select-none">
          <div className="text-[180px] drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
            ⛏️
          </div>
          
          {/* Индикатор буста на самой кирке */}
          {isBoostActive && (
            <div className="absolute -top-4 -right-4 bg-yellow-500 text-black text-xs font-black px-3 py-1 rounded-full shadow-lg animate-bounce uppercase">
              x2 Active
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 text-center z-10">
        <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.3em] mb-2">
          Сила добычи
        </p>
        <div className="flex items-center gap-3 bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
          <span className="text-2xl">⚡</span>
          <span className={`text-2xl font-black ${isBoostActive ? 'text-yellow-400' : 'text-white'}`}>
            {clickPower * (isBoostActive ? 2 : 1)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Game;