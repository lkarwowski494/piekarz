// Trwające wypieki: które trwają, przerwanie jednego i utrwalenie wypieku z pamięci przed startem kolejnego
// [M3 p1b a1b; M3 D3a: wiele wypieków per id, przegląd danych D1 P2-3]
import { getActiveBake, setActiveBake } from '../data/sqlite-store';
import { idSesji, nowaSesja, sesjeDoPokazania } from '../data/bake-session-store';
import { deleteBakeSession, loadActiveBakeSessions, saveActiveBakeSession } from '../data/bake-sessions-store';
import { guardSave } from './save-guard';
import { resyncNotifications } from './notifications';

export interface TrwajacyWypiek {
  id: string;
  /** Nazwa receptury; null, gdy jej brak (stary zapis). */
  nazwa: string | null;
}

/**
 * Trwające wypieki od najstarszego: zapis sesji (źródło po restarcie) i wypiek przekazany w pamięci, którego Stolnica
 * jeszcze nie zapisała. Nieczytelny zapis liczy się jak brak, tak jak przy przywracaniu na Stolnicy.
 */
export async function trwajaceWypieki(): Promise<TrwajacyWypiek[]> {
  const zapis = await loadActiveBakeSessions().catch(() => []);
  return sesjeDoPokazania(getActiveBake(), zapis).map(({ sesja }) => {
    const nazwa = sesja.recipeName.trim();
    return { id: idSesji(sesja), nazwa: nazwa === '' ? null : nazwa };
  });
}

/** Czy trwa jakikolwiek wypiek. */
export async function czyTrwaWypiek(): Promise<boolean> {
  return (await trwajaceWypieki()).length > 0;
}

/**
 * Wypiek z pamięci, którego Stolnica jeszcze nie zapisała, trafia do zapisu, zanim pamięć dostanie kolejny wypiek
 * („Prowadź oba”): inaczej nadpisanie pamięci gubiłoby pierwszy. Błąd zapisu: „Nie zapisano” (guardSave) i false.
 */
export async function utrwalWypiekZPamieci(): Promise<boolean> {
  const pamiec = getActiveBake();
  if (!pamiec) return true;
  const zapis = await loadActiveBakeSessions().catch(() => []);
  if (zapis.some((s) => s.bake?.id === pamiec.id)) return true;
  let ok = false;
  await guardSave(async () => {
    ok = (await saveActiveBakeSession(nowaSesja(pamiec))).ok;
  })();
  return ok;
}

/**
 * Przerwanie jednego wypieku: jego wiersz, pamięć (gdy to ten wypiek) i powiadomienia o krokach (ADR-006); drugi
 * trwający zostaje nietknięty (BR-KAL-016). Nieudane skasowanie: „Nie zapisano”, nie cisza [M1-audytor-generalny-120].
 * Stan ekranu Stolnicy czyści wywołujący.
 */
export function przerwijWypiek(id: string): Promise<void> {
  if (getActiveBake()?.id === id) setActiveBake(null);
  return guardSave(async () => {
    await deleteBakeSession(id);
    await resyncNotifications();
  })();
}
