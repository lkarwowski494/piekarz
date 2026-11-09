/**
 * Kopie ratunkowe sprawdzone przed udostępnieniem [M1-audytor-generalny-033; 12-niezawodnosc-004, wariant a — DEC-17 a:
 * import pakietu w aplikacji]: kopia przed migracją, surowe kopie po błędzie otwarcia i pakiet do udostępnienia mają
 * zapisany wynik `PRAGMA integrity_check` (z wersją schematu). Prawdziwy SQLite (node:sqlite).
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, dbFilePath, openRaw } from './helpers/node-sqlite-adapter';
import { zalozBaze1021 } from './helpers/baza-1021';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');

describe('M1-audytor-generalny-033: sprawdzenie kopii ratunkowych', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('sprawdzKopieBazy: zdrowa kopia „ok”, uszkodzona „bledy”, pusta baza „pusta”', async () => {
    zalozBaze1021(APP_DB());
    restartApp();
    const { sprawdzKopieBazy } = require('../../lib/sprawdzenie-kopii') as typeof import('../../lib/sprawdzenie-kopii');
    const mozliwe: import('../../lib/sprawdzenie-kopii').WynikSprawdzenia[] = ['ok', 'pusta', 'bledy', 'nie-sprawdzono']; // WynikSprawdzenia
    const zdrowa = dbFilePath('kopia-zdrowa.db', '/Library/SQLite');
    fs.copyFileSync(APP_DB(), zdrowa);
    expect(await sprawdzKopieBazy(`file://${zdrowa}`)).toBe('ok');
    expect(mozliwe).toContain(await sprawdzKopieBazy('bez-katalogu.db'));

    const uszkodzona = dbFilePath('kopia-uszkodzona.db', '/Library/SQLite');
    const bajty = fs.readFileSync(APP_DB());
    bajty.fill(0x5a, 4096, Math.min(bajty.length, 4096 * 3)); // strony 2–3 nadpisane śmieciem
    fs.writeFileSync(uszkodzona, bajty);
    expect(await sprawdzKopieBazy(`file://${uszkodzona}`)).toBe('bledy');

    const pusta = dbFilePath('kopia-pusta.db', '/Library/SQLite');
    openRaw(pusta).close();
    expect(await sprawdzKopieBazy(`file://${pusta}`)).toBe('pusta');
  });

  it('kopia przed migracją (baza 1021 → v7) ma obok plik z wynikiem sprawdzenia „ok”', async () => {
    zalozBaze1021(APP_DB());
    const app = restartApp();
    await app.schema.initDatabase();
    expect(app.status.getStorageState()).toBe('ok');
    const wyniki = [...mockFiles.entries()].filter(([k]) => /przed-migracja.*\.sprawdzenie\.json$|\.db\.sprawdzenie\.json$/.test(k));
    expect(wyniki).toHaveLength(1);
    expect(JSON.parse(wyniki[0][1])).toEqual(expect.objectContaining({ integralnosc: 'ok' }));
  });

  it('pakiet do udostępnienia niesie pole „sprawdzenie” z wynikiem dla surowej kopii', async () => {
    zalozBaze1021(APP_DB());
    restartApp();
    const { pakietPlikowBazy } = require('../../lib/kopia-plikow-bazy') as typeof import('../../lib/kopia-plikow-bazy');
    const uri = `file://${APP_DB()}`;
    mockFiles.set(uri, fs.readFileSync(APP_DB()).toString('base64'));
    const sciezka = await pakietPlikowBazy(uri, 'test', 'ok');
    expect(sciezka).not.toBeNull();
    expect(JSON.parse(String(mockFiles.get(String(sciezka))))).toEqual(expect.objectContaining({ format: 'piekarz-pliki-bazy', sprawdzenie: 'ok' }));
  });
});
