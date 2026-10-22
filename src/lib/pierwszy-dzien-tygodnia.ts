// ============================================================================
// Piekarz — pierwszy dzień tygodnia z ustawień telefonu (D-090, RD-30; OP-53) [M3 D0]
// Cienka warstwa platformy wokół resolveFirstWeekday: czyta expo-localization, reguła jest w src/core/dzien-lokalny.ts.
// Brak modułu, błąd albo puste pole: zapas z regionu, a bez niego poniedziałek.
// ============================================================================

import { getCalendars, getLocales } from 'expo-localization';
import { resolveFirstWeekday, type FirstWeekday } from '../core/dzien-lokalny';

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
