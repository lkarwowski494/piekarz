// ============================================================================
// Piekarz (Crust) — Date and Duration Formatter (S14, NFR-INT-014)
// Standaryzacja formatowania dat i czasów trwania z uwzględnieniem locale
// Daty przez src/lib/format.ts (język aplikacji z regionem urządzenia) [M1-audytor-generalny-070]
// ============================================================================

import { appLocale, formatDate as formatDateIntl } from './format';

export function formatDate(timestamp: number | Date, options?: Intl.DateTimeFormatOptions): string {
  return formatDateIntl(timestamp, appLocale(), options || { year: 'numeric', month: 'short', day: 'numeric' });
}

export function formatDateTime(timestamp: number | Date): string {
  return formatDateIntl(timestamp, appLocale(), {
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
