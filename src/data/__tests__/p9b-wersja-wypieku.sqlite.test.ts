/**
 * p9b-1 (D-242 Z2, Z3): wersja wypieku „na zakwasie / na drożdżach” w trwającym wypieku (pole JSON sesji) i w Dzienniku
 * (kolumna bakes.leaven, migracja v7). Kopia bazy buildu 1021 (v6), prawdziwy SQLite (node:sqlite) [M3 p9b].
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, dbFilePath } from './helpers/node-sqlite-adapter';
import { zalozBaze1021 } from './helpers/baza-1021';
import { isActiveBakeState } from '../bake-session-store';
import type { Leaven } from '../db';
import type { WersjaWypieku } from '../wybory-uzytkownika';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');

const baza = { id: 'b1', recipeName: 'Graham', startedAt: 1_800_000_000_000, currentStageId: 's1' };

describe('p9b: wersja i tryb w trwającym wypieku (Z2 a)', () => {
  it('parser przyjmuje tylko wersję zakwas/drozdze i tryb piekarnik/maszyna; brak pola = wypiek sprzed p9', () => {
    expect(isActiveBakeState(baza)).toBe(true);
    expect(isActiveBakeState({ ...baza, wersja: 'drozdze', tryb: 'maszyna' })).toBe(true);
    expect(isActiveBakeState({ ...baza, wersja: 'zakwas', tryb: 'piekarnik' })).toBe(true);
    expect(isActiveBakeState({ ...baza, wersja: 'yeast' })).toBe(false);
    expect(isActiveBakeState({ ...baza, tryb: 'oven' })).toBe(false);
    expect(isActiveBakeState({ ...baza, wersja: null })).toBe(false);
  });
});

describe('p9b: wersja wypieku w Dzienniku (Z3 a)', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  /** Baza 1021 z trwającym wypiekiem bake_live w podanej wersji (undefined = sesja sprzed p9). */
  async function koniecWypieku(wersja: 'zakwas' | 'drozdze' | undefined) {
    zalozBaze1021(APP_DB());
    const r0 = openRaw(APP_DB());
    const w = r0.prepare("SELECT session_json AS j FROM bake_sessions WHERE id = 'bake_live'").get() as { j: string };
    const s = JSON.parse(w.j) as { bake: Record<string, unknown> };
    if (wersja) r0.prepare("UPDATE bake_sessions SET session_json = ? WHERE id = 'bake_live'").run(JSON.stringify({ ...s, bake: { ...s.bake, wersja } }));
    r0.close();
    const app = restartApp();
    await app.schema.initDatabase();
    expect(app.status.getStorageState()).toBe('ok');
    const log = { id: 'bake_live', recipeName: 'Graham', startedAt: 1_800_000_000_000, finishedAt: 1_800_000_900_000 };
    expect(await app.store.finishBake(log, [], { sessionId: 'bake_live', wymagajSesji: true })).toBe('zapisano');
    return { app, log };
  }

  it('koniec wypieku na drożdżach: wpis z wersją yeast; ocena po wypieku (zapis bez wersji) jej nie zeruje', async () => {
    const { app, log } = await koniecWypieku('drozdze');
    expect((await app.store.getBakeLogs()).find((b) => b.id === 'bake_live')?.leaven).toBe('yeast');
    await app.store.saveBakeLog({ ...log, ratingStars: 5 });
    const raw = openRaw(APP_DB());
    expect(raw.prepare("SELECT leaven, rating_stars AS r FROM bakes WHERE id = 'bake_live'").get()).toEqual({ leaven: 'yeast', r: 5 });
    raw.close();
  });

  it('koniec wypieku na zakwasie: wersja sourdough', async () => {
    const { app } = await koniecWypieku('zakwas');
    expect((await app.store.getBakeLogs()).find((b) => b.id === 'bake_live')?.leaven).toBe('sourdough');
  });

  it('koniec wypieku sprzed p9 (sesja bez wersji): wersja pusta, brak zostaje brakiem', async () => {
    const { app } = await koniecWypieku(undefined);
    const wpis = (await app.store.getBakeLogs()).find((b) => b.id === 'bake_live');
    expect(wpis?.leaven).toBeUndefined();
    const raw = openRaw(APP_DB());
    expect(raw.prepare("SELECT leaven FROM bakes WHERE id = 'bake_live'").get()).toEqual({ leaven: null });
    raw.close();
  });
});

describe('p9b: jedna definicja wersji wypieku (CHECK migracji v7 = isLeaven = Leaven) i zapis wiersza', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('MIGRACJA_V7 jest ostatnią migracją; CHECK przyjmuje dokładnie wartości isLeaven', async () => {
    const app = restartApp();
    const { MIGRACJA_V7 } = require('../migracja-v7') as typeof import('../migracja-v7');
    expect(app.schema.SCHEMA_MIGRATIONS[app.schema.SCHEMA_MIGRATIONS.length - 1]).toBe(MIGRACJA_V7);
    expect(MIGRACJA_V7.version).toBe(7);
    await app.schema.initDatabase();
    const { isLeaven } = require('../row-parsers') as typeof import('../row-parsers');
    const raw = openRaw(APP_DB());
    for (const w of ['sourdough', 'yeast', 'drozdze', 'zakwas', 'Yeast', '']) {
      let przyjeta = true;
      try {
        raw.prepare('INSERT INTO bakes (id, recipe_name, started_at, leaven) VALUES (?, ?, ?, ?)').run(`b_${w}`, 'x', 1, w);
      } catch {
        przyjeta = false;
      }
      expect({ w, przyjeta }).toEqual({ w, przyjeta: isLeaven(w) });
    }
    raw.close();
  });

  it('writeBakeRow i czytajWpisy: wersja zapisana, null nie nadpisuje zapisanej, wpis bez wersji czytany bez pola', async () => {
    const app = restartApp();
    await app.schema.initDatabase();
    const db = await app.schema.getDb();
    if (!db) throw new Error('brak bazy');
    const { writeBakeRow, czytajWpisy } = require('../wpisy-wypiekow') as typeof import('../wpisy-wypiekow');
    const drozdze: Leaven = 'yeast';
    await writeBakeRow(db, { id: 'w1', recipeName: 'Graham', startedAt: 2, leaven: drozdze });
    await writeBakeRow(db, { id: 'w1', recipeName: 'Graham', startedAt: 2, leaven: null });
    await writeBakeRow(db, { id: 'w2', recipeName: 'Żytni', startedAt: 1 });
    const wpisy = await czytajWpisy(db);
    expect(wpisy.map((w) => [w.id, w.leaven])).toEqual([['w1', 'yeast'], ['w2', undefined]]);
    expect(wpisy[1]).not.toHaveProperty('leaven');
  });

  it('wpisZSesji: wersja i receptura z sesji tylko, gdy wpis ich nie niesie', () => {
    const { wpisZSesji } = require('../wpisy-wypiekow') as typeof import('../wpisy-wypiekow');
    const log = { id: 'b', recipeName: 'G', startedAt: 1 };
    const wersja: WersjaWypieku = 'drozdze';
    expect(wpisZSesji(log, { recipeId: 'r', wersja })).toEqual({ ...log, recipeId: 'r', leaven: 'yeast' });
    expect(wpisZSesji(log, { wersja: 'zakwas' })).toEqual({ ...log, leaven: 'sourdough' });
    expect(wpisZSesji({ ...log, leaven: null, recipeId: null }, { recipeId: 'r', wersja })).toEqual({ ...log, leaven: null, recipeId: null });
    expect(wpisZSesji(log, {})).toEqual(log);
  });
});
