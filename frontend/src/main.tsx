import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import Game from "./pages/Game";

const tg = window.Telegram?.WebApp;

tg?.ready();
tg?.expand();

const user = tg?.initDataUnsafe?.user;

console.log("TG USER:", user);


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Game />
  </React.StrictMode>
);
