

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchState() {
  const res = await fetch(`${API_URL}/game/state`);
  if (!res.ok) throw new Error('Failed to fetch state');
  return res.json();
}

export async function clickApi() {
  const res = await fetch(`${API_URL}/game/click`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to click');
  return res.json();
}

export async function buyClickApi() {
  const res = await fetch(`${API_URL}/game/buy-click`, {
    method: 'POST',
  });
  if (!res.ok) throw new Error('Failed to buy click');
  return res.json();
}

