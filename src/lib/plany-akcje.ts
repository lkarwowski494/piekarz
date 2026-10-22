// ============================================================================
// Piekarz — start i usunięcie zaplanowanego wypieku z „Dziś” (BR-KAL-009, D-104, D-108) [M3 D5]
// Cienka warstwa nad bake-sessions-store: start zamienia wiersz planu w trwający (jedna instrukcja z limitem 2),
// usunięcie kasuje tylko wiersz planu (bez pytania, „Przywróć” zapisuje go z powrotem — D-051 1a); po każdym zapisie
// uzgodnienie powiadomień (start planu znika albo przechodzi w kroki trwającego, ADR-006).
// ============================================================================

import { nowaSesja, type BakeSession } from '../data/bake-session-store';
import { deleteBakeSession, savePlannedBake, zacznijZaplanowany, type PlannedBake, type ZapisSesji, type ZapisWersji } from '../data/bake-sessions-store';
import type { ActiveBakeState } from '../data/sqlite-schema';
import { resyncNotifications } from './notifications';

/**
 * Sesja trwającego wypieku z planu: dane wypieku z planu (receptura, zakwas, kroki) z chwilą startu teraz i zaczęciem
 * z dostępem (start wymaga dostępu, D-039 pkt 3); plan bez danych wypieku (zapis D1) — sama nazwa i kroki.
 */
export function sesjaZPlanu(p: PlannedBake, teraz: number): BakeSession {
  const dane: ActiveBakeState = p.bake ?? { id: p.id, recipeName: p.recipeName, startedAt: teraz, currentStageId: p.steps[0]?.id ?? '', steps: [...p.steps] };
  return nowaSesja({ ...dane, id: p.id, startedAt: teraz, zaczetyZDostepem: true, ...(p.recipeId !== undefined ? { recipeId: p.recipeId } : {}) });
}

/** Start planu: trwający wypiek o id planu (Stolnica tego wypieku). */
export async function zacznijPlan(p: PlannedBake, teraz: number): Promise<ZapisWersji> {
  const r = await zacznijZaplanowany(sesjaZPlanu(p, teraz));
  if (r.ok) void resyncNotifications();
  return r;
}

/** Usunięcie planu (bez pytania, z paskiem „Przywróć”, D-051 1a): tylko jego wiersz i jego powiadomienie o starcie. */
export async function usunPlan(id: string): Promise<void> {
  await deleteBakeSession(id);
  void resyncNotifications();
}

/** „Przywróć” po usunięciu: ten sam plan z powrotem (limit 5 jak przy zapisie). */
export async function przywrocPlan(p: PlannedBake): Promise<ZapisSesji> {
  const r = await savePlannedBake(p);
  if (r.ok) void resyncNotifications();
  return r;
}
