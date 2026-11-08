/**
 * p9b-2 (D-260 pkt 1): metoda wypieku „piekarnik / maszyna” w Dzienniku — kolumna bakes.bake_method dopisana do
 * migracji v7 (v7 nie wyszła w żadnym buildzie: 1021 i 1022 = v6). Kopie baz wydanych wersji (1021 = v6, 1014 = v5),
 * prawdziwy SQLite (node:sqlite). Wzorzec: p9b-wersja-wypieku.sqlite.test.ts (leaven) [M3 p9b2].
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, dbFilePath, tableCounts, control } from './helpers/node-sqlite-adapter';
import { zalozBaze1021 } from './helpers/baza-1021';
import { zalozBaze1014, kopia1014 } from './helpers/baza-1014';
import type { BakeMethod } from '../db';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
type Raw = ReturnType<typeof openRaw>;
const KOLUMNA = 'bake_method';
const kolumny = (raw: Raw) => (raw.prepare('PRAGMA table_info(bakes)').all() as Array<{ name: string }>).map((c) => c.name);
const wersja = (raw: Raw) => (raw.prepare('PRAGMA user_version').get() as { user_version: number }).user_version;

async function start(zaloz: (plik: string) => Record<string, number>) {
  const przed = zaloz(APP_DB());
  const app = restartApp();
  await app.schema.initDatabase();
  const raw = openRaw(APP_DB());
  // Pierwsza asercja: kolumna metody po migracji (czerwień przed kodem: brak kolumny)
  expect({ wersja: wersja(raw), kolumna: kolumny(raw).includes(KOLUMNA) }).toEqual({ wersja: 7, kolumna: true });
  raw.close();
  expect(app.status.getStorageState()).toBe('ok');
  return { app, przed };
}

describe('p9b-2: migracja v7 z bakes.bake_method na kopiach wydanych wersji (D-260)', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('1021 (v6) → v7: stare wpisy z pustą metodą, liczności bez strat, integrity_check i foreign_key_check', async () => {
    const { przed } = await start(zalozBaze1021);
    const raw = openRaw(APP_DB());
    const po = tableCounts(raw);
    for (const t of Object.keys(przed)) expect({ t, n: po[t] }).toEqual({ t, n: t === 'schema_migrations' ? przed[t] + 1 : przed[t] });
    expect(raw.prepare(`SELECT count(*) AS c FROM bakes WHERE ${KOLUMNA} IS NULL`).get()).toEqual({ c: przed.bakes });
    expect(raw.prepare('PRAGMA integrity_check').get()).toEqual({ integrity_check: 'ok' });
    expect(raw.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    raw.close();
  });

  it('1014 (v5) → v7 jednym startem: kolumna metody i wpisy bez strat', async () => {
    const { przed } = await start((p) => zalozBaze1014(p, 'v2-pauza'));
    const raw = openRaw(APP_DB());
    expect(tableCounts(raw).bakes).toBe(przed.bakes);
    expect(raw.prepare(`SELECT count(*) AS c FROM bakes WHERE ${KOLUMNA} IS NOT NULL`).get()).toEqual({ c: 0 });
    raw.close();
  });

  it('CHECK przyjmuje dokładnie wartości isBakeMethod (piekarnik, maszyna) i NULL', async () => {
    await start(zalozBaze1021);
    const { isBakeMethod } = require('../row-parsers') as typeof import('../row-parsers');
    const raw = openRaw(APP_DB());
    for (const w of ['piekarnik', 'maszyna', 'oven', 'machine', 'Maszyna', '']) {
      let przyjeta = true;
      try {
        raw.prepare('INSERT INTO bakes (id, recipe_name, started_at, bake_method) VALUES (?, ?, ?, ?)').run(`m_${w}`, 'x', 1, w);
      } catch {
        przyjeta = false;
      }
      expect({ w, przyjeta }).toEqual({ w, przyjeta: isBakeMethod(w) });
    }
    raw.prepare("INSERT INTO bakes (id, recipe_name, started_at, bake_method) VALUES ('m_null', 'x', 1, NULL)").run();
    raw.close();
  });

  it('błąd w środku migracji v7: wycofanie całości — bez obu kolumn, wersja 6, liczności jak w 1021', async () => {
    const przed = zalozBaze1021(APP_DB());
    control().failWritesMatching = /INSERT INTO schema_migrations/;
    const app = restartApp();
    await app.schema.initDatabase();
    control().failWritesMatching = null;
    expect(app.status.getStorageState()).toBe('unavailable');
    const raw = openRaw(APP_DB());
    expect({ wersja: wersja(raw), metoda: kolumny(raw).includes(KOLUMNA), leaven: kolumny(raw).includes('leaven') }).toEqual({ wersja: 6, metoda: false, leaven: false });
    expect(tableCounts(raw)).toEqual(przed);
    raw.close();
  });
});

describe('p9b-2: metoda wypieku w zapisie Dziennika i w kopii', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  /** Baza 1021 z trwającym wypiekiem bake_live w podanym trybie (undefined = sesja sprzed p9). */
  async function koniecWypieku(tryb: 'piekarnik' | 'maszyna' | undefined) {
    zalozBaze1021(APP_DB());
    const r0 = openRaw(APP_DB());
    const w = r0.prepare("SELECT session_json AS j FROM bake_sessions WHERE id = 'bake_live'").get() as { j: string };
    const s = JSON.parse(w.j) as { bake: Record<string, unknown> };
    if (tryb) r0.prepare("UPDATE bake_sessions SET session_json = ? WHERE id = 'bake_live'").run(JSON.stringify({ ...s, bake: { ...s.bake, tryb } }));
    r0.close();
    const app = restartApp();
    await app.schema.initDatabase();
    const log = { id: 'bake_live', recipeName: 'Chleb', startedAt: 1_800_000_000_000, finishedAt: 1_800_000_900_000 };
    expect(await app.store.finishBake(log, [], { sessionId: 'bake_live', wymagajSesji: true })).toBe('zapisano');
    return { app, log };
  }

  it('koniec wypieku z maszyny: wpis z metodą maszyna; ocena po wypieku (zapis bez metody) jej nie zeruje', async () => {
    const { app, log } = await koniecWypieku('maszyna');
    expect((await app.store.getBakeLogs()).find((b) => b.id === 'bake_live')?.bakeMethod).toBe('maszyna');
    await app.store.saveBakeLog({ ...log, ratingStars: 4 });
    const raw = openRaw(APP_DB());
    expect(raw.prepare(`SELECT ${KOLUMNA} AS m, rating_stars AS r FROM bakes WHERE id = 'bake_live'`).get()).toEqual({ m: 'maszyna', r: 4 });
    raw.close();
  });

  it('koniec wypieku z piekarnika: metoda piekarnik; sesja sprzed p9 (bez trybu): metoda pusta', async () => {
    const { app } = await koniecWypieku('piekarnik');
    expect((await app.store.getBakeLogs()).find((b) => b.id === 'bake_live')?.bakeMethod).toBe('piekarnik');
    useTempDbDir();
    mockFiles.clear();
    const { app: b } = await koniecWypieku(undefined);
    const wpis = (await b.store.getBakeLogs()).find((x) => x.id === 'bake_live');
    expect(wpis).not.toHaveProperty('bakeMethod');
    const raw = openRaw(APP_DB());
    expect(raw.prepare(`SELECT ${KOLUMNA} AS m FROM bakes WHERE id = 'bake_live'`).get()).toEqual({ m: null });
    raw.close();
  });

  it('wpisZSesji: metoda z sesji tylko, gdy wpis jej nie niesie', () => {
    const { wpisZSesji } = require('../wpisy-wypiekow') as typeof import('../wpisy-wypiekow');
    const log = { id: 'b', recipeName: 'G', startedAt: 1 };
    const maszyna: BakeMethod = 'maszyna';
    expect(wpisZSesji(log, { tryb: maszyna })).toEqual({ ...log, bakeMethod: 'maszyna' });
    expect(wpisZSesji({ ...log, bakeMethod: null }, { tryb: 'maszyna' })).toEqual({ ...log, bakeMethod: null });
    expect(wpisZSesji(log, {})).toEqual(log);
  });

  it('kopia: eksport niesie metodę jawnie (także null), import przenosi; kopia sprzed p9 bez pola zostawia wartość z telefonu', async () => {
    await start(zalozBaze1021);
    const r0 = openRaw(APP_DB());
    r0.prepare(`UPDATE bakes SET ${KOLUMNA} = 'maszyna' WHERE id = 'bake_1'`).run();
    r0.close();
    const app = restartApp();
    await app.schema.initDatabase();
    const koperta = app.backup.buildBackup(await app.store.collectBackupData());
    const wpisy = koperta.state.bakes as unknown as Array<Record<string, unknown>>;
    expect(wpisy.find((b) => b.id === 'bake_1')?.bakeMethod).toBe('maszyna');
    expect(wpisy.find((b) => b.id === 'bake_2')).toHaveProperty('bakeMethod', null);
    const tekst = JSON.stringify(koperta);
    // Kopia sprzed p9 (1014) bez pola: wartość z telefonu zostaje
    await app.store.restoreFromBackupData(app.backup.parseAndValidateBackup(kopia1014()).state);
    const r1 = openRaw(APP_DB());
    expect(r1.prepare(`SELECT ${KOLUMNA} AS m FROM bakes WHERE id = 'bake_1'`).get()).toEqual({ m: 'maszyna' });
    r1.close();
    // Kopia z metodą na drugim telefonie: import przenosi wartość
    useTempDbDir();
    const b = restartApp();
    await b.schema.initDatabase();
    await b.store.restoreFromBackupData(b.backup.parseAndValidateBackup(tekst).state);
    expect((await b.store.getBakeLogs()).find((x) => x.id === 'bake_1')?.bakeMethod).toBe('maszyna');
  });
});
