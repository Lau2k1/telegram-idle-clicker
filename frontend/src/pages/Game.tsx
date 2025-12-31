import { useEffect } from "react";
import { useGameStore } from "../store/gameStore";
import ClickButton from "../components/ClickButton";
import Stats from "../components/Stats";
import Upgrade from "../components/Upgrade";

export default function Game() {
  const load = useGameStore((s) => s.load);

  useEffect(() => {
    // Загружаем состояние игры с бэкенда при входе
    load();
  }, [load]);

  return (
    <div className="flex flex-col items-center justify-between p-8 h-screen">
      <Stats />
      <div className="flex-1 flex items-center justify-center">
        <ClickButton />
      </div>
      <div className="w-full max-w-md">
        <Upgrade />
      </div>
    </div>
  );
}