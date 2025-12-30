import { useEffect } from "react";
import Game from "./pages/Game";

declare global {
  interface Window {
    Telegram: any;
  }
}

function App() {
  useEffect(() => {
    const tg = window.Telegram?.WebApp;

    if (!tg) {
      console.warn("Telegram WebApp not found");
      return;
    }

    tg.ready();
    tg.expand();

    console.log("Telegram user:", tg.initDataUnsafe?.user);
  }, []);

  return <Game />;
}

export default App;
