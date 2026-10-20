import { useState, useEffect } from 'react';
import { getLocales } from 'expo-localization';
import { EN } from './i18n.en';

/**
 * Mechanizm dla 35 języków z rejestru `SUPPORTED_LOCALES_35` (DEC-06 b, decyzja właściciela 2a):
 * aktywne są języki, które mają słownik. Kolejny język = słownik w DICTIONARIES + kod w ACTIVE_LANGS
 * + `languages/<kod>.json` (przekład 093, partia 4) [M1-audytor-generalny-048].
 */
export const ACTIVE_LANGS = ['pl', 'en'] as const;
export type Lang = typeof ACTIVE_LANGS[number];
/** Zgodność wstecz: dotychczasowa nazwa listy języków. */
export const LANGS = ACTIVE_LANGS;
/** Język źródłowy (klucze słowników) i język zastępczy dla systemu spoza aktywnych. */
const SOURCE_LANG: Lang = 'pl';
const FALLBACK_LANG: Lang = 'en';
const SETTING_KEY = 'language';

const DICTIONARIES: Partial<Record<Lang, Record<string, string>>> = { en: EN };

export function hasDictionary(l: string): boolean {
  return Object.prototype.hasOwnProperty.call(DICTIONARIES, l);
}

const isActive = (l: string | null | undefined): l is Lang => !!l && (ACTIVE_LANGS as readonly string[]).includes(l);

let currentLang: Lang = SOURCE_LANG;
type LangListener = (l: Lang) => void;
const listeners = new Set<LangListener>();

export function setLang(lang: Lang) {
  currentLang = lang;
  listeners.forEach((fn) => fn(lang));
}

export function lang(): Lang {
  return currentLang;
}

export function useLang(): Lang {
  const [l, setL] = useState<Lang>(currentLang);
  useEffect(() => {
    listeners.add(setL);
    return () => {
      listeners.delete(setL);
    };
  }, []);
  return l;
}

/** Zapisany wybór, potem pierwszy aktywny język z listy systemu (pełny tag, potem kod języka), potem angielski. */
export function resolveLanguage(saved: string | null | undefined, deviceTags: readonly string[]): Lang {
  if (isActive(saved)) return saved;
  for (const tag of deviceTags) {
    if (isActive(tag)) return tag;
    const base = tag.split('-')[0]?.toLowerCase();
    if (isActive(base)) return base;
  }
  return FALLBACK_LANG;
}

// Leniwy odczyt: settings-store przez backup.ts importuje i18n (cykl przy imporcie statycznym)
// eslint-disable-next-line @typescript-eslint/no-require-imports -- celowy leniwy require przerywa cykl importów
const settingsStore = (): typeof import('../data/settings-store') => require('../data/settings-store');

function deviceLanguageTags(): string[] {
  try {
    return getLocales().map((l) => l.languageTag);
  } catch {
    return [];
  }
}

/** Start aplikacji: język z zapisu albo z systemu. Błąd odczytu zapisu nie blokuje startu. */
export async function initLanguage(): Promise<void> {
  let saved: string | undefined;
  try {
    const { getAppSetting } = settingsStore();
    saved = await getAppSetting(SETTING_KEY);
  } catch {
    saved = undefined;
  }
  setLang(resolveLanguage(saved, deviceLanguageTags()));
}

/** Wybór użytkownika w Ustawieniach: zmiana od razu i zapis na kolejne uruchomienia. */
export async function chooseLanguage(l: Lang): Promise<void> {
  setLang(l);
  const { setAppSetting } = settingsStore();
  await setAppSetting(SETTING_KEY, l);
}

const own = (dict: Record<string, string> | undefined, key: string): string | undefined => {
  return dict && Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : undefined;
};

const paramFormats = new Map<Lang, Intl.NumberFormat>();
/** Liczba w parametrze: separator dziesiętny języka aplikacji, bez zaokrąglania i bez separatora tysięcy [M1-audytor-generalny-070]. */
function paramText(v: string | number): string {
  if (typeof v !== 'number' || !Number.isFinite(v)) return String(v);
  let f = paramFormats.get(currentLang);
  if (!f) {
    f = new Intl.NumberFormat(currentLang, { useGrouping: false, maximumFractionDigits: 20 });
    paramFormats.set(currentLang, f);
  }
  return f.format(v);
}

/** Separator kontekstu w kluczu: „Zakwas|składnik” = tekst „Zakwas” w znaczeniu składnika receptury. */
const CONTEXT_SEP = '|';

/**
 * Tłumaczenie tekstu z opcjonalną interpolacją parametrów {klucz}.
 * Ten sam tekst w dwóch znaczeniach = dwa klucze: „tekst|kontekst” (opis w docs/lokalizacja/pl.kontekst.json)
 * [M1-audytor-generalny-074]. Brak wpisu: słownik zastępczy (EN), potem tekst źródłowy bez kontekstu; nigdy pusty tekst.
 */
export function t(pl: string, params?: Record<string, string | number>): string {
  // Wywołanie z wartością spoza słownika (np. undefined z danych) nie może wywrócić ekranu
  const sep = typeof pl === 'string' ? pl.indexOf(CONTEXT_SEP) : -1;
  const source = sep >= 0 ? pl.slice(0, sep) : pl;
  let text =
    currentLang === SOURCE_LANG
      ? source
      : own(DICTIONARIES[currentLang], pl) ?? own(DICTIONARIES[FALLBACK_LANG], pl) ?? source;
  if (params) {
    for (const k of Object.keys(params)) {
      text = text.split(`{${k}}`).join(paramText(params[k]));
    }
  }
  return text;
}

/**
 * Formy liczby mnogiej tekstu źródłowego (PL): klucze słownika dla kategorii CLDR.
 * `other` jest obowiązkowe (PL: ułamki, np. „1,5 dnia”; EN: wszystko poza `one`).
 */
export interface PluralForms {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

/** Forma dla kategorii CLDR liczby `count` w języku `locale`; brak formy w słowniku = `other`. */
function pluralForm(locale: string, count: number, forms: PluralForms): string {
  const cat = new Intl.PluralRules(locale).select(count);
  return forms[cat] ?? forms.other;
}

/**
 * Liczba mnoga przez mechanizm, bez sklejania [M1-audytor-generalny-047, -071]: kategoria CLDR
 * z Intl.PluralRules dla języka aplikacji (polyfill w src/lib/intl-polyfills.ts), potem t() z {n}.
 */
export function tPlural(count: number, forms: PluralForms, params?: Record<string, string | number>): string {
  return t(pluralForm(currentLang, count, forms), { n: count, ...params });
}

/**
 * RD-ENG-09: Polska odmiana liczebników (pluralPl).
 * Dla n = |x| mod 100, n10 = n mod 10:
 * jeśli |x| === 1 -> one (np. 1 minuta, 1 seria)
 * inaczej jeśli n10 in {2, 3, 4} and n not in {12, 13, 14} -> few (np. 2 minuty, 22 minuty, 2 serie)
 * inaczej -> many (np. 0 minut, 5 minut, 12 minut, 112 minut, 5 serii)
 */
export function pluralPl(
  count: number,
  one: string,
  few: string,
  many: string,
  includeNumber = true
): string {
  const abs = Math.abs(Math.round(count));
  const n = abs % 100;
  const n10 = n % 10;
  let word: string;
  if (abs === 1) {
    word = one;
  } else if (n10 >= 2 && n10 <= 4 && !(n >= 12 && n <= 14)) {
    word = few;
  } else {
    word = many;
  }
  return includeNumber ? `${count} ${word}` : word;
}
