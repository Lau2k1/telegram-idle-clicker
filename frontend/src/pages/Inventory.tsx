import React from 'react';
import { useGameStore } from '../store/gameStore';

const Inventory: React.FC = () => {
  const { inventory } = useGameStore();

  const getItemName = (id: string) => {
    return id.replace(/_/g, ' ').toUpperCase();
  };

  return (
    <div className="inventory-page p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4 text-white text-center">Miner's Backpack</h1>
      
      {inventory.length === 0 ? (
        <div className="text-center text-gray-400 mt-10">
          <p>Your backpack is empty.</p>
          <p className="text-sm mt-2">Collect items from mining or the shop!</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {inventory.map((item) => (
            <div key={item.id} className="bg-gray-800 p-3 rounded-lg flex flex-col items-center border border-gray-700 shadow-lg">
              <div className="w-12 h-12 bg-gray-700 rounded-full mb-2 flex items-center justify-center text-2xl">
                📦
              </div>
              <span className="text-sm font-medium text-center text-white break-words w-full">{getItemName(item.itemId)}</span>
              <span className="text-xs text-yellow-400 mt-1 font-bold">x{item.quantity}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Inventory;
