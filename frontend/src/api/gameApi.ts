// Получаем URL бэкенда из переменных окружения Vite
const API_URL = import.meta.env.VITE_API_URL;

/**
 * Получение текущего состояния игрока из БД
 */
export async function fetchState(userId: number) {
  const res = await fetch(`${API_URL}/game/state?userId=${userId}`);
  if (!res.ok) {
    throw new Error(`Ошибка загрузки данных: ${res.status}`);
  }
  return res.json();
}

/**
 * Отправка события клика на сервер
 */
export async function clickApi(userId: number) {
  const res = await fetch(`${API_URL}/game/click?userId=${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Ошибка при клике: ${res.status}`);
  }
  return res.json();
}

/**
 * Запрос на покупку улучшения (увеличение силы клика)
 */
export async function buyClickApi(userId: number) {
  const res = await fetch(`${API_URL}/game/buy-click?userId=${userId}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    throw new Error(`Ошибка при покупке: ${res.status}`);
  }
  return res.json();
}