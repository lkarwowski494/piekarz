import { useState, useEffect } from 'react';
import { EN } from './i18n.en';

export const LANGS = ['pl', 'en'] as const;
export type Lang = typeof LANGS[number];

let currentLang: Lang = 'pl';
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
