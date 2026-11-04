/**
 * p9b2f P9B2F-5: gdy pliku ratunkowego nie da się zapisać, nieczytelna wartość w app_settings nie jest nadpisana
 * (zapiszMaszyne, zapiszWersjeReceptury, setAppSetting po błędzie odczytu); zapis rzuca StorageWriteError
 * („Nie zapisano”), a po naprawie zapisu pliku ta sama operacja się udaje i surowa treść trafia do pliku [M3 p9b2f].
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, dbFilePath } from './helpers/node-sqlite-adapter';
import { zalozBaze1021 } from './helpers/baza-1021';
import type { DaneMaszyny } from '../wybory-parsery';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const m: DaneMaszyny = { v: 1, makaMaxG: 620, ciastoMaxG: null, drozdzeSucheMaxG: null, uklad: 'plyny_najpierw', czasProgramuMin: 190 };
const ZLE_MASZYNA = '{"v":1,"makaMaxG":"620 g"}';
const ZLE_WERSJE = '{"white_pan_loaf":"cos-nowego"';
const ratunkowe = () => [...mockFiles.entries()].filter(([k]) => /uszkodzone-wiersze-.*\.json$/.test(k)).map(([, v]) => v);

describe('p9b2f: błąd zapisu pliku ratunkowego nie pozwala nadpisać nieczytelnej wartości', () => {
  const zapis = FileSystem.writeAsStringAsync as unknown as jest.Mock;
  let oryginal: (uri: string, content: string) => Promise<void>;
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
    oryginal = zapis.getMockImplementation() as typeof oryginal;
  });
  afterEach(() => zapis.mockImplementation(oryginal));
  const psuj = () => zapis.mockImplementation(async () => { throw new Error('brak miejsca'); });

  async function start() {
    zalozBaze1021(APP_DB());
    const app = restartApp();
    await app.schema.initDatabase();
    return app;
  }

  it('zapiszMaszyne: plik ratunkowy się nie zapisał → StorageWriteError, wartość w bazie bez zmian; po naprawie zapis przechodzi', async () => {
    const app = await start();
    await app.store.setAppSetting('maszyna', ZLE_MASZYNA);
    const w = require('../wybory-uzytkownika') as typeof import('../wybory-uzytkownika');
    const { StorageWriteError } = require('../storage-status') as typeof import('../storage-status');
    psuj();
    await expect(w.zapiszMaszyne(m)).rejects.toBeInstanceOf(StorageWriteError);
    expect(await app.store.getAppSetting('maszyna', 'brak')).toBe(ZLE_MASZYNA);
    zapis.mockImplementation(oryginal);
    await w.zapiszMaszyne(m);
    expect(ratunkowe().join('\n')).toContain('620 g');
    expect(await w.wczytajMaszyne()).toEqual({ ok: true, value: m });
  });

  it('zapiszWersjeReceptury: to samo dla mapy wersji', async () => {
    const app = await start();
    await app.store.setAppSetting('wersje_receptur', ZLE_WERSJE);
    const w = require('../wybory-uzytkownika') as typeof import('../wybory-uzytkownika');
    const { StorageWriteError } = require('../storage-status') as typeof import('../storage-status');
    psuj();
    await expect(w.zapiszWersjeReceptury('white_pan_loaf', 'drozdze')).rejects.toBeInstanceOf(StorageWriteError);
    expect(await app.store.getAppSetting('wersje_receptur', 'brak')).toBe(ZLE_WERSJE);
    zapis.mockImplementation(oryginal);
    await w.zapiszWersjeReceptury('white_pan_loaf', 'drozdze');
    expect(ratunkowe().join('\n')).toContain('cos-nowego');
    expect(await w.wczytajWersjeReceptury('white_pan_loaf')).toBe('drozdze');
  });

  it('zapisUszkodzonychLubBlad: bez zgłoszonych wierszy nic nie rzuca; po awarii zapisu rzuca, po naprawie ponowna próba przechodzi', async () => {
    await start();
    const u = require('../uszkodzone-wiersze') as typeof import('../uszkodzone-wiersze');
    const { StorageWriteError } = require('../storage-status') as typeof import('../storage-status');
    await expect(u.zapisUszkodzonychLubBlad()).resolves.toBeUndefined();
    psuj();
    u.zachowajUszkodzony({ tabela: 'app_settings', id: 'x', surowe: 'ZEPSUTE-X' });
    await expect(u.zapisUszkodzonychLubBlad()).rejects.toBeInstanceOf(StorageWriteError);
    zapis.mockImplementation(oryginal);
    await expect(u.zapisUszkodzonychLubBlad()).resolves.toBeUndefined();
    expect(ratunkowe().join('\n')).toContain('ZEPSUTE-X');
  });
});
