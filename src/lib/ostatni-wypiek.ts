// ============================================================================
// Piekarz — zdanie „Ostatni wypiek: {data}” na pasie Dziennika (D10 opcja A, makieta roli 04 `d10-A-pas-390`)
// [M3 D10]. Data z wpisów Dziennika (początek wypieku, jak data na karcie wpisu); pusty Dziennik = brak zdania.
// ============================================================================

import { t } from './i18n';
import { appLocale, formatDate } from './format';

/** Początek najpóźniejszego wypieku w Dzienniku; brak wpisów = null (bez zgadywanej daty). */
export function ostatniWypiekMs(logi: readonly { startedAt: number }[]): number | null {
  return logi.reduce<number | null>((max, l) => (max === null || l.startedAt > max ? l.startedAt : max), null);
}

/** „Ostatni wypiek: poniedziałek, 19 października” w języku aplikacji; null bez wypieku. */
export function tekstOstatniegoWypieku(ms: number | null): string | null {
  if (ms === null) return null;
  return t('Ostatni wypiek: {data}', { data: formatDate(ms, appLocale(), { weekday: 'long', day: 'numeric', month: 'long' }) });
}
