import { useEffect, useState } from 'react';
import { useGameStore } from './store/gameStore';
import Game from './pages/Game';
import OfflineModal from './components/OfflineModal';

function App() {
  const { load, showOfflineModal, offlineBonus, closeOfflineModal } = useGameStore();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    if (tg) {
      tg.ready();
      tg.expand();
    }
    load().finally(() => setIsReady(true));
  }, [load]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#0a0c1a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium">Загрузка шахты...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c1a] text-white overflow-hidden">
      <Game />
      
      {showOfflineModal && (
        <OfflineModal 
          amount={offlineBonus} 
          onClose={closeOfflineModal} 
        />
      )}
    </div>
  );
}

export default App;