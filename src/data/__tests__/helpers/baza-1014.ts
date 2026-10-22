/**
 * Kopia bazy buildu 1014 (v1.0.0-b1014 = f42c0d8; 1015 = 2b0db0f i 1016 bez zmian w src/data) do testów migracji D1
 * (zasada wspólna 10: test na kopii bazy poprzedniej wersji) [M3 D1].
 *
 * Fixture zamiast generatora z bieżącego kodu: plik tests/fixtures/baza-1014-f42c0d8.sql to zrzut bazy zapisanej
 * kodem zapisu buildu 1014, więc migracja D1 (nowy kod zapisu) nie zmienia kopii, na której się ją sprawdza.
 * Obok: eksport JSON z tego samego stanu (kopia-1014-f42c0d8.json) i zapis trwającej sesji v2
 * (bake-session-v2-pauza-1014.json: krok z minutnikiem, zegar zatrzymany).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { openRaw, tableCounts } from './node-sqlite-adapter';

const FIXTURES = path.join(__dirname, '..', '..', '..', '..', 'tests', 'fixtures');
const czytaj = (nazwa: string) => fs.readFileSync(path.join(FIXTURES, nazwa), 'utf8');

/** Klucz trwającej sesji w app_settings w buildzie 1014. */
export const KLUCZ_SESJI_1014 = 'active_bake_session';

/** Wersja schematu bazy buildu 1014. */
export const WERSJA_SCHEMATU_1014 = 5;

/** Zapis sesji, którego build 1014 nie odczyta (urwany JSON). */
export const SESJA_USZKODZONA = '{"version":2,"steps":[{"id":"mix","name":"Mieszanie"';

export type WariantSesji1014 = 'v2-pauza' | 'v2-zytnia' | 'v1' | 'uszkodzona' | 'pusta' | 'brak';

/** Surowa wartość klucza sesji dla wariantu; null = brak wiersza. */
export function surowaSesja1014(wariant: WariantSesji1014): string | null {
  switch (wariant) {
    case 'v2-pauza':
      return JSON.stringify(JSON.parse(czytaj('bake-session-v2-pauza-1014.json')));
    case 'v2-zytnia':
      return JSON.stringify(JSON.parse(czytaj('bake-session-v2-rye.json')));
    case 'v1':
      return JSON.stringify(JSON.parse(czytaj('bake-session-v1-1c38b28.json')));
    case 'uszkodzona':
      return SESJA_USZKODZONA;
    case 'pusta':
      // Build 1014 kasuje sesję zapisem pustego tekstu (koniec albo przerwanie wypieku)
      return '';
    case 'brak':
      return null;
  }
}

/** Zrzut bazy buildu 1014 (SQL). */
export function zrzutBazy1014(): string {
  return czytaj('baza-1014-f42c0d8.sql');
}

/** Eksport JSON (kopia zapasowa) z buildu 1014, z tego samego stanu co baza. */
export function kopia1014(): string {
  return czytaj('kopia-1014-f42c0d8.json');
}

/**
 * Zakłada w `plik` bazę buildu 1014 z wybranym wariantem trwającej sesji (domyślnie v2 z pauzą) i zwraca
 * liczności tabel. Plik ma tryb WAL jak w aplikacji.
 */
export function zalozBaze1014(plik: string, wariant: WariantSesji1014 = 'v2-pauza'): Record<string, number> {
  const raw = openRaw(plik);
  raw.exec(zrzutBazy1014());
  const sesja = surowaSesja1014(wariant);
  if (sesja === null) raw.prepare('DELETE FROM app_settings WHERE key = ?').run(KLUCZ_SESJI_1014);
  else raw.prepare('UPDATE app_settings SET value = ? WHERE key = ?').run(sesja, KLUCZ_SESJI_1014);
  const liczby = tableCounts(raw);
  raw.close();
  return liczby;
}
