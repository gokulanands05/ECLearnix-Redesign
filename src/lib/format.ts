export function formatTime(seconds: number) {
  const s = Math.max(0, Math.floor(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function greeting(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function firstName(name?: string) {
  return (name ?? '').trim().split(/\s+/)[0] || 'there';
}

export function initials(name?: string, email?: string) {
  const parts = (name ?? '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'GA';
  if (parts.length === 1) {
    const second = email && email[0] && email[0].toLowerCase() !== parts[0][0].toLowerCase() ? email[0] : parts[0][1] ?? '';
    return (parts[0][0] + second).toUpperCase();
  }
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
