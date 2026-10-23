// ============================================================================
// Piekarz — Doktor zakwasu: objaw → możliwe przyczyny → co zrobić (BR-DIAG-002) [M1-audytor-generalny-104]
// Czysta funkcja bez zapisu (ADR-008). Teksty dosłownie z docs/tresci/pl/doktor-zakwasu.md; plamy i nalot dają
// wynik „wyrzuć” z kontroli zakwasu (RD-21-W1) zamiast listy przyczyn.
// ============================================================================

import { evaluateSourdoughSafety } from './sourdough-physics';
import { FIRST_DAY_NO_ACTIVITY } from './starter-log';

export type StarterSymptom = 'no_activity' | 'no_doubling' | 'long_unfed' | 'mold_signs';
export const STARTER_SYMPTOMS: readonly StarterSymptom[] = ['no_activity', 'no_doubling', 'long_unfed', 'mold_signs'];

export type StarterDoctorResult =
  | { kind: 'discard'; title: string; action: string }
  | { kind: 'advice'; symptom: 'first_day' | 'no_doubling' | 'long_unfed'; intro: readonly string[]; causes: readonly string[]; actions: readonly string[] };

/** Nagłówki list (tekst bez twierdzenia). */
export const DOCTOR_CAUSES_HEADER = 'Możliwe przyczyny:';
export const DOCTOR_ACTIONS_HEADER = 'Co zrobić:';

/** objaw.brak-podwojenia: ZAK-SZC-004, ZAK-ZAL-008, ZAK-ZAL-010, ZAK-ZAL-007 */
export const NO_DOUBLING_CAUSES: readonly string[] = [
  'Chłodne miejsce: w niższej temperaturze wzrost i fermentacja zakwasu zwalniają.',
  'Zbyt ciepłe miejsce: fermentacja może przebiegać za szybko, a nawet ustać.',
  'Tylko mąka jasna: zakwas może wtedy ruszać trochę wolniej.',
  'Za mało czasu: 7 dni może nie wystarczyć, a założenie zakwasu potrafi potrwać nawet kilka tygodni.',
];
/** objaw.brak-podwojenia, co zrobić: ZAK-ZAL-007 (co 12 h, RD-24-W3), ZAK-ZAL-008, ZAK-ZAL-010 */
export const NO_DOUBLING_ACTIONS: readonly string[] = [
  'Dokarmiaj dalej co 12 godzin, aż zakwas podwoi objętość w ciągu 6–8 godzin po dokarmieniu.',
  'Postaw zakwas w miejscu o temperaturze około 21 °C.',
  'Dzikie drożdże częściej trafiają się w mące pełnoziarnistej.',
];
/** objaw.dlugo-bez-dokarmiania: ZAK-LOD-004, ZAK-DOK-001 */
export const LONG_UNFED_TEXTS: readonly string[] = [
  'Zakwas długo trzymany w lodówce bez dokarmiania ma grubą warstwę płynu i jest ospały.',
  'Możliwa przyczyna: drożdżom i bakteriom brakuje pożywienia i ich liczebność stopniowo spada.',
  'Co zrobić: dokarmiaj zakwas regularnie; kilka regularnych dokarmień z rzędu powinno postawić go na nogi.',
  'Gdy po dokarmieniu zacznie bąbelkować, dokarm go drugi raz; jeśli w ciągu 12 godzin urośnie i będzie pełen pęcherzyków, jest gotowy na ostatnie dokarmienie przed użyciem.',
];

/**
 * Wynik Doktora zakwasu. Kolejność: plamy → wyrzuć (RD-21-W1); brak aktywności w dniu 1 zakładania → to normalne
 * (RD-24-W5); brak aktywności albo podwojenia później (dzień 5 i dalej, także zakwas dojrzały, `setupDay` null)
 * → przyczyny i rada co 12 h (RD-24-W3); długo bez dokarmiania → ZAK-LOD-004. Bez objawu → null.
 */
export function diagnoseStarter(input: { setupDay: number | null; symptoms: readonly StarterSymptom[] }): StarterDoctorResult | null {
  const has = (s: StarterSymptom) => input.symptoms.includes(s);
  if (has('mold_signs')) {
    const d = evaluateSourdoughSafety({ hasColoredSpots: true });
    return { kind: 'discard', title: d.titlePl, action: d.actionPl };
  }
  if (has('no_activity') && input.setupDay !== null && input.setupDay <= 1) {
    return { kind: 'advice', symptom: 'first_day', intro: FIRST_DAY_NO_ACTIVITY, causes: [], actions: [] };
  }
  if (has('no_activity') || has('no_doubling')) {
    return { kind: 'advice', symptom: 'no_doubling', intro: [], causes: NO_DOUBLING_CAUSES, actions: NO_DOUBLING_ACTIONS };
  }
  if (has('long_unfed')) {
    return { kind: 'advice', symptom: 'long_unfed', intro: LONG_UNFED_TEXTS, causes: [], actions: [] };
  }
  return null;
}
