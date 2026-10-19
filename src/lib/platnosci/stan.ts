// ============================================================================
// Piekarz — wspólny stan dostępu i nasłuch transakcji od startu (MON-04)
// [M1-audytor-generalny-008; 02-monetyzacja-001]. Jedna kopia stanu na proces; ekrany
// subskrybują ją przez useAppAccess. Kolejność: odczyt sklepu → zapis pamięci → finishTransaction.
// ============================================================================

import type { Purchase } from 'expo-iap';
import { getAppSetting, setAppSetting } from '../../data/settings-store';
import { StorageReadOnlyError } from '../../data/storage-status';
import { ODBLOKOWUJA, KLUCZ_PAMIECI } from './konfiguracja';
import { decyzja, odczytajPamiec, zapisPamieci, Decyzja, Odczyt, Pamiec } from './dostep';
import { odczytajSklep, nasluchujZakupow, zakonczTransakcje, uprawnienieZTransakcji, polacz } from './sklep';
import { _resetEkranu } from './ekran';

export interface StanDostepu {
  decyzja: Decyzja;
  /** true po pierwszym odczycie sklepu (udanym albo z błędem). */
  gotowe: boolean;
}

const POCZATEK: StanDostepu = { decyzja: { dostep: false, powod: 'brak', pamiec: null }, gotowe: false };
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
      // Baza nowsza niż aplikacja: decyzja działa w tej sesji bez zapisu pamięci [M1-audytor-generalny-061]
      if (!(e instanceof StorageReadOnlyError)) throw e;
    }
  }
  ustaw({ decyzja: d, gotowe: true });
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

/** Start aplikacji (app/_layout.tsx): nasłuch transakcji i pierwszy odczyt uprawnień. */
export function uruchomPlatnosci(): () => void {
  const sub = nasluchujZakupow((p) => {
    void obsluzTransakcje(p).catch(() => undefined);
  });
  void polacz()
    .catch(() => undefined)
    .then(() => odswiezDostep());
  return () => sub.remove();
}

/** Tylko testy: nowy proces bez stanu (także zamknięty ekran zakupu). */
export function _resetStanu(): void {
  _resetEkranu();
  stan = POCZATEK;
  sluchacze.clear();
  biezacy = null;
}
