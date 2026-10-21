// ============================================================================
// Piekarz — krój tytułów według języka aplikacji (D-050) [M1-audytor-generalny-171; 09-lokalizacja-508]
// Plik kroju (assets/fonts/SofiaSansSemiCondensed-wght.ttf) nie ma liter wietnamskich ani pism CJK; iOS
// uzupełnia brakujące znaki krojem systemowym, więc słowo wietnamskie składałoby się z dwóch krojów.
// W tych językach tytuł idzie w całości krojem systemowym (rekomendacja roli 09 do czasu decyzji roli 04).
// Listę pilnuje test src/ui/__tests__/kroj-tytulow-jezyki-171.test.ts (cmap kroju kontra teksty 35 języków).
// ============================================================================

import { lang, type Lang } from '../lib/i18n';
import { typografia } from './tokeny';

export const JEZYKI_POZA_KROJEM_TYTULOW: readonly Lang[] = ['vi', 'ja', 'ko', 'zh-Hant'];

/** Krój tytułów dla bieżącego języka; `undefined` = krój systemowy. Czytany przy renderze (getter w stylach). */
export function krojTytulowDlaJezyka(): string | undefined {
  return JEZYKI_POZA_KROJEM_TYTULOW.includes(lang()) ? undefined : typografia.krojTytulow;
}
