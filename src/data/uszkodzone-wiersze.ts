// ============================================================================
// Piekarz — uszkodzone wiersze pomijane przy odczycie [M1-audytor-generalny-121; 12-niezawodnosc-502, 05-architekt-503]
// Surowa treść każdego pominiętego wiersza trafia raz na uruchomienie do pliku ratunkowego
// Backup/kopie-ratunkowe/uszkodzone-wiersze-<czas>.json (widoczny w Plikach) i do kopii zapasowych, także
// przed importem i czyszczeniem (BR-DANE-001). Osobny plik, nie state_corrupt_*: baner tamtego mówi o bazie,
// która się nie otworzyła.
// ============================================================================

import * as FileSystem from 'expo-file-system/legacy';
import { AUTO_DIR, RESCUE_DIR, stampOf } from '../lib/backup';

export interface UszkodzonyWiersz {
  tabela: string;
  id: string;
  /** Surowa treść z bazy (kolumna albo cały wiersz jako JSON). */
  surowe: string;
}

const zgloszone = new Map<string, UszkodzonyWiersz>();
let plik: string | null = null;
let zapis: Promise<void> = Promise.resolve();

async function zapiszPlik(): Promise<void> {
  const docDir = FileSystem.documentDirectory;
  if (!docDir) return;
  const dir = `${docDir}${AUTO_DIR}${RESCUE_DIR}`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  plik ??= `${dir}uszkodzone-wiersze-${stampOf(new Date())}.json`;
  const body = { format: 'piekarz-uszkodzone-wiersze', zapisano: new Date().toISOString(), wiersze: uszkodzoneWiersze() };
  await FileSystem.writeAsStringAsync(plik, JSON.stringify(body, null, 2));
}

/** Zgłoszenie pominiętego wiersza; ten sam wiersz drugi raz niczego nie zmienia. */
export function zachowajUszkodzony(w: UszkodzonyWiersz): void {
  const klucz = `${w.tabela}/${w.id}`;
  if (zgloszone.has(klucz)) return;
  zgloszone.set(klucz, w);
  zapis = zapis.then(zapiszPlik).catch(() => undefined);
}

/** Wiersze zgłoszone w tym uruchomieniu (do kopii zapasowej). */
export function uszkodzoneWiersze(): UszkodzonyWiersz[] {
  return [...zgloszone.values()];
}

/** Obietnica ostatniego zapisu pliku ratunkowego (testy, kolejność przy kopii). */
export function zapisUszkodzonych(): Promise<void> {
  return zapis;
}
