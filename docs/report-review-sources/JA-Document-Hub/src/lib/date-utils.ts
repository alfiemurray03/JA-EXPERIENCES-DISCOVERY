/**
 * Simple date utilities to avoid date-fns dependency issues.
 */

export function formatDistanceToNow(date: Date | string | null | undefined, options?: { addSuffix?: boolean }): string {
  if (!date) return 'unknown';
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return 'unknown';
  const now = Date.now();
  const diff = now - d.getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  let result: string;
  if (seconds < 60) result = 'just now';
  else if (minutes < 60) result = `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  else if (hours < 24) result = `${hours} hour${hours !== 1 ? 's' : ''}`;
  else if (days < 7) result = `${days} day${days !== 1 ? 's' : ''}`;
  else if (weeks < 5) result = `${weeks} week${weeks !== 1 ? 's' : ''}`;
  else if (months < 12) result = `${months} month${months !== 1 ? 's' : ''}`;
  else result = `${years} year${years !== 1 ? 's' : ''}`;

  if (options?.addSuffix && result !== 'just now') return `${result} ago`;
  return result;
}
