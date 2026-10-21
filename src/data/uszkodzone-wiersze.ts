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
/** Wiersze już zapisane w pliku (także z poprzednich uruchomień). */
let wPliku: UszkodzonyWiersz[] = [];
let zapis: Promise<void> = Promise.resolve();

const kluczTresci = (w: UszkodzonyWiersz) => `${w.tabela}/${w.id}/${w.surowe}`;
const PLIK_RE = /^uszkodzone-wiersze-.*\.json$/;

/** Plik z poprzedniego uruchomienia z którymś z obecnych wierszy (to samo uszkodzenie); null, gdy go nie ma. */
async function plikTegoUszkodzenia(dir: string): Promise<{ plik: string; wiersze: UszkodzonyWiersz[] } | null> {
  const teraz = new Set(uszkodzoneWiersze().map(kluczTresci));
  let nazwy: string[];
  try {
    nazwy = (await FileSystem.readDirectoryAsync(dir)).filter((n) => PLIK_RE.test(n)).sort().reverse();
  } catch {
    return null;
  }
  for (const n of nazwy) {
    try {
      const w: unknown = Reflect.get(Object(JSON.parse(await FileSystem.readAsStringAsync(`${dir}${n}`))), 'wiersze');
      const wiersze = Array.isArray(w) ? w.filter((x): x is UszkodzonyWiersz => typeof x?.tabela === 'string' && typeof x?.id === 'string' && typeof x?.surowe === 'string') : [];
      if (wiersze.some((x) => teraz.has(kluczTresci(x)))) return { plik: `${dir}${n}`, wiersze };
    } catch {
      // Nieczytelny plik ratunkowy zostaje nietknięty
    }
  }
  return null;
}

/**
 * Jeden plik na uszkodzenie: uruchomienie, które czyta te same wiersze, nie robi nowego pliku, a nowy wiersz
 * dopisuje się do pliku tego uszkodzenia [M1-audytor-generalny-141; 12-niezawodnosc-603].
 */
async function zapiszPlik(): Promise<void> {
  const docDir = FileSystem.documentDirectory;
  if (!docDir) return;
  const dir = `${docDir}${AUTO_DIR}${RESCUE_DIR}`;
  await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  if (plik === null) {
    const poprzedni = await plikTegoUszkodzenia(dir);
    if (poprzedni) ({ plik, wiersze: wPliku } = poprzedni);
  }
  const znane = new Set(wPliku.map(kluczTresci));
  const nowe = uszkodzoneWiersze().filter((w) => !znane.has(kluczTresci(w)));
  if (plik !== null && nowe.length === 0) return;
  plik ??= `${dir}uszkodzone-wiersze-${stampOf(new Date())}.json`;
  wPliku = [...wPliku, ...nowe];
  const body = { format: 'piekarz-uszkodzone-wiersze', zapisano: new Date().toISOString(), wiersze: wPliku };
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
