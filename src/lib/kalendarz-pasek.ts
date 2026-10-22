// ============================================================================
// Piekarz — pasek tygodnia na „Dziś” jako czyste funkcje (BR-KAL-001, BR-KAL-002; D-105, makieta roli 04 a2) [M3 D4b]
// Dni od pierwszego dnia tygodnia regionu (RD-30), dziś, skróty i numery przez Intl w języku aplikacji, glify zdarzeń
// różne KSZTAŁTEM (nie tylko kolorem), ciąg wypieku wielodniowego. Czas jako argument, dzień w strefie urządzenia.
// ============================================================================

import { daysOfWeek, localDateKey, type FirstWeekday } from '../core/dzien-lokalny';
import type { ZdarzenieKalendarza } from '../core/kalendarz-zdarzenia';
import type { ZnacznikDnia } from '../core/kalendarz-nastepne';
import { appLocale, formatDate } from './format';

export interface DzienPaska {
  /** Dzień lokalny „RRRR-MM-DD” (RD-29). */
  klucz: string;
  /** Północ lokalna dnia. */
  ms: number;
  dzis: boolean;
  /** Skrót dnia tygodnia według języka (pl „czw.”, en „Thu”). */
  skrot: string;
  /** Numer dnia miesiąca według języka. */
  numer: string;
}

/** Dzień paska z północy dnia (`dzis` według `now`). */
export function dzienPaska(ms: number, now: number): DzienPaska {
  const jezyk = appLocale();
  return {
    klucz: localDateKey(ms),
    ms,
    dzis: localDateKey(ms) === localDateKey(now),
    skrot: formatDate(ms, jezyk, { weekday: 'short' }),
    numer: formatDate(ms, jezyk, { day: 'numeric' }),
  };
}

/**
 * Siedem dni tygodnia, w którym leży `kotwica` (domyślnie `now`), od pierwszego dnia tygodnia (RD-30); `dzis`
 * według `now`, więc poprzedni i następny tydzień nie mają wyróżnionego dnia (BR-KAL-008) [M3 D7].
 */
export function dniPaska(now: number, first: FirstWeekday, kotwica: number = now): DzienPaska[] {
  return daysOfWeek(kotwica, first).map((ms) => dzienPaska(ms, now));
}

/** Data na pasie: „Czwartek, 22 października” (dzień tygodnia wielką literą według języka). */
export function dataSlownie(ms: number): string {
  const jezyk = appLocale();
  const s = formatDate(ms, jezyk, { weekday: 'long', day: 'numeric', month: 'long' });
  return s.charAt(0).toLocaleUpperCase(jezyk) + s.slice(1);
}

/**
 * Glify zdarzeń (makieta roli 04 a2, `a2.css`): krok wypieku = spirala (drugi trwający = trójkąt), „gotowe” = bochenek
 * konturem, wpis Dziennika = bochenek pełny, dokarmiony = kropka, następne karmienie = przerywany pierścień,
 * zakładanie = słoik, piekarnik zajęty = prostokąt z drzwiczkami na tle ostrzeżenia, pierwszy w dniu (makieta
 * `piekarnik-3-kalendarz`, BR-KAL-016) [M3 D6]. Krok planu niezaczętego = spirala kropkowana („plan”, PRZ-13). Zaległe ma osobny glif (koło z wykrzyknikiem).
 */
export type GlifZdarzenia = 'wypiek' | 'wypiek2' | 'gotowe' | 'dziennik' | 'karmienie' | 'karmienie-nastepne' | 'zakladanie' | 'piekarnik' | 'plan';

/** Najwyżej tyle glifów w dniu: glify się nie zawijają (pomiar roli 04 przy 320 pt); całość czyta etykieta dnia. */
export const MAKS_GLIFOW_DNIA = 3;

function glif(z: ZdarzenieKalendarza, wypieki: readonly string[]): GlifZdarzenia {
  switch (z.rodzaj) {
    case 'wypiek-krok':
      // Plan niezaczęty: spirala kropkowana, osobny glif od trwającego wypieku (PRZ-13, makieta a2)
      if (z.zaplanowany) return 'plan';
      return wypieki.indexOf(z.zrodlo.id) === 1 ? 'wypiek2' : 'wypiek';
    case 'wypiek-gotowe':
      return 'gotowe';
    case 'wpis-dziennika':
      return 'dziennik';
    case 'karmienie-zrobione':
      return 'karmienie';
    case 'karmienie-nastepne':
      return 'karmienie-nastepne';
    case 'zakladanie':
      return 'zakladanie';
    case 'piekarnik-zajety':
      return 'piekarnik';
  }
}

/** Glify dnia w kolejności czasu bez powtórzeń (najwyżej MAKS_GLIFOW_DNIA) i to, czy dzień ma zaległe. */
export function glifyDnia(zdarzenia: readonly ZdarzenieKalendarza[], dzien: string, wypieki: readonly string[]): { glify: GlifZdarzenia[]; zalegle: boolean } {
  const dnia = zdarzenia.filter((z) => z.dzien === dzien).sort((a, b) => a.at - b.at);
  const piec = (g: GlifZdarzenia) => (g === 'piekarnik' ? 0 : 1);
  const glify = [...new Set(dnia.filter((z) => !z.zalegle).map((z) => glif(z, wypieki)))].sort((a, b) => piec(a) - piec(b)).slice(0, MAKS_GLIFOW_DNIA);
  return { glify, zalegle: dnia.some((z) => z.zalegle) };
}

/**
 * Ciąg wypieku wielodniowego jako ciągła linia pod dniami (makieta `3a-wypiek-wielodniowy`): dzień w ciągu ma linię
 * do lewej, gdy poprzedni dzień też jest w ciągu, i do prawej, gdy następny; dzień pojedynczy bez linii.
 */
export function ciagDnia(znaczniki: Record<string, ZnacznikDnia>, dni: readonly string[]): Record<string, { lewa: boolean; prawa: boolean }> {
  const w = (d: string | undefined) => d !== undefined && znaczniki[d]?.wypiekWToku === true;
  return Object.fromEntries(dni.map((d, i) => [d, { lewa: w(d) && w(dni[i - 1]), prawa: w(d) && w(dni[i + 1]) }]));
}
