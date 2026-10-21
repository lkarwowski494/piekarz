// ============================================================================
// Piekarz — wspólny stan dostępu i nasłuch transakcji od startu (MON-04)
// [M1-audytor-generalny-008; 02-monetyzacja-001]. Jedna kopia stanu na proces; ekrany
// subskrybują ją przez useAppAccess. Kolejność: odczyt sklepu → zapis pamięci → finishTransaction.
// ============================================================================

import type { Purchase } from 'expo-iap';
import { AppState } from 'react-native';
import { getAppSetting, setAppSetting } from '../../data/settings-store';
import { StorageWriteError } from '../../data/storage-status';
import { ODBLOKOWUJA, KLUCZ_PAMIECI } from './konfiguracja';
import { decyzja, odczytajPamiec, zapisPamieci, Decyzja, Odczyt, Pamiec, Uprawnienie } from './dostep';
import { odczytajSklep, nasluchujZakupow, zakonczTransakcje, uprawnienieZTransakcji, polacz } from './sklep';
import { _resetEkranu } from './ekran';

export interface StanDostepu {
  decyzja: Decyzja;
  /** true po pierwszym odczycie sklepu (udanym albo z błędem). */
  gotowe: boolean;
  /** Uprawnienia z ostatniego udanego odczytu sklepu (uprzedzenie o końcu próby, 126); null = jeszcze brak. */
  uprawnienia?: Uprawnienie[] | null;
}

const POCZATEK: StanDostepu = { decyzja: { dostep: false, powod: 'brak', pamiec: null }, gotowe: false, uprawnienia: null };
let stan: StanDostepu = POCZATEK;
const sluchacze = new Set<(s: StanDostepu) => void>();
let biezacy: Promise<Decyzja> | null = null;

export function pobierzStan(): StanDostepu {
  return stan;
}

export function subskrybujStan(fn: (s: StanDostepu) => void): () => void {
  sluchacze.add(fn);
  return () => {
    sluchacze.delete(fn);
  };
}

function ustaw(nowy: StanDostepu): void {
  stan = nowy;
  sluchacze.forEach((fn) => fn(nowy));
}

async function wczytajPamiec(): Promise<Pamiec> {
  return odczytajPamiec(await getAppSetting(KLUCZ_PAMIECI));
}

/** Decyzja z odczytu; udany odczyt sklepu nadpisuje pamięć (także pustą po zwrocie). */
export async function ustalDostep(odczyt: Odczyt, teraz: number = Date.now()): Promise<Decyzja> {
  const d = decyzja(odczyt, await wczytajPamiec(), teraz, ODBLOKOWUJA);
  if (odczyt.zrodlo === 'sklep') {
    try {
      await setAppSetting(KLUCZ_PAMIECI, zapisPamieci(d.pamiec));
    } catch (e) {
      // Baza nowsza niż aplikacja (061) albo nieudany zapis (120): decyzja działa w tej sesji bez zapisu pamięci,
      // kupujący nie traci dostępu przez pełną pamięć telefonu [M1-audytor-generalny-061; M1-audytor-generalny-120]
      if (!(e instanceof StorageWriteError)) throw e;
    }
  }
  ustaw({ decyzja: d, gotowe: true, uprawnienia: odczyt.zrodlo === 'sklep' ? odczyt.uprawnienia : stan.uprawnienia ?? null });
  return d;
}

/** Odczyt sklepu i decyzja; równoległe wywołania dzielą jeden odczyt. */
export function odswiezDostep(): Promise<Decyzja> {
  if (!biezacy) {
    biezacy = odczytajSklep()
      .then((o) => ustalDostep(o))
      .finally(() => {
        biezacy = null;
      });
  }
  return biezacy;
}

/**
 * Transakcja z nasłuchu (zakup, odnowienie, Ask to Buy, inne urządzenie, kod promocyjny).
 * finishTransaction dopiero po zapisie pamięci z udanego odczytu; przy błędzie odczytu transakcja
 * zostaje niezakończona i StoreKit poda ją ponownie przy następnym starcie.
 */
export async function obsluzTransakcje(p: Purchase): Promise<void> {
  if (p.purchaseState !== 'purchased') return;
  const odczyt = await odczytajSklep();
  if (odczyt.zrodlo !== 'sklep') {
    await ustalDostep(odczyt);
    return;
  }
  const z = uprawnienieZTransakcji(p);
  await ustalDostep(z ? { zrodlo: 'sklep', uprawnienia: [...odczyt.uprawnienia, z] } : odczyt);
  await zakonczTransakcje(p);
}

/**
 * Start aplikacji (app/_layout.tsx): nasłuch transakcji, pierwszy odczyt uprawnień i ponowny odczyt przy każdym
 * powrocie na pierwszy plan: wygaśnięcie w tle działa bez restartu, a uprzedzenie o końcu próby sprawdza się
 * na świeżym stanie (MON-05) [M1-audytor-generalny-144; 02-monetyzacja-505, 02-monetyzacja-601].
 */
export function uruchomPlatnosci(): () => void {
  const sub = nasluchujZakupow((p) => {
    void obsluzTransakcje(p).catch(() => undefined);
  });
  void polacz()
    .catch(() => undefined)
    .then(() => odswiezDostep());
  const powrot = AppState.addEventListener('change', (s) => {
    if (s === 'active') void odswiezDostep().catch(() => undefined);
  });
  return () => {
    sub.remove();
    powrot.remove();
  };
}

/** Tylko testy: nowy proces bez stanu (także zamknięty ekran zakupu). */
export function _resetStanu(): void {
  _resetEkranu();
  stan = POCZATEK;
  sluchacze.clear();
  biezacy = null;
}
