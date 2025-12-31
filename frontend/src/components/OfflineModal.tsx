import React from 'react';

interface OfflineModalProps {
  amount: number;
  onClose: () => void;
}

const OfflineModal: React.FC<OfflineModalProps> = ({ amount, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-[#1a1c2c] border-2 border-yellow-500 rounded-3xl p-8 max-w-sm w-full text-center shadow-[0_0_20px_rgba(234,179,8,0.3)] animate-in fade-in zoom-in duration-300">
        <div className="text-6xl mb-4">⛏️</div>
        <h2 className="text-2xl font-bold text-white mb-2">С возвращением!</h2>
        <p className="text-gray-400 mb-6">
          Твои шахтеры не бездельничали и добыли для тебя:
        </p>
        <div className="text-4xl font-black text-yellow-500 mb-8 flex items-center justify-center gap-2">
          <span>+{amount}</span>
          <span className="text-2xl">💰</span>
        </div>
        <button
          onClick={onClose}
          className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black font-bold rounded-2xl transition-transform active:scale-95"
        >
          Забрать монеты
        </button>
      </div>
    </div>
  );
};

export default OfflineModal;