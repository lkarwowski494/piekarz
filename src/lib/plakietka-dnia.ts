// ============================================================================
// Piekarz — dzień kroku planu względem dziś (plan wypieku: „Dziś”, „Jutro”, „Pojutrze”, „Wczoraj”, dalej dzień
// tygodnia z datą przez Intl, audyt-niezalezny F-5). Wydzielone bez zmiany zachowania z app/(tabs)/receptury/
// harmonogram.tsx (limit 20 480 B) [M3 p9b].
// ============================================================================

import { t } from './i18n';
import { formatDzienData } from './format';

/** Dzień `d` względem dnia `teraz` (dni kalendarza lokalnego). */
export function plakietkaDnia(d: Date, teraz: Date): string {
  const dDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const todayDay = new Date(teraz.getFullYear(), teraz.getMonth(), teraz.getDate()).getTime();
  const diffDays = Math.round((dDay - todayDay) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return t('Dziś');
  if (diffDays === 1) return t('Jutro');
  if (diffDays === 2) return t('Pojutrze');
  if (diffDays === -1) return t('Wczoraj');
  // dzień tygodnia z datą przez Intl w języku aplikacji [audyt-niezalezny F-5]
  return formatDzienData(d);
}
