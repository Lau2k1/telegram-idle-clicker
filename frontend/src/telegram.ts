export const tg = window.Telegram?.WebApp;

export function initTelegram() {
  if (!tg) return;

  tg.ready();
  tg.expand();
}

export function getTelegramUser() {
  return tg?.initDataUnsafe?.user ?? null;
}
