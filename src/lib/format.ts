// ============================================================================
// Piekarz — formatowanie liczb, dat i godzin do WYŚWIETLANIA (M1-audytor-generalny-070)
// Intl.NumberFormat / Intl.DateTimeFormat według języka aplikacji (Hermes iOS: oba API
// obsługiwane, doc/IntlAPIs.md, odczyt 2026-10-20). Obliczenia, klucze, eksport JSON/CSV
// i wartości pól NumInput NIE używają tego modułu (zostają z kropką).
// ============================================================================

import { getLocales } from 'expo-localization';
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

const numberCache = new Map<string, Intl.NumberFormat>();
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

function dateFormatter(locale: string, options: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
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

/** Godzina i minuta według języka (PL 24 h, EN-US 12 h). */
export function formatTime(value: number | Date, locale: string = appLocale()): string {
  return dateFormatter(locale, TIME_DEFAULT).format(typeof value === 'number' ? new Date(value) : value);
}
