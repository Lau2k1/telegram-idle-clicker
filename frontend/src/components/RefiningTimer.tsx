import { useEffect, useState } from 'react';
import { formatComplexTime } from '../utils/time';

interface Props {
  until: string;
  onComplete: () => void;
  label: string;
}

const RefiningTimer = ({ until, onComplete, label }: Props) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    const calculate = () => {
      const diff = Math.floor((new Date(until).getTime() - Date.now()) / 1000);
      if (diff <= 0) {
        onComplete();
        return 0;
      }
      return diff;
    };

    setTimeLeft(calculate());
    const interval = setInterval(() => {
      const remaining = calculate();
      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [until, onComplete]);

  if (timeLeft <= 0) return null;

  return (
    <div className="bg-blue-500/10 border border-blue-500/30 rounded-2xl p-4 animate-pulse">
      <div className="text-[10px] uppercase font-black text-blue-400 mb-1">{label}</div>
      <div className="text-xl font-black font-mono">
        {formatComplexTime(timeLeft)}
      </div>
    </div>
  );
};

export default RefiningTimer;