import { EN } from './i18n.en';

/**
 * System lokalizacji Piekarz (Apps4Brew standard).
 * Kluczem słownika jest polski tekst źródłowy — czytelny wprost w kodzie TSX.
 * Przy braku tłumaczenia zwracany jest tekst polski (zamiast technicznego pustego klucza).
 */

export const LANGS = ['pl', 'en'] as const;
export type Lang = typeof LANGS[number];

let currentLang: Lang = 'pl';

export function setLang(lang: Lang) {
  currentLang = lang;
}

export function lang(): Lang {
  return currentLang;
}

const own = (dict: Record<string, string>, key: string): string | undefined => {
  return Object.prototype.hasOwnProperty.call(dict, key) ? dict[key] : undefined;
};

/**
 * Tłumaczenie tekstu z opcjonalną interpolacją parametrów {klucz}.
 */
export function t(pl: string, params?: Record<string, string | number>): string {
  let text = currentLang === 'pl' ? pl : own(EN, pl) ?? pl;
  if (params) {
    for (const k of Object.keys(params)) {
      text = text.split(`{${k}}`).join(String(params[k]));
    }
  }
  return text;
}
