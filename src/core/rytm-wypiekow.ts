// ============================================================================
// Piekarz — podpowiedź rytmu z historii przy planowaniu (BR-KAL-014; D-114) [M3 D7]
// Czysta funkcja: dzień tygodnia, w którym zwykle kończą się ostatnie wypieki z Dziennika (tej samej receptury, gdy
// jest ich dość — recipe_id z D1, D-10), i przesunięcie dnia „gotowe” w planie. Dzień według strefy urządzenia (RD-29).
// To tylko propozycja: plan pokazuje ją jako wybrany dzień, który użytkownik zmienia jak każdy inny.
// ============================================================================

import { OKNO_RYTMU, PROG_RYTMU } from './kalendarz-config';

/** Wpis Dziennika do rytmu: chwila końca (bez niej start) i receptura. */
export interface WpisRytmu {
  startedAt: number;
  finishedAt?: number;
  recipeId?: string | null;
}

const czytelna = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);

/** Chwila wpisu: koniec, a bez czytelnego końca start; nieczytelny wpis — null (pomijany, RD-29-W6). */
function chwila(w: WpisRytmu): number | null {
  if (czytelna(w.finishedAt)) return w.finishedAt;
  return czytelna(w.startedAt) ? w.startedAt : null;
}

/**
 * Dzień tygodnia (0 = niedziela … 6 = sobota) zwykłego końca wypieku albo null, gdy rytmu nie ma: z OKNO_RYTMU
 * najnowszych wypieków co najmniej PROG_RYTMU kończy się tego samego dnia. Receptura z co najmniej PROG_RYTMU
 * wpisami ma własny rytm; inaczej liczą się wszystkie wypieki.
 */
export function dzienRytmu(wpisy: readonly WpisRytmu[], recipeId?: string | null): number | null {
  const chwile = (lista: readonly WpisRytmu[]) => lista.map(chwila).filter((c): c is number => c !== null);
  const tejReceptury = recipeId ? chwile(wpisy.filter((w) => w.recipeId === recipeId)) : [];
  const zrodlo = tejReceptury.length >= PROG_RYTMU ? tejReceptury : chwile(wpisy);
  const ostatnie = [...zrodlo].sort((a, b) => b - a).slice(0, OKNO_RYTMU);
  const liczby = new Map<number, number>();
  for (const c of ostatnie) {
    const d = new Date(c).getDay();
    liczby.set(d, (liczby.get(d) ?? 0) + 1);
  }
  for (const [d, n] of liczby) if (n >= PROG_RYTMU) return d;
  return null;
}

/** Przesunięcie dnia „gotowe” (1–7 dni od dziś) na najbliższy dzień rytmu po dziś (w sam dzień rytmu — za tydzień). */
export function przesuniecieRytmu(dzienTygodnia: number, now: number): number {
  return (dzienTygodnia - new Date(now).getDay() + 7) % 7 || 7;
}
