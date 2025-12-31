const API_URL = import.meta.env.VITE_API_URL;

// Функция для получения userId из Telegram SDK [cite: 42, 61]
const getUserId = () => window.Telegram?.WebApp?.initDataUnsafe?.user?.id;

export async function fetchState() {
  const userId = getUserId();
  const res = await fetch(`${API_URL}/game/state?userId=${userId}`); // [cite: 43]
  if (!res.ok) throw new Error('Failed to fetch state');
  return res.json();
}

export async function clickApi() {
  const userId = getUserId();
  const res = await fetch(`${API_URL}/game/click?userId=${userId}`, { // [cite: 44]
    method: 'POST',
  });
  return res.json();
}

export async function buyClickApi() {
  const userId = getUserId();
  const res = await fetch(`${API_URL}/game/buy-click?userId=${userId}`, { // [cite: 45]
    method: 'POST',
  });
  return res.json();
}