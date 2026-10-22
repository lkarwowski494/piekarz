/**
 * BR-KAL-007 (M3 D4a): kalendarz nie zmienia schematu bazy. Odczyt danych kalendarza niczego nie zapisuje, „Pomiń” to
 * jeden klucz JSON w app_settings (bez zmiany PRAGMA user_version), poza kopią zapasową (D-094), czyszczony przez
 * „Usuń wszystkie dane”, ze sprzątaniem wpisów starszych niż 14 dni. „Zrobione” idzie istniejącą ścieżką addStarterEntry.
 * Prawdziwy SQLite (node:sqlite).
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, tableCounts } from './helpers/node-sqlite-adapter';
import { zdarzeniaKalendarza } from '../../core/kalendarz-zdarzenia';
import { liniaNastepne } from '../../core/kalendarz-nastepne';
import type { SessionStep } from '../../core/bake-steps';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const H = 3_600_000;
const DZIEN = 24 * H;
// Stała chwila (czwartek 2026-10-22 12:00 czasu lokalnego procesu); kalendarz liczy z argumentu, nie z zegara
const NOW = new Date(2026, 9, 22, 12, 0).getTime();
const FED = NOW - 13 * H; // termin blatu minął godzinę temu: „Zaległe”

const krok = (id: string, start: number, durationMin: number): SessionStep => ({
  id, name: id, category: 'mix', durationMin, isPassive: false, instructions: '', plannedStart: start, plannedEnd: start + durationMin * 60_000,
});

async function telefon() {
  const app = restartApp();
  await app.schema.initDatabase();
  const sesje = require('../bake-sessions-store') as typeof import('../bake-sessions-store');
  const sesja = require('../bake-session-store') as typeof import('../bake-session-store');
  const pominiecia = require('../pominiecia-store') as typeof import('../pominiecia-store');
  const kalendarz = require('../../lib/kalendarz-dane') as typeof import('../../lib/kalendarz-dane');
  const wpisy = require('../starter-entries-store') as typeof import('../starter-entries-store');
  await wpisy.createStarterWithEntry(
    { id: 'z', name: 'Żytni', flourType: 'rye', hydration: 100, birthDate: FED, storageState: 'ROOM_TEMP' },
    { id: 'w1', starterId: 'z', kind: 'feeding', occurredAt: FED, signs: [], createdAt: FED, updatedAt: FED }
  );
  await app.store.saveBakeLog({ id: 'b1', recipeName: 'Wiejski', startedAt: NOW - 3 * DZIEN, finishedAt: NOW - 3 * DZIEN + 8 * H, ratingStars: 4 });
  const r = await sesje.saveActiveBakeSession(
    sesja.nowaSesja({ id: 'wyp', recipeName: 'Chleb', startedAt: NOW - H, currentStageId: 'mix', steps: [krok('Mieszanie', NOW - H, 120), krok('Składanie', NOW + 2 * H, 30)] })
  );
  expect(r.ok).toBe(true);
  return { app, pominiecia, kalendarz, wpisy };
}

function stanBazy(file: string) {
  const raw = openRaw(file);
  const wiersz = raw.prepare('PRAGMA user_version').get() as { user_version: number };
  const wynik = {
    userVersion: Number(wiersz.user_version),
    liczby: tableCounts(raw),
    ustawienia: raw.prepare('SELECT key, value FROM app_settings ORDER BY key').all() as Array<{ key: string; value: string }>,
    dane: ['starters', 'starter_entries', 'bakes', 'bake_sessions'].map((t) => raw.prepare(`SELECT * FROM ${t} ORDER BY id`).all()),
  };
  raw.close();
  return JSON.parse(JSON.stringify(wynik)) as typeof wynik;
}

const plikBazy = async (app: ReturnType<typeof restartApp>) => (await app.schema.getDb())?.databasePath ?? '';

describe('BR-KAL-007: kalendarz bez zmiany schematu (M3 D4a)', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('BR-KAL-007 Tylko odczyt: dane kalendarza, linia „Następne” i arkusze nie zmieniają user_version ani wierszy', async () => {
    const { app, kalendarz } = await telefon();
    const plik = await plikBazy(app);
    const przed = stanBazy(plik);
    const dane = await kalendarz.wczytajDaneKalendarza(NOW);
    const zd = zdarzeniaKalendarza(dane, NOW);
    expect(dane.wypieki.map((w) => [w.id, w.zaczetyZDostepem])).toEqual([['wyp', true]]);
    // Pole karmieniePro (Basic/Pro, D-113) dopisane w M3 P-a; ten test ma Pro, więc wszystkie terminy jak dotąd
    expect(dane.dostep).toEqual({ terminyKarmienia: true, przyszleWypieki: true, karmieniePro: true });
    expect(zd.filter((z) => z.rodzaj === 'wpis-dziennika').map((z) => z.ocena)).toEqual([4]);
    const l = liniaNastepne(zd, NOW);
    expect(l.zalegle.map((z) => z.nazwa)).toEqual(['Żytni']);
    expect(l.przyszle.map((z) => z.krok?.nazwa)).toEqual(['Składanie']);
    expect(stanBazy(plik)).toEqual(przed);
  });

  it('BR-KAL-007 Decyzja o zaległym bez zmiany schematu: „Pomiń” dopisuje tylko klucz w app_settings, „Zrobione” wpis dokarmienia', async () => {
    const { app, pominiecia, kalendarz, wpisy } = await telefon();
    const plik = await plikBazy(app);
    const przed = stanBazy(plik);
    await pominiecia.zapiszPominiecie('karmienie:z', NOW);
    const po = stanBazy(plik);
    expect(po.userVersion).toBe(przed.userVersion);
    expect(po.dane).toEqual(przed.dane);
    expect(po.ustawienia.filter((u) => !przed.ustawienia.some((p) => p.key === u.key)).map((u) => u.key)).toEqual(['kalendarz_pominiecia']);
    // BR-KAL-003 Pomiń karmienie: następne od chwili pominięcia
    const l = liniaNastepne(zdarzeniaKalendarza(await kalendarz.wczytajDaneKalendarza(NOW), NOW), NOW);
    expect(l.zalegle).toEqual([]);
    expect(l.przyszle.filter((z) => z.rodzaj === 'karmienie-nastepne').map((z) => z.at)).toEqual([NOW + 12 * H]);
    // „Zrobione”: istniejąca ścieżka zapisu dokarmienia
    await wpisy.addStarterEntry({ id: 'w2', starterId: 'z', kind: 'feeding', occurredAt: NOW + H, signs: [], createdAt: NOW + H, updatedAt: NOW + H });
    const poZrobione = stanBazy(plik);
    expect(poZrobione.userVersion).toBe(przed.userVersion);
    expect(poZrobione.liczby.starter_entries).toBe(przed.liczby.starter_entries + 1);
  });

  it('BR-KAL-007 Decyzja w kopii zapasowej: pominięcie nie przechodzi do kopii, na nowym telefonie karmienie wraca jako „Zaległe”', async () => {
    const { app, pominiecia } = await telefon();
    await pominiecia.zapiszPominiecie('karmienie:z', NOW);
    const plik = JSON.stringify(app.backup.buildBackup(await app.store.collectBackupData()));
    expect(plik).not.toContain('kalendarz_pominiecia');

    useTempDbDir();
    const nowy = restartApp();
    await nowy.schema.initDatabase();
    await nowy.store.restoreFromBackupData(nowy.backup.parseAndValidateBackup(plik).state);
    const kalendarz = require('../../lib/kalendarz-dane') as typeof import('../../lib/kalendarz-dane');
    const dane = await kalendarz.wczytajDaneKalendarza(NOW);
    expect(dane.pominiecia).toEqual([]);
    expect(liniaNastepne(zdarzeniaKalendarza(dane, NOW), NOW).zalegle.map((z) => z.nazwa)).toEqual(['Żytni']);
  });

  it('„Usuń wszystkie dane” czyści pominięcia', async () => {
    const { app, pominiecia } = await telefon();
    await pominiecia.zapiszPominiecie('karmienie:z', NOW);
    const { usunWszystkieDane } = require('../usun-wszystko') as typeof import('../usun-wszystko');
    await usunWszystkieDane();
    expect(stanBazy(await plikBazy(app)).ustawienia.map((u) => u.key)).not.toContain('kalendarz_pominiecia');
    expect(await pominiecia.wczytajPominiecia(NOW)).toEqual([]);
    expect(await app.store.getAppSetting(pominiecia.KLUCZ_POMINIEC)).toBeUndefined();
  });

  it('zapis „Pomiń” sprząta wpisy starsze niż 14 dni; odczyt nieczytelnego zapisu daje pustą listę', async () => {
    const { app, pominiecia } = await telefon();
    await app.store.setAppSetting(pominiecia.KLUCZ_POMINIEC, JSON.stringify([{ zdarzenie: 'karmienie:stary', at: NOW - 15 * DZIEN }, { zdarzenie: 'karmienie:a', at: NOW - DZIEN }]));
    await pominiecia.zapiszPominiecie('karmienie:z', NOW);
    expect(JSON.parse((await app.store.getAppSetting(pominiecia.KLUCZ_POMINIEC)) ?? '')).toEqual([{ zdarzenie: 'karmienie:a', at: NOW - DZIEN }, { zdarzenie: 'karmienie:z', at: NOW }]);
    await app.store.setAppSetting(pominiecia.KLUCZ_POMINIEC, '{zepsute');
    expect(await pominiecia.wczytajPominiecia(NOW)).toEqual([]);
  });

  it('BR-KAL-006 dostęp kalendarza z tej samej reguły co przypomnienia: przed odczytem sklepu tak, po końcu próby nie, z zakupem tak', () => {
    const { przypomnieniaZDostepem } = require('../../lib/notifications') as typeof import('../../lib/notifications');
    expect(przypomnieniaZDostepem({ decyzja: { dostep: false, powod: 'brak', pamiec: null }, gotowe: false })).toBe(true);
    expect(przypomnieniaZDostepem({ decyzja: { dostep: false, powod: 'brak', pamiec: null }, gotowe: true })).toBe(false);
    expect(przypomnieniaZDostepem({ decyzja: { dostep: true, powod: 'sklep', pamiec: null }, gotowe: true })).toBe(true);
  });

  it('BR-KAL-006 Bez terminów karmienia: wyłączone przypomnienia → kalendarz bez następnego karmienia (jak plan powiadomień)', async () => {
    const { app } = await telefon();
    await app.store.setAppSetting('przypomnienia_karmienia', '0');
    restartApp();
    const kalendarz = require('../../lib/kalendarz-dane') as typeof import('../../lib/kalendarz-dane');
    const dane = await kalendarz.wczytajDaneKalendarza(NOW);
    expect(dane.dostep.terminyKarmienia).toBe(false);
    expect(zdarzeniaKalendarza(dane, NOW).filter((z) => z.rodzaj === 'karmienie-nastepne')).toEqual([]);
  });
});
