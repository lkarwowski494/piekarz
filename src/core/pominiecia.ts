// ============================================================================
// Piekarz — decyzje „Pomiń” przy zaległym karmieniu jako czyste funkcje (BR-KAL-003, BR-KAL-007, D-094) [M3 D4a]
// Zapis: jeden klucz JSON w app_settings (src/data/pominiecia-store.ts), bez zmiany schematu i poza kopią zapasową.
// Zaległy krok wypieku nie ma zapisu: „Pomiń” przesuwa wypiek istniejącą ścieżką kroku (STOP 3, Aktualizacja 4).
// ============================================================================

import { addCalendarDays } from './dzien-lokalny';
import { POMINIECIA_TRZYMAJ_DNI } from './kalendarz-config';

/** Jedna decyzja „Pomiń”: zdarzenie (np. `karmienie:<id zakwasu>`) i chwila pominięcia (ms UTC). */
export interface Pominiecie {
  zdarzenie: string;
  at: number;
}

/** Identyfikator zdarzenia karmienia zakwasu w zapisie pominięć. */
export function idPominieciaKarmienia(starterId: string): string {
  return `karmienie:${starterId}`;
}

function parsujWpis(v: unknown): Pominiecie | null {
  if (typeof v !== 'object' || v === null || !('zdarzenie' in v) || !('at' in v)) return null;
  const { zdarzenie, at } = v;
  return typeof zdarzenie === 'string' && zdarzenie !== '' && typeof at === 'number' && Number.isFinite(at) ? { zdarzenie, at } : null;
}

/** Lista z JSON-a w app_settings (`unknown`): wpisy bez tekstu albo ze złym czasem pominięte; zły JSON → pusta lista. */
export function parsujPominiecia(raw: unknown): Pominiecie[] {
  if (typeof raw !== 'string') return [];
  let v: unknown;
  try {
    v = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(v)) return [];
  return v.map(parsujWpis).filter((p): p is Pominiecie => p !== null);
}

/** Bez wpisów starszych niż POMINIECIA_TRZYMAJ_DNI dni kalendarza od `now` (granica włączna: równo 14 dni zostaje). */
export function oczyscPominiecia(lista: readonly Pominiecie[], now: number): Pominiecie[] {
  const granica = addCalendarDays(now, -POMINIECIA_TRZYMAJ_DNI);
  return lista.filter((p) => p.at >= granica);
}

/** Nowa decyzja na liście: zastępuje starszą tego samego zdarzenia; stare wpisy wyczyszczone. */
export function dodajPominiecie(lista: readonly Pominiecie[], p: Pominiecie, now: number): Pominiecie[] {
  return oczyscPominiecia([...lista.filter((x) => x.zdarzenie !== p.zdarzenie), p], now);
}

/** Ostatnie pominięcie karmienia zakwasu albo undefined. */
export function pominietoKarmienieAt(lista: readonly Pominiecie[], starterId: string): number | undefined {
  const id = idPominieciaKarmienia(starterId);
  let at: number | undefined;
  for (const p of lista) if (p.zdarzenie === id && (at === undefined || p.at > at)) at = p.at;
  return at;
}
