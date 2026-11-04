/**
 * p9b-1 (D-242 Z1 b, Z4 a): wybór wersji receptury (`wersje_receptur`) i dane maszyny (`maszyna`) w app_settings.
 * Odczyt z `unknown`: zły kształt = typowany błąd, brak = brak (bez liczby domyślnej) [M3 p9b]. Prawdziwy SQLite.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, dbFilePath } from './helpers/node-sqlite-adapter';
import { zalozBaze1021 } from './helpers/baza-1021';
import { parseWersjeReceptur, parseMaszyna, KLUCZ_MASZYNY, KLUCZ_WERSJI_RECEPTUR } from '../wybory-uzytkownika';
import type { BladWyboru, DaneMaszyny, UkladMaszyny, WynikWyboru } from '../wybory-uzytkownika';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');

describe('p9b: parser wersji receptur (Z1 b)', () => {
  it('brak klucza = pusta mapa; poprawny JSON = mapa; zły kształt = błąd typowany', () => {
    expect(parseWersjeReceptur(undefined)).toEqual({ ok: true, value: {} });
    expect(parseWersjeReceptur('{"graham_bread_honey":"drozdze"}')).toEqual({ ok: true, value: { graham_bread_honey: 'drozdze' } });
    expect(parseWersjeReceptur('nie json')).toEqual({ ok: false, error: { kind: 'storage', key: 'wersje_receptur', got: 'nie json' } });
    expect(parseWersjeReceptur('["drozdze"]')).toEqual(expect.objectContaining({ ok: false }));
    expect(parseWersjeReceptur('{"rye_100_pan":"yeast"}')).toEqual(expect.objectContaining({ ok: false }));
  });
});

describe('p9b: parser danych maszyny (Z4 a, BR-MASZ-002)', () => {
  const dobra = { v: 1, makaMaxG: 620, ciastoMaxG: 1000, drozdzeSucheMaxG: 10, uklad: 'plyny_najpierw', czasProgramuMin: 180 };
  it('brak = null (prośba o dane), komplet i pola nieobowiązkowe jako null', () => {
    expect(parseMaszyna(undefined)).toEqual({ ok: true, value: null });
    expect(parseMaszyna(JSON.stringify(dobra))).toEqual({ ok: true, value: dobra });
    expect(parseMaszyna('{"v":1,"makaMaxG":620}')).toEqual({
      ok: true,
      value: { v: 1, makaMaxG: 620, ciastoMaxG: null, drozdzeSucheMaxG: null, uklad: null, czasProgramuMin: null },
    });
  });
  it('zły kształt = błąd: inna wersja formatu, brak lub zero masy mąki, ujemne masy, nieznany układ, nie-JSON', () => {
    for (const zle of [
      { ...dobra, v: 2 },
      { ...dobra, makaMaxG: undefined },
      { ...dobra, makaMaxG: 0 },
      { ...dobra, ciastoMaxG: -1 },
      { ...dobra, drozdzeSucheMaxG: '10' },
      { ...dobra, uklad: 'najpierw_maka' },
      { ...dobra, czasProgramuMin: 0 },
    ]) {
      expect({ zle, wynik: parseMaszyna(JSON.stringify(zle)) }).toEqual({ zle, wynik: expect.objectContaining({ ok: false }) });
    }
    const blad: BladWyboru = { kind: 'storage', key: KLUCZ_MASZYNY, got: '{' };
    const wynik: WynikWyboru<DaneMaszyny | null> = parseMaszyna('{');
    expect(wynik).toEqual({ ok: false, error: blad });
    expect(KLUCZ_WERSJI_RECEPTUR).toBe('wersje_receptur');
  });
});

describe('p9b: zapis i odczyt wyborów w bazie', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('wersja receptury: zapis odstępstwa, powrót do zakwasu usuwa wpis z mapy, inne receptury bez zmian; po restarcie ta sama', async () => {
    zalozBaze1021(APP_DB());
    let app = restartApp();
    await app.schema.initDatabase();
    let w = require('../wybory-uzytkownika') as typeof import('../wybory-uzytkownika');
    expect(await w.wczytajWersjeReceptury('graham_bread_honey')).toBe('zakwas');
    await w.zapiszWersjeReceptury('graham_bread_honey', 'drozdze');
    await w.zapiszWersjeReceptury('rye_100_pan', 'drozdze');
    await w.zapiszWersjeReceptury('rye_100_pan', 'zakwas');
    app = restartApp();
    await app.schema.initDatabase();
    w = require('../wybory-uzytkownika') as typeof import('../wybory-uzytkownika');
    expect(await w.wczytajWersjeReceptury('graham_bread_honey')).toBe('drozdze');
    expect(await w.wczytajWersjeReceptury('rye_100_pan')).toBe('zakwas');
    expect(await app.store.getAppSetting('wersje_receptur')).toBe('{"graham_bread_honey":"drozdze"}');
  });

  it('dane maszyny: zapis i odczyt po restarcie; zły zapis w bazie = błąd, nie liczba domyślna', async () => {
    zalozBaze1021(APP_DB());
    let app = restartApp();
    await app.schema.initDatabase();
    let w = require('../wybory-uzytkownika') as typeof import('../wybory-uzytkownika');
    expect(await w.wczytajMaszyne()).toEqual({ ok: true, value: null });
    const uklad: UkladMaszyny = 'drozdze_najpierw';
    const m: DaneMaszyny = { v: 1, makaMaxG: 620, ciastoMaxG: null, drozdzeSucheMaxG: 10, uklad, czasProgramuMin: null };
    await w.zapiszMaszyne(m);
    app = restartApp();
    await app.schema.initDatabase();
    w = require('../wybory-uzytkownika') as typeof import('../wybory-uzytkownika');
    expect(await w.wczytajMaszyne()).toEqual({ ok: true, value: m });
    await app.store.setAppSetting('maszyna', '{"v":1}');
    expect(await w.wczytajMaszyne()).toEqual(expect.objectContaining({ ok: false }));
  });
});
