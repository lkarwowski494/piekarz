/**
 * p9b-2: zapis danych maszyny (D-242 Z4 a, BR-MASZ-002) z ekranu: nieczytelna zapisana wartość trafia do pliku
 * ratunkowego przed nadpisaniem (uwaga przeglądu p9b-1: „zapiszMaszyne nadpisuje bez pliku ratunkowego”) [M3 p9b2].
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, dbFilePath } from './helpers/node-sqlite-adapter';
import { zalozBaze1021 } from './helpers/baza-1021';
import type { DaneMaszyny } from '../wybory-parsery';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const m: DaneMaszyny = { v: 1, makaMaxG: 620, ciastoMaxG: null, drozdzeSucheMaxG: null, uklad: 'plyny_najpierw', czasProgramuMin: 190 };
const ratunkowe = () => [...mockFiles.entries()].filter(([k]) => /uszkodzone-wiersze-.*\.json$/.test(k)).map(([, v]) => v);

describe('p9b-2: zapiszMaszyne bez cichej utraty zapisu', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('nieczytelna wartość klucza maszyna: surowa treść w pliku ratunkowym, potem nowy zapis', async () => {
    zalozBaze1021(APP_DB());
    const app = restartApp();
    await app.schema.initDatabase();
    await app.store.setAppSetting('maszyna', '{"v":1,"makaMaxG":"620 g"}');
    const w = require('../wybory-uzytkownika') as typeof import('../wybory-uzytkownika');
    await w.zapiszMaszyne(m);
    expect(ratunkowe().join('\n')).toContain('620 g');
    expect(await w.wczytajMaszyne()).toEqual({ ok: true, value: m });
  });

  it('czytelna wartość: zwykłe nadpisanie, bez pliku ratunkowego', async () => {
    zalozBaze1021(APP_DB());
    const app = restartApp();
    await app.schema.initDatabase();
    const w = require('../wybory-uzytkownika') as typeof import('../wybory-uzytkownika');
    await w.zapiszMaszyne({ ...m, makaMaxG: 500 });
    await w.zapiszMaszyne(m);
    expect(ratunkowe()).toEqual([]);
    expect(await w.wczytajMaszyne()).toEqual({ ok: true, value: m });
  });
});
