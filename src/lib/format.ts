// ============================================================================
// Piekarz — formatowanie liczb, dat i godzin do WYŚWIETLANIA (M1-audytor-generalny-070)
// Intl.NumberFormat / Intl.DateTimeFormat według języka aplikacji (Hermes iOS: oba API
// obsługiwane, doc/IntlAPIs.md, odczyt 2026-10-20). Obliczenia, klucze, eksport JSON/CSV
// i wartości pól NumInput NIE używają tego modułu (zostają z kropką).
// ============================================================================

import { getCalendars, getLocales } from 'expo-localization';
import { resolveFirstWeekday, type FirstWeekday } from '../core/dzien-lokalny';
import { lang } from './i18n';

export interface NumberFormatOptions {
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  /** Separator tysięcy; domyślnie bez (masa jak na wadze kuchennej: 1250 g). */
  useGrouping?: boolean;
}

/** Tag języka aplikacji z regionem urządzenia, gdy język urządzenia jest ten sam (np. en-GB); inaczej sam kod języka. */
export function appLocale(): string {
  const l = lang();
  try {
    const match = getLocales().find((x) => x.languageCode === l);
    if (match?.languageTag) return match.languageTag;
  } catch {
    // brak modułu lokalizacji: sam kod języka
  }
  return l;
}

/**
 * Pierwszy dzień tygodnia paska (D-090, RD-30; OP-53): ustawienie telefonu (`getCalendars().firstWeekday`), a gdy puste
 * albo niedostępne, region urządzenia według CLDR, a bez niego poniedziałek. Cienka warstwa; reguła w src/core/dzien-lokalny.ts.
 */
export function systemFirstWeekday(): FirstWeekday {
  let ustawienie: number | null = null;
  let region: string | null = null;
  try {
    ustawienie = getCalendars()[0]?.firstWeekday ?? null;
  } catch {
    // brak ustawienia telefonu: region
  }
  try {
    region = getLocales()[0]?.regionCode ?? null;
  } catch {
    // brak regionu: poniedziałek
  }
  return resolveFirstWeekday(ustawienie, region);
}

const numberCache =new Map<string, Intl.NumberFormat>();
const dateCache = new Map<string, Intl.DateTimeFormat>();

export function formatNumber(value: number, locale: string = appLocale(), opts: NumberFormatOptions = {}): string {
  const o: Intl.NumberFormatOptions = {
    minimumFractionDigits: opts.minimumFractionDigits ?? 0,
    maximumFractionDigits: Math.max(opts.maximumFractionDigits ?? 1, opts.minimumFractionDigits ?? 0),
    useGrouping: opts.useGrouping ?? false,
  };
  const key = `${locale}|${o.minimumFractionDigits}|${o.maximumFractionDigits}|${o.useGrouping}`;
  let f = numberCache.get(key);
  if (!f) {
    f = new Intl.NumberFormat(locale, o);
    numberCache.set(key, f);
  }
  return f.format(value);
}

/** Odpowiednik `toFixed(digits)` do wyświetlania: stała liczba miejsc, separator według języka aplikacji. */
export function formatFixed(value: number, digits: number): string {
  return formatNumber(value, appLocale(), { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

/**
 * Formatter bez jawnej strefy zapamiętuje strefę z chwili utworzenia, więc klucz cache ma bieżącą strefę urządzenia:
 * po jej zmianie przy działającej aplikacji godziny (także w treści powiadomień) nie zostają w starej [M3 D2].
 */
function dateFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${Intl.DateTimeFormat().resolvedOptions().timeZone}|${JSON.stringify(options)}`;
  let f = dateCache.get(key);
  if (!f) {
    f = new Intl.DateTimeFormat(locale, options);
    dateCache.set(key, f);
  }
  return f;
}

const DATE_DEFAULT: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
const TIME_DEFAULT: Intl.DateTimeFormatOptions = { hour: '2-digit', minute: '2-digit' };

/** Data (domyślnie PL 25.10.2026, en-GB 25/10/2026, en-US 10/25/2026). */
export function formatDate(
  value: number | Date,
  locale: string = appLocale(),
  options: Intl.DateTimeFormatOptions = DATE_DEFAULT,
): string {
  return dateFormatter(locale, options).format(typeof value === 'number' ? new Date(value) : value);
}

const DZIEN_DATA: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' };

/**
 * Dzień tygodnia z datą (PL „pon., 26 paź”, EN „Mon, Oct 26”) przez Intl w języku aplikacji: skróty dni
 * i miesięcy spójne w każdym języku, bez par kluczy „Pon.”/„sty” [audyt-niezalezny F-5].
 */
export function formatDzienData(value: number | Date, locale: string = appLocale()): string {
  return dateFormatter(locale, DZIEN_DATA).format(typeof value === 'number' ? new Date(value) : value);
}

/** Godzina i minuta według języka (PL 24 h, EN-US 12 h). */
export function formatTime(value: number | Date, locale: string = appLocale()): string {
  return dateFormatter(locale, TIME_DEFAULT).format(typeof value === 'number' ? new Date(value) : value);
}
