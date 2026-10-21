// ============================================================================
// Piekarz — komplet surowych plików bazy w jednym pliku do udostępnienia
// [M1-audytor-generalny-122; 12-niezawodnosc-503] [M1-audytor-generalny-123; 12-niezawodnosc-505]
// Bez otwierania bazy i bez migracji: .db, -wal i -shm jako base64 w jednym JSON-ie, bo udostępnienie
// bierze jeden plik (wybór P-122 a). Plik trwały w Backup/kopie-ratunkowe/ (Pliki), nie w Caches.
// ============================================================================

import * as FileSystem from 'expo-file-system/legacy';
import { AUTO_DIR, RESCUE_DIR, rescueAfterOpenFailure, stampOf } from './backup';

export const PAKIET_FORMAT = 'piekarz-pliki-bazy';
export const PAKIET_PREFIX = 'piekarz-pliki-bazy-';

/** Zapisuje pakiet istniejących plików bazy; null, gdy żadnego pliku nie ma albo zapis się nie udał. */
export async function pakietPlikowBazy(dbUri: string, blad?: string): Promise<string | null> {
  const docDir = FileSystem.documentDirectory;
  if (!docDir) return null;
  try {
    const name = dbUri.slice(dbUri.lastIndexOf('/') + 1);
    const pliki: Array<{ nazwa: string; base64: string }> = [];
    for (const suffix of ['', '-wal', '-shm']) {
      const from = `${dbUri}${suffix}`;
      if (!(await FileSystem.getInfoAsync(from)).exists) continue;
      pliki.push({ nazwa: `${name}${suffix}`, base64: await FileSystem.readAsStringAsync(from, { encoding: 'base64' }) });
    }
    if (pliki.length === 0) return null;
    const dir = `${docDir}${AUTO_DIR}${RESCUE_DIR}`;
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    const target = `${dir}${PAKIET_PREFIX}${stampOf(new Date())}.json`;
    await FileSystem.writeAsStringAsync(
      target,
      JSON.stringify({ format: PAKIET_FORMAT, wersja: 1, utworzono: new Date().toISOString(), ...(blad ? { blad } : {}), pliki })
    );
    return target;
  } catch {
    return null;
  }
}

/** Zapis ostatniego ratunku: podpis plików bazy (MD5 i rozmiar .db, -wal, -shm) i ścieżka pakietu. */
const OSTATNI_RATUNEK = 'ostatni-ratunek.json';

/** Podpis stanu plików bazy bez otwierania jej; null, gdy plików nie ma albo system nie podał MD5. */
async function podpisPlikowBazy(dbUri: string): Promise<string | null> {
  const czesci: string[] = [];
  for (const suffix of ['', '-wal', '-shm']) {
    const info = await FileSystem.getInfoAsync(`${dbUri}${suffix}`, { md5: true });
    if (!info.exists) continue;
    if (!('md5' in info) || !info.md5) return null;
    czesci.push(`${suffix}:${info.md5}:${info.size}`);
  }
  return czesci.length ? czesci.join('|') : null;
}

/**
 * Po błędzie otwarcia albo odczytu bazy: surowe kopie i plik ratunkowy (024), potem pakiet do udostępnienia.
 * Jeden zestaw na stan plików: przy niezmienionych plikach zwraca pakiet poprzedniego ratunku zamiast nowej
 * kopii (ok. 2× rozmiar bazy na próbę) [M1-audytor-generalny-141; 12-niezawodnosc-506, 12-niezawodnosc-602].
 */
export async function ratujPlikiBazy(dbUri: string, message: string): Promise<string | null> {
  const docDir = FileSystem.documentDirectory;
  const zapis = docDir ? `${docDir}${AUTO_DIR}${RESCUE_DIR}${OSTATNI_RATUNEK}` : null;
  const podpis = await podpisPlikowBazy(dbUri).catch(() => null);
  if (zapis && podpis) {
    try {
      const ostatni = Object(JSON.parse(await FileSystem.readAsStringAsync(zapis)));
      const pakiet: unknown = Reflect.get(ostatni, 'pakiet');
      if (Reflect.get(ostatni, 'podpis') === podpis && typeof pakiet === 'string' && (await FileSystem.getInfoAsync(pakiet)).exists) return pakiet;
    } catch {
      // Brak albo uszkodzony zapis ostatniego ratunku: nowy zestaw
    }
  }
  await rescueAfterOpenFailure(dbUri, message);
  const pakiet = await pakietPlikowBazy(dbUri, message);
  if (zapis && podpis && pakiet) await FileSystem.writeAsStringAsync(zapis, JSON.stringify({ podpis, pakiet })).catch(() => undefined);
  return pakiet;
}
