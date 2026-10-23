// ============================================================================
// Piekarz — stały dzień karmienia zakwasu w lodówce: kiedy można go ustawić i decyzja po karmieniu w inny dzień
// (BR-KAL-010; RD-25, RD-31; ZAK-ZAL-012) [M3 D7]. Czyste funkcje; logika przypomnień jest w notification-feeding.ts (D2).
// ============================================================================

import { calendarDayDiff } from './dzien-lokalny';
import { STALY_DZIEN_OD_DNI } from './kalendarz-config';
import { pytanieOStalyDzien } from './notification-feeding';
import type { PlanStarter } from './notification-plan';

/**
 * Dostępność ustawienia: `dostepny`; `nie-lodowka` (zakwas na blacie); `zakladanie` (zakwas w trakcie zakładania,
 * RD-31); `za-wczesnie` (zakładanie skończone, ale od założenia minęło mniej niż 7 dni — ZAK-ZAL-012).
 * Zakwas dodany jako gotowy (bez zakładania w aplikacji) nie ma daty założenia: ustawienie jest dostępne.
 */
export type DostepnoscStalegoDnia = 'dostepny' | 'nie-lodowka' | 'zakladanie' | 'za-wczesnie';

const czytelna = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

export function dostepnoscStalegoDnia(s: PlanStarter, now: number): DostepnoscStalegoDnia {
  if (s.storageState !== 'FRIDGE') return 'nie-lodowka';
  if (!czytelna(s.setupStartedAt)) return 'dostepny';
  if (!czytelna(s.setupCompletedAt)) return 'zakladanie';
  return calendarDayDiff(s.setupStartedAt, now) < STALY_DZIEN_OD_DNI ? 'za-wczesnie' : 'dostepny';
}

/** Decyzja po karmieniu w inny dzień: `zostaw` — dzień bez zmian, `licz-od` — dniem staje się dzień karmienia. */
export type DecyzjaStalegoDnia = 'zostaw' | 'licz-od';

/** Stały dzień po decyzji (ta sama godzina); bez stałego dnia — null; karmienie w stały dzień — bez zmian. */
export function stalyDzienPoDecyzji(
  s: PlanStarter,
  fedAt: number,
  decyzja: DecyzjaStalegoDnia
): { weekday: number; minuteOfDay: number } | null {
  const staly = s.fridgeFeedDay ?? null;
  const pytanie = pytanieOStalyDzien(s, fedAt);
  if (!staly || !pytanie || decyzja === 'zostaw') return staly;
  return { weekday: pytanie.dzienKarmienia, minuteOfDay: staly.minuteOfDay };
}
