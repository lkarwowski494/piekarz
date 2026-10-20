import { useState, useEffect } from 'react';
import { getLocales } from 'expo-localization';
import { EN } from './i18n.en';
import { LADOWANIE_SLOWNIKOW } from './i18n-slowniki';

/**
 * Mechanizm dla 35 języków z rejestru `SUPPORTED_LOCALES_35` (DEC-06 b z rozszerzeniem właściciela):
 * aktywne są języki, które mają słownik. Kolejny język = słownik (`src/lib/i18n-slowniki/<kod>`, generowany przez
 * `scripts/wepnij-przeklad.mjs`) + kod w ACTIVE_LANGS + `languages/<kod>.json` [M1-audytor-generalny-048, -093].
 * Kolejność jak `LANGS` w Treningu.
 */
export const ACTIVE_LANGS = [
  'pl', 'en', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr', 'sl', 'sr', 'lt', 'lv', 'et', 'uk', 'es', 'es-419', 'pt', 'pt-BR',
  'de', 'fr', 'it', 'nl', 'sv', 'da', 'nb', 'fi', 'tr', 'el', 'id', 'ms', 'vi', 'ru', 'ja', 'ko', 'zh-Hant',
] as const;
export type Lang = typeof ACTIVE_LANGS[number];
/** Zgodność wstecz: dotychczasowa nazwa listy języków. */
export const LANGS = ACTIVE_LANGS;
/** Język źródłowy (klucze słowników) i język zastępczy dla systemu spoza aktywnych. */
const SOURCE_LANG: Lang = 'pl';
const FALLBACK_LANG: Lang = 'en';
const SETTING_KEY = 'language';

const zaladowane = new Map<Lang, Record<string, string>>([['en', EN]]);

/** Słownik języka, ładowany przy pierwszym użyciu (33 słowniki nie wykonują się przy starcie). */
function slownik(l: Lang): Record<string, string> | undefined {
  let d = zaladowane.get(l);
  if (!d && Object.prototype.hasOwnProperty.call(LADOWANIE_SLOWNIKOW, l)) {
    d = LADOWANIE_SLOWNIKOW[l]();
    zaladowane.set(l, d);
  }
  return d;
}

export function hasDictionary(l: string): boolean {
  return l === 'en' || Object.prototype.hasOwnProperty.call(LADOWANIE_SLOWNIKOW, l);
}

const isActive = (l: string | null | undefined): l is Lang => !!l && (ACTIVE_LANGS as readonly string[]).includes(l);

/** Regiony hiszpańskiego Ameryki Łacińskiej (jak `ES_419_REGIONS` w Treningu, trening/lib/i18n.ts, commit 8273448). */
const ES_419_REGIONS = ['419', 'AR', 'BO', 'BR', 'BZ', 'CL', 'CO', 'CR', 'CU', 'DO', 'EC', 'GT', 'HN', 'JP', 'MX', 'NI', 'PA', 'PE', 'PR', 'PY', 'SV', 'US', 'UY', 'VE'];
/** Chiński pisma tradycyjnego bez zapisu pisma (CLDR likelySubtags: zh_TW, zh_HK, zh_MO → zh_Hant). */
const ZH_HANT_REGIONS = ['TW', 'HK', 'MO'];
/** Przestarzałe i ogólne kody (CLDR languageAlias: in → id, zsm → ms; „no” = norweski, w wydaniu bokmål). */
const LANG_ALIAS: Record<string, string> = { in: 'id', zsm: 'ms', no: 'nb' };

/** Język aplikacji dla jednego tagu systemu albo null (np. chiński uproszczony, arabski) [M1-audytor-generalny-093]. */
function jezykZTagu(tag: string): Lang | null {
  const parts = tag.split(/[-_]/);
  const base0 = (parts[0] ?? '').toLowerCase();
  const base = LANG_ALIAS[base0] ?? base0;
  const region = (parts.slice(1).find((x) => /^([A-Za-z]{2}|\d{3})$/.test(x)) ?? '').toUpperCase();
  const script = (parts.slice(1).find((x) => /^[A-Za-z]{4}$/.test(x)) ?? '').toLowerCase();
  if (base === 'pt') return !region || region === 'BR' ? 'pt-BR' : 'pt';
  if (base === 'es') return ES_419_REGIONS.includes(region) ? 'es-419' : 'es';
  if (base === 'zh') return script === 'hant' || (!script && ZH_HANT_REGIONS.includes(region)) ? 'zh-Hant' : null;
  return isActive(base) ? base : null;
}

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

/**
 * Zapisany wybór, potem pierwszy obsługiwany język z listy systemu (pełny tag, warianty regionalne es-419, pt-BR,
 * zh-Hant i aliasy jak w Treningu, potem kod języka), potem angielski.
 */
export function resolveLanguage(saved: string | null | undefined, deviceTags: readonly string[]): Lang {
  if (isActive(saved)) return saved;
  for (const tag of deviceTags) {
    const l = jezykZTagu(tag);
    if (l) return l;
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
  const text =
    currentLang === SOURCE_LANG
      ? source
      : own(slownik(currentLang), pl) ?? own(slownik(FALLBACK_LANG), pl) ?? source;
  return wypelnij(text, params);
}

/** Parametry {klucz} i przeliczenie jednostek w gotowym tekście. */
function wypelnij(tekst: string, params?: Record<string, string | number>): string {
  let text = tekst;
  if (params) {
    for (const k of Object.keys(params)) {
      text = text.split(`{${k}}`).join(paramText(params[k]));
    }
  }
  return przeliczanie ? przeliczanie(text) : text;
}

let przeliczanie: ((tekst: string) => string) | null = null;

/**
 * Przeliczenie jednostek w gotowym tekście (po parametrach), rejestrowane przez unit-converter: w trybie
 * imperialnym °C → °F i g → oz w każdym tekście z t() (design-spec §7, D-044) [M1-audytor-generalny-096].
 * Bez cyklu importów: i18n nie importuje unit-converter.
 */
export function ustawPrzeliczanieTekstu(fn: ((tekst: string) => string) | null): void {
  przeliczanie = fn;
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

/** Język reguł liczby mnogiej: `pt` w rejestrze to Portugalia, a CLDR dla samego „pt” ma reguły Brazylii. */
export const jezykLiczbyMnogiej = (l: string): string => (l === 'pt' ? 'pt-PT' : l);

/**
 * Liczba mnoga przez mechanizm, bez sklejania [M1-audytor-generalny-047, -071, -093]: kategoria CLDR
 * z Intl.PluralRules dla języka aplikacji (polyfill w src/lib/intl-polyfills.ts). Słownik języka trzyma formy
 * własnych kategorii pod kluczem `<forma one PL>#<kategoria>` (np. ru few/many, sl two, lv zero), bo kategorie
 * i granice różnią się od polskich (ru 21 = one, cs 5 = other, ro 20 = other z „de”). Bez takiego wpisu
 * (pl, en): forma PL tej kategorii przez t() z {n}.
 */
export function tPlural(count: number, forms: PluralForms, params?: Record<string, string | number>): string {
  const cat = new Intl.PluralRules(jezykLiczbyMnogiej(currentLang)).select(count);
  const p = { n: count, ...params };
  if (currentLang !== SOURCE_LANG) {
    const wlasna = own(slownik(currentLang), `${forms.one ?? forms.other}#${cat}`);
    if (wlasna !== undefined) return wypelnij(wlasna, p);
  }
  return t(forms[cat] ?? forms.other, p);
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
