import { useGameStore } from "../store/gameStore";

export default function Upgrade() {
  const { clickPower, buyClick } = useGameStore();
  const price = clickPower * 10;

  return (
    <button
      onClick={buyClick}
      className="bg-[#1E2347] rounded-xl p-4 w-full"
    >
      Upgrade click (+1) — 🪙 {price}
    </button>
  );
}
