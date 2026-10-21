/**
 * Cienka warstwa systemowej prośby o ocenę (docs/wzrost/petla-opinii.md §1.3)
 * [M1-audytor-generalny-082; 11-wzrost-004]. Woła ją tylko Stolnica po zapisanym wypieku, nigdy
 * przycisk (Apple: „don’t call it in response to a button tap”). Daty próśb zostają na urządzeniu
 * i nie wchodzą do kopii zapasowej.
 */
import * as StoreReview from 'expo-store-review';
import { getAppSetting, setAppSetting } from '../data/settings-store';
import { getBakeLogs } from '../data/sqlite-store';
import { getStorageState } from '../data/storage-status';
import { czyProsicOOcene } from './prosba-o-ocene';

export const KLUCZ_DAT_PROSBY = 'prosba_o_ocene_daty';
/**
 * Zapas na animację zamknięcia okna oceny (Modal „fade”). InteractionManager.runAfterInteractions ze
 * specyfikacji jest w RN 0.86 przestarzały i nie czeka na animację (setImmediate), stąd stała zwłoka.
 */
const ZWLOKA_PO_ZAMKNIECIU_MS = 600;

/** JSON tablicy liczb; uszkodzony zapis to [NaN] (liczy się do limitu), nie pusta lista. */
function odczytajDaty(raw: string | undefined): number[] {
  if (raw === undefined) return [];
  let dane: unknown;
  try {
    dane = JSON.parse(raw);
  } catch {
    return [NaN];
  }
  if (!Array.isArray(dane)) return [NaN];
  return dane.map((d: unknown) => (typeof d === 'number' ? d : NaN));
}

/** Po zapisanym wypieku; liczba ukończonych wypieków z dziennika, bez oceny bochenka (DEC-20 a) [M1-audytor-generalny-138]. */
export async function poprosOOceneJesliWarto(): Promise<void> {
  try {
    // Baza tylko do odczytu (061) albo niedostępna: daty nie da się zapisać, więc nie prosimy.
    if (getStorageState() !== 'ok') return;
    if (!(await StoreReview.isAvailableAsync()) || !(await StoreReview.hasAction())) return;
    const daty = odczytajDaty(await getAppSetting(KLUCZ_DAT_PROSBY));
    const zakonczoneWypieki = (await getBakeLogs()).filter((w) => w.finishedAt != null).length;
    if (!czyProsicOOcene({ zakonczoneWypieki, datyPoprzednichProsb: daty, teraz: Date.now() })) return;
    // Po zamknięciu okna zapisu: prośba jest skutkiem ukończonego wypieku, nie dotknięcia „Zapisz”.
    await new Promise<void>((done) => setTimeout(done, ZWLOKA_PO_ZAMKNIECIU_MS));
    await StoreReview.requestReview();
    await setAppSetting(KLUCZ_DAT_PROSBY, JSON.stringify([...daty, Date.now()]));
  } catch {
    // ERR_STORE_REVIEW_FAILED albo odrzucony zapis: wypiek jest już zapisany, bez komunikatu (M05).
  }
}
