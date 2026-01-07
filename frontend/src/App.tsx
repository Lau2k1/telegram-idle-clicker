import { useEffect, useState, useRef } from 'react';
import { useGameStore } from './store/gameStore';
import Game from './pages/Game';
import OfflineModal from './components/OfflineModal';

function App() {
  const { load, showOfflineModal, offlineBonus, closeOfflineModal } = useGameStore();
  const [isReady, setIsReady] = useState(false);
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Защита от двойного вызова в StrictMode
    if (isInitialMount.current) {
      const tg = window.Telegram?.WebApp;
      if (tg) {
        tg.ready();
        tg.expand();
      }
      
      load().finally(() => {
        setIsReady(true);
      });
      
      isInitialMount.current = false;
    }
  }, [load]);

  if (!isReady) {
    return (
      <div className="min-h-screen bg-[#0a0c1a] flex items-center justify-center text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium">Загрузка данных...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0c1a] text-white overflow-hidden">
      <Game />
      
      {/* Теперь модалка полностью управляется стором и не зависит от ререндеров */}
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