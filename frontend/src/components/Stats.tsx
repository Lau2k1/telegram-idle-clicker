import { useGameStore } from "../store/gameStore";

export default function Stats() {
  const { coins, incomePerSec, clickPower } = useGameStore();

  return (
    <div className="bg-[#161A34] p-4 rounded-xl w-full text-center">
      <div>🪙 Coins: {coins}</div>
      <div>⚡ Income/sec: {incomePerSec}</div>
      <div>👆 Click power: {clickPower}</div>
    </div>
  );
}
