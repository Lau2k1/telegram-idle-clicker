export const formatComplexTime = (seconds: number) => {
  if (seconds <= 0) return "0с";
  
  const weeks = Math.floor(seconds / (3600 * 24 * 7));
  const days = Math.floor((seconds % (3600 * 24 * 7)) / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (weeks > 0) parts.push(`${weeks}н`);
  if (days > 0) parts.push(`${days}д`);
  if (hours > 0) parts.push(`${hours}ч`);
  if (minutes > 0) parts.push(`${minutes}м`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}с`);

  return parts.join(" ");
};