// ============================================================================
// Piekarz — plany na przyszłe dni (D-092, D-108; BR-KAL-009, BR-KAL-015) [M3 D5]
// Czyste funkcje: dni do wyboru „gotowe” w planie wypieku, skrót „Zaplanuj wypiek na ten dzień” z arkusza dnia,
// kolizja kroków czynnych z innymi planami i trwającymi wypiekami, start planu po nadejściu czasu.
// ============================================================================

import type { SessionStep } from './bake-steps';
import { ZASIEG_DNI_PLANU } from './kalendarz-config';
import { calendarDayDiff } from './dzien-lokalny';
import { MAX_ZAPLANOWANYCH_WYPIEKOW } from './limity-wypiekow';

/** Przesunięcia dni (0 = dziś … ZASIEG_DNI_PLANU) do wyboru dnia „gotowe” w planie wypieku (D-108). */
export function dniPlanu(): number[] {
  return Array.from({ length: ZASIEG_DNI_PLANU + 1 }, (_, i) => i);
}

/** Przesunięcie dnia `dzienMs` względem dnia `now` (dni kalendarza, D-093) w zasięgu planu; poza zasięgiem albo miniony → null. */
export function przesuniecieDnia(dzienMs: number, now: number): number | null {
  const d = calendarDayDiff(now, dzienMs);
  return d >= 0 && d <= ZASIEG_DNI_PLANU ? d : null;
}

/** Czy arkusz dnia pokazuje skrót „Zaplanuj wypiek na ten dzień”, a jeśli nie — dlaczego. */
export type SkrotZaplanuj = 'pokaz' | 'miniony' | 'poza-zasiegiem' | 'limit';

/**
 * Skrót z arkusza dnia (BR-KAL-015 po D-092, D-108): dzień miniony i dzień poza zasięgiem planu bez skrótu, limit
 * zaplanowanych (5) też; trwający wypiek skrótu nie blokuje (kilka wypieków naraz, D-092).
 */
export function skrotZaplanuj(dzienMs: number, now: number, liczbaPlanow: number): SkrotZaplanuj {
  if (calendarDayDiff(now, dzienMs) < 0) return 'miniony';
  if (przesuniecieDnia(dzienMs, now) === null) return 'poza-zasiegiem';
  return liczbaPlanow >= MAX_ZAPLANOWANYCH_WYPIEKOW ? 'limit' : 'pokaz';
}

export type KrokKolizji = Pick<SessionStep, 'name' | 'isPassive' | 'plannedStart' | 'plannedEnd'>;

/** Kolizja: krok nowego planu nachodzi w czasie na krok czynny innego wypieku (nazwa kroku i godzina). */
export interface Kolizja {
  krok: string;
  wypiek: string;
  krokInny: string;
  at: number;
}

const czynny = (k: KrokKolizji): k is KrokKolizji & { plannedStart: number; plannedEnd: number } =>
  !k.isPassive && typeof k.plannedStart === 'number' && typeof k.plannedEnd === 'number' && k.plannedEnd > k.plannedStart;

/**
 * Kolizja planów (BR-KAL-009): krok czynny (`isPassive` = false, ręce przy cieście) nowego planu i krok czynny innego
 * wypieku nachodzą na siebie w czasie [start, koniec). Godzina kolizji = początek części wspólnej. Kroki bierne
 * (fermentacja, garowanie) nie kolidują; piekarnik osobno (BR-KAL-016, D6).
 */
export function kolizjePlanu(kroki: readonly KrokKolizji[], inne: readonly { nazwa: string; kroki: readonly KrokKolizji[] }[]): Kolizja[] {
  const out: Kolizja[] = [];
  for (const a of kroki.filter(czynny)) {
    for (const w of inne) {
      for (const b of w.kroki.filter(czynny)) {
        if (a.plannedStart < b.plannedEnd && b.plannedStart < a.plannedEnd) {
          out.push({ krok: a.name, wypiek: w.nazwa, krokInny: b.name, at: Math.max(a.plannedStart, b.plannedStart) });
        }
      }
    }
  }
  return out.sort((x, y) => x.at - y.at);
}

/** Chwila startu planu: początek kroku 1, a bez niego zapisany start planu. */
export function startPlanuAt(p: { plannedStartAt: number; steps: readonly Pick<SessionStep, 'plannedStart'>[] }): number {
  return p.steps[0]?.plannedStart ?? p.plannedStartAt;
}

/** Czas startu nadszedł (start ≤ teraz): plan można zacząć, a w „Następne” jest zaległy. */
export function startNadszedl(p: { plannedStartAt: number; steps: readonly Pick<SessionStep, 'plannedStart'>[] }, now: number): boolean {
  return startPlanuAt(p) <= now;
}
