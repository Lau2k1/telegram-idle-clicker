import React from "react";
import ReactDOM from "react-dom/client";
import "./styles.css";
import Game from "./pages/Game";
import App from "./App";
import { initTelegram } from './telegram';


initTelegram();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Game />
    <App />
  </React.StrictMode>
);
