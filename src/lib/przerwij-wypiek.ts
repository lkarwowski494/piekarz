// Trwający wypiek: czy jest i jak go przerwać (jedna ścieżka dla Stolnicy i planu) [M3 p1b a1b]
import { getActiveBake, setActiveBake } from '../data/sqlite-store';
import { loadBakeSession, saveBakeSession } from '../data/bake-session-store';
import { guardSave } from './save-guard';
import { resyncNotifications } from './notifications';

/**
 * Czy trwa wypiek: zapis sesji (źródło po restarcie) albo wypiek przekazany w pamięci, którego Stolnica jeszcze nie
 * zapisała. Nieczytelny zapis liczy się jak brak, tak jak przy przywracaniu na Stolnicy (useBakeSession).
 */
export async function czyTrwaWypiek(): Promise<boolean> {
  return (await trwajacyWypiek()) !== null;
}

/** Trwający wypiek z nazwą (zapis sesji ma pierwszeństwo przed pamięcią); nazwa null, gdy jej brak (stary zapis). */
export async function trwajacyWypiek(): Promise<{ nazwa: string | null } | null> {
  const zapis = await loadBakeSession().catch(() => null);
  const pamiec = getActiveBake();
  if (zapis === null && pamiec === null) return null;
  const nazwa = (zapis?.recipeName ?? pamiec?.recipeName ?? '').trim();
  return { nazwa: nazwa === '' ? null : nazwa };
}

/**
 * Przerwanie wypieku: pamięć, zapis sesji i powiadomienia o krokach (ADR-006). Nieudane skasowanie sesji:
 * „Nie zapisano”, nie cisza [M1-audytor-generalny-120]. Stan ekranu Stolnicy czyści wywołujący.
 */
export function przerwijSesjeWypieku(): Promise<void> {
  setActiveBake(null);
  return guardSave(async () => {
    await saveBakeSession(null);
    await resyncNotifications();
  })();
}
