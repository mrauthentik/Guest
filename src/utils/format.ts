/** Lightweight currency formatter for NGN */
export function formatCurrency(amount: number, currency = 'NGN'): string {
  return new Intl.NumberFormat('en-NG', {
    style:    'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Format a date string to a human readable form */
export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-NG', {
    day:   'numeric',
    month: 'long',
    year:  'numeric',
  }).format(new Date(date));
}

/** Calculate number of nights between two dates */
export function calcNights(checkIn: string, checkOut: string): number {
  const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

/** Format a countdown from now to a future date */
export function formatCountdown(expiresAt: string): string {
  const diff = new Date(expiresAt).getTime() - Date.now();
  if (diff <= 0) return 'Expired';
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

/** Truncate a string to n characters */
export function truncate(str: string, n = 60): string {
  return str.length > n ? str.slice(0, n) + '…' : str;
}
