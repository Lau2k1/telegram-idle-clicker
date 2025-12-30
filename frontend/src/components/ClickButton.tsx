import { motion } from "framer-motion";
import { useGameStore } from "../store/gameStore";

export default function ClickButton() {
  const click = useGameStore((s) => s.click);

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={click}
      className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-500 to-cyan-400 text-3xl font-bold shadow-xl"
    >
      TAP
    </motion.button>
  );
}
