// ============================================================================
// Piekarz — stan kopii automatycznej po wypieku [M1-audytor-generalny-016; 07-jakosc-003]. Nieudana kopia nie jest
// połykana: zapis chwili błędu w app_settings (trwały po restarcie) i informacja w Ustawieniach → Kopia zapasowa;
// udana kopia czyści stan. Zapis stanu też może się nie udać (baza tylko do odczytu) — wtedy zostaje stan w pamięci.
// ============================================================================
import { useEffect, useState } from 'react';
import type { PiekarzBackupData } from './backup';

/** Klucz app_settings: chwila (ms) ostatniej nieudanej kopii automatycznej albo „” po udanej. */
export const KLUCZ_BLEDU_KOPII = 'kopia_auto_blad';

// Leniwy odczyt: settings-store przez backup.ts importuje i18n (cykl przy imporcie statycznym)
// eslint-disable-next-line @typescript-eslint/no-require-imports -- celowy leniwy require przerywa cykl importów
const ustawienia = (): typeof import('../data/settings-store') => require('../data/settings-store');
// backup.ts importuje warstwę danych, a sqlite-store importuje ten moduł: leniwie, bez cyklu przy starcie
// eslint-disable-next-line @typescript-eslint/no-require-imports -- celowy leniwy require przerywa cykl importów
const kopie = (): typeof import('./backup') => require('./backup');
// eslint-disable-next-line @typescript-eslint/no-require-imports -- celowy leniwy require przerywa cykl importów
const magazyn = (): typeof import('../data/storage-status') => require('../data/storage-status');

let biezacy: number | null | undefined;
const sluchacze = new Set<(v: number | null) => void>();
const oglos = (v: number | null) => {
  biezacy = v;
  sluchacze.forEach((f) => f(v));
};

/** Chwila ostatniej nieudanej kopii automatycznej albo null. */
export async function bladKopiiAuto(): Promise<number | null> {
  if (biezacy !== undefined) return biezacy;
  const v = await ustawienia().getAppSetting(KLUCZ_BLEDU_KOPII).catch(() => undefined);
  oglos(v && /^\d+$/.test(v) ? Number(v) : null);
  return biezacy ?? null;
}

async function zapisz(v: number | null): Promise<void> {
  // Udana kopia bez wcześniejszego błędu: bez zapisu (app_settings bez zbędnego wiersza)
  if (v === null && (await bladKopiiAuto()) === null) return;
  oglos(v);
  await ustawienia().setAppSetting(KLUCZ_BLEDU_KOPII, v === null ? '' : String(v)).catch(() => undefined);
}

/** Kopia automatyczna po zakończonym wypieku z zapisem wyniku (null z autoBackup albo wyjątek = błąd). */
export async function kopiaPoWypieku(zbierz: () => Promise<PiekarzBackupData>): Promise<void> {
  const ok = await zbierz().then((dane) => kopie().autoBackup(dane)).then((sciezka) => sciezka !== null, () => false);
  await zapisz(ok ? null : Date.now());
}

/** Ekran: chwila ostatniej nieudanej kopii albo null; odświeża się po kolejnym wypieku. */
export function useBladKopiiAuto(): number | null {
  const [v, setV] = useState<number | null>(biezacy ?? null);
  useEffect(() => {
    sluchacze.add(setV);
    // Odczyt zapisanego stanu tylko przy otwartej bazie (Ustawienia są za StorageGate)
    if (biezacy === undefined && magazyn().getStorageState() === 'ok') void bladKopiiAuto();
    return () => {
      sluchacze.delete(setV);
    };
  }, []);
  return v;
}
