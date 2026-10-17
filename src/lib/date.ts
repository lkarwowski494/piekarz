// ============================================================================
// Piekarz (Crust) — Date and Duration Formatter (S14, NFR-INT-014)
// Standaryzacja formatowania dat i czasów trwania z uwzględnieniem locale
// ============================================================================

import { lang } from './i18n';

function getLocale(): string {
  const current = lang();
  return current === 'pl' ? 'pl-PL' : 'en-US';
}

export function formatDate(timestamp: number | Date, options?: Intl.DateTimeFormatOptions): string {
  const d = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  return d.toLocaleDateString(getLocale(), options || { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(timestamp: number | Date): string {
  const d = typeof timestamp === 'number' ? new Date(timestamp) : timestamp;
  return d.toLocaleDateString(getLocale(), {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins < 60) {
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }
  const hours = Math.floor(mins / 60);
  const remMins = mins % 60;
  return `${hours}h ${remMins}m`;
}
