// ============================================================================
// Piekarz — karmienia budzące zakwas z lodówki w planie wypieku (RD-33, D-052; BR-KAL-009) [M3 D5]
// Jedno karmienie 12 h przed mieszaniem (krok planu `fridge_wake_feed`, src/core/fridge-wake.ts). Gdy zakwas nie
// podwoi objętości w 8 h od karmienia, kolejne karmienie 12 h po poprzednim z dopiskiem „jeśli zakwas nie podwoił
// objętości” i propozycją przesunięcia planu; bez stałej liczby karmień (ZAK-LOD-900). Czysta funkcja: kalendarz
// i powiadomienia biorą wynik stąd (jedna reguła, bez dublowania).
// ============================================================================

import type { SessionStep } from './bake-steps';
import { FRIDGE_WAKE_LEAD_H, FRIDGE_WAKE_STEP_ID } from './fridge-wake';
import { STARTER_DOUBLING_MAX_H } from './starter-log';

const H = 3_600_000;
/** Kolejne karmienie budzące 12 h po poprzednim (D-052; ZAK-LOD-002 „dokarmiaj go co 12 godzin”). */
export const KOLEJNE_KARMIENIE_BUDZACE_H = 12;

/** RD-33: karmienie budzące = mieszanie − 12 h czasu upływu (RD-33-W5); plan bez godziny mieszania nie ma karmienia (RD-33-W6). */
export function karmienieBudzaceAt(mieszanieAt: number | null): number | null {
  return mieszanieAt === null ? null : mieszanieAt - FRIDGE_WAKE_LEAD_H * H;
}

/** Stan po karmieniu budzącym: gotowy, czeka na podwojenie albo kolejne karmienie z propozycją przesunięcia. */
export type StanBudzenia =
  | { kind: 'gotowy' }
  | { kind: 'czeka'; sprawdzDo: number }
  | { kind: 'kolejne'; at: number; propozycjaPrzesuniecia: true };

/**
 * RD-33: podwojenie ≤ 8 h po karmieniu (granica włączna, ZAK-LOD-002) → gotowy; bez podwojenia do 8 h → czeka;
 * po 8 h bez podwojenia → kolejne karmienie = karmienie + 12 h i propozycja przesunięcia planu (BR-ZAKW-006).
 */
export function stanBudzenia(karmienieAt: number, podwojenieAt: number | null, now: number): StanBudzenia {
  const granica = karmienieAt + STARTER_DOUBLING_MAX_H * H;
  if (podwojenieAt !== null && podwojenieAt >= karmienieAt && podwojenieAt <= granica) return { kind: 'gotowy' };
  if (now <= granica) return { kind: 'czeka', sprawdzDo: granica };
  return { kind: 'kolejne', at: karmienieAt + KOLEJNE_KARMIENIE_BUDZACE_H * H, propozycjaPrzesuniecia: true };
}

/** Wypiek (trwający albo zaplanowany) z krokami planu i zakwasem planu. */
export interface WypiekZBudzeniem {
  id: string;
  recipeName: string;
  starterId?: string;
  steps: readonly Pick<SessionStep, 'id' | 'plannedStart' | 'plannedEnd'>[];
  /** Bieżący krok trwającego wypieku; brak = plan jeszcze niezaczęty. */
  stepIdx?: number;
}

export interface WpisBudzenia {
  starterId: string;
  kind: 'feeding' | 'observation';
  occurredAt: number;
  signs?: readonly string[];
}

export interface KolejneKarmienieBudzace {
  wypiekId: string;
  recipeName: string;
  starterId: string;
  starterName: string;
  at: number;
  propozycjaPrzesuniecia: true;
}

const czytelna = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/**
 * Kolejne karmienia budzące wypieków z krokiem `fridge_wake_feed`: tylko dopóki wypiek nie przeszedł za ten krok
 * (plan niezaczęty albo trwający na kroku karmienia). Karmienie budzące to ostatnie dokarmienie zakwasu planu od
 * 12 h przed planowanym karmieniem (wcześniejsze dokarmienie należy do zwykłego rytmu zakwasu, D-108); podwojenie —
 * pierwsza obserwacja „podwoił” po nim. Bez dokarmienia w oknie: nic (sam krok planu mówi, kiedy karmić).
 */
export function kolejneKarmieniaBudzace(
  wypieki: readonly WypiekZBudzeniem[],
  zakwasy: readonly { id: string; name: string }[],
  wpisy: readonly WpisBudzenia[],
  now: number
): KolejneKarmienieBudzace[] {
  const out: KolejneKarmienieBudzace[] = [];
  for (const w of wypieki) {
    const idx = w.steps.findIndex((s) => s.id === FRIDGE_WAKE_STEP_ID);
    const krok = w.steps[idx];
    const zakwas = zakwasy.find((z) => z.id === w.starterId);
    if (!krok || !zakwas || !czytelna(krok.plannedStart) || (w.stepIdx !== undefined && w.stepIdx > idx)) continue;
    const od = krok.plannedStart - FRIDGE_WAKE_LEAD_H * H;
    const wlasne = wpisy.filter((e) => e.starterId === zakwas.id && czytelna(e.occurredAt));
    const karmienie = wlasne.filter((e) => e.kind === 'feeding' && e.occurredAt >= od).sort((a, b) => b.occurredAt - a.occurredAt)[0];
    if (!karmienie) continue;
    const podwojenie = wlasne
      .filter((e) => e.kind === 'observation' && e.occurredAt >= karmienie.occurredAt && (e.signs ?? []).includes('doubled'))
      .sort((a, b) => a.occurredAt - b.occurredAt)[0];
    const stan = stanBudzenia(karmienie.occurredAt, podwojenie?.occurredAt ?? null, now);
    if (stan.kind === 'kolejne') {
      out.push({ wypiekId: w.id, recipeName: w.recipeName, starterId: zakwas.id, starterName: zakwas.name, at: stan.at, propozycjaPrzesuniecia: true });
    }
  }
  return out;
}
