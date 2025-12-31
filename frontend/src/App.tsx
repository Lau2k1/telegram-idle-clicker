import { useEffect } from 'react';
import { useGameStore } from './store/gameStore';
import Game from './pages/Game';
import { initTelegram, getTelegramUser } from './telegram';

function App() {
  const setUserFromTelegram = useGameStore((s) => s.setUserFromTelegram);

  useEffect(() => {
    // Инициализируем SDK при запуске приложения [cite: 41]
    initTelegram();
    // Сохраняем данные пользователя в глобальный store [cite: 54, 60]
    setUserFromTelegram();
  }, [setUserFromTelegram]);

  const user = getTelegramUser();

  return (
    <div className="min-h-screen bg-[#0a0c1a] text-white">
      {/* Если пользователь не из Telegram, можно вывести заглушку или просто игру */}
      {user ? (
        <Game />
      ) : (
        <div className="flex items-center justify-center h-screen">
          Please open this app via Telegram
        </div>
      )}
    </div>
  );
}

export default App;