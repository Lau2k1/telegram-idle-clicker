import { useEffect, useState } from "react";
import { useGameStore } from "../store/gameStore";

export const BoostTimer = () => {
  const { boostUntil, isBoostActive } = useGameStore();
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!boostUntil || !isBoostActive) {
      setTimeLeft("");
      return;
    }

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(boostUntil);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}д ${hours}ч`);
      } else {
        setTimeLeft(
          `${hours.toString().padStart(2, "0")}:${minutes
            .toString()
            .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
        );
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [boostUntil, isBoostActive]);

  if (!timeLeft) return null;

  return (
    <span className="text-[10px] font-bold text-green-400 ml-1 animate-pulse">
      {timeLeft}
    </span>
  );
};
