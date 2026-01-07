import React from "react";
import ReactDOM from "react-dom/client";
import "./main.css";
import App from "./App";

// Удаляем лишние вызовы здесь, так как они теперь внутри App.tsx
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);