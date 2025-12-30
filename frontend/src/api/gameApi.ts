import WebApp from "@twa-dev/sdk";

const API_URL = import.meta.env.VITE_API_URL

function headers() {
  return {
    "Content-Type": "application/json",
    "x-telegram-initdata": WebApp.initData
  };
}

export async function fetchState() {
  const r = await fetch(`${API_URL}/state`, { headers: headers() });
  return r.json();
}

export async function clickApi() {
  await fetch(`${API_URL}/click`, {
    method: "POST",
    headers: headers()
  });
}

export async function buyClickApi() {
  await fetch(`${API_URL}/buy-click`, {
    method: "POST",
    headers: headers()
  });
}
