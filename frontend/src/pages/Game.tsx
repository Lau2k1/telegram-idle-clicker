import { useEffect } from "react";
import WebApp from "@twa-dev/sdk";
import { useGameStore } from "../store/gameStore";
import ClickButton from "../components/ClickButton";
import Stats from "../components/Stats";
import Upgrade from "../components/Upgrade";


const { setUserFromTelegram } = useGameStore();

useEffect(() => {
  setUserFromTelegram();
}, []);


export default function Game() {
  const load = useGameStore((s) => s.load);

  useEffect(() => {
    WebApp.ready();
    WebApp.expand();
    load();
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-4">
      <Stats />
      <ClickButton />
      <Upgrade />
    </div>
  );
}
