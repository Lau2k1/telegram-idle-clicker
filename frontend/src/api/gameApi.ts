import WebApp from "@twa-dev/sdk";

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchState() {
  const res = await fetch(`${API_URL}/state`);
  if (!res.ok) throw new Error("Failed to fetch state");
  return res.json();
}

export async function clickApi() {
  const res = await fetch(`${API_URL}/click`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to click");
}

export async function buyClickApi() {
  const res = await fetch(`${API_URL}/buy-click`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to buy click");
}


