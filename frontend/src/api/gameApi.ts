const API_URL = import.meta.env.VITE_API_URL;

export async function fetchState(userId: number, name?: string) {
  // Добавляем имя в запрос
  const res = await fetch(`${API_URL}/game/state?userId=${userId}&name=${encodeURIComponent(name || '')}`);
  return res.json();
}

export async function clickApi(userId: number) {
  const res = await fetch(`${API_URL}/game/click?userId=${userId}`, { method: 'POST' });
  return res.json();
}

export async function buyClickApi(userId: number) {
  const res = await fetch(`${API_URL}/game/buy-click?userId=${userId}`, { method: 'POST' });
  return res.json();
}

export async function fetchLeaderboard() {
  const res = await fetch(`${API_URL}/game/leaderboard`);
  return res.json();
}