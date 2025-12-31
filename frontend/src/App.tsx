import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import Game from './pages/Game';

function App() {
  const load = useGameStore((s) => s.load);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // 1. Инициализируем Telegram WebApp SDK
    const tg = window.Telegram?.WebApp;

    if (tg) {
      tg.ready();
      tg.expand();
      
      // Сообщаем Telegram, что приложение готово к отрисовке
      console.log("Telegram SDK инициализирован");
    } else {
      console.warn("Telegram SDK не найден. Запуск в режиме браузера.");
    }

    // 2. Загружаем данные пользователя из БД через store
    // Мы используем .then(), чтобы дождаться ответа перед тем как убрать экран загрузки
    load().finally(() => {
      setIsReady(true);
    });

  }, [load]);

  // Пока данные загружаются, можно показать простой лоадер
  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#0a0c1a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium">Загрузка игры...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c1a] text-white">
      {/* Рендерим основной компонент игры. 
        Game.tsx теперь будет получать данные из уже инициализированного стора.
      */}
      <Game />
    </div>
  );
}

export default App;