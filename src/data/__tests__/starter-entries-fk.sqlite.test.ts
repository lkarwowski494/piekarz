/**
 * M1-audytor-generalny-104 (ADR-008, T3 i T8 roli 05; 05-architekt-fix-p5-001, -003): klucze obce na połączeniu
 * zapisu, jedno połączenie przy równoległym otwarciu, UPSERT zakwasu zostawia dziennik, usunięcie zakwasu
 * usuwa tylko jego wpisy, zakaz INSERT OR REPLACE na starters.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as path from 'node:path';
import { useTempDbDir, restartApp, openRaw, dbFilePath, createExpoSqliteMock } from './helpers/node-sqlite-adapter';
import type { StoredStarter, StoredStarterEntry } from '../db';

const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const starter = (id: string): StoredStarter => ({ id, name: id, flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP' });
const feed = (id: string, starterId: string, at: number): StoredStarterEntry => ({
  id, starterId, kind: 'feeding', occurredAt: at, feedRatio: '1:1:1', signs: [], createdAt: at, updatedAt: at,
});

describe('klucze obce i zapis rodzica (104, T3, T8)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('T8: baza otwarta jak w aplikacji ma klucze obce wyłączone, dopóki aplikacja ich nie włączy', async () => {
    const db = await createExpoSqliteMock().openDatabaseAsync('piekarz.db', undefined, '/Library/SQLite');
    expect(await db.getFirstAsync('PRAGMA foreign_keys')).toEqual({ foreign_keys: 0 });
    await db.closeAsync();
  });

  it('dwa równoległe getDb() dają ten sam obiekt; PRAGMA foreign_keys w transakcji zapisu = 1', async () => {
    const app = restartApp();
    const [a, b] = await Promise.all([app.schema.getDb(), app.schema.getDb()]);
    expect(a).not.toBeNull();
    expect(a).toBe(b);
    await app.schema.initDatabase();
    let fk: unknown = null;
    await a!.withTransactionAsync(async () => {
      fk = await a!.getFirstAsync('PRAGMA foreign_keys');
    });
    expect(fk).toEqual({ foreign_keys: 1 });
  });

  it('UPSERT zakwasu zostawia wpisy; deleteStarter usuwa tylko wpisy tego zakwasu', async () => {
    const app = restartApp();
    await app.schema.initDatabase();
    const entries = require('../starter-entries-store') as typeof import('../starter-entries-store');
    await entries.createStarterWithEntry(starter('a'), feed('a1', 'a', 1000));
    await entries.addStarterEntry(feed('a2', 'a', 2000));
    await entries.createStarterWithEntry(starter('b'), feed('b1', 'b', 1500));

    await app.store.saveStarter({ ...starter('a'), name: 'Nowa nazwa' });
    expect((await entries.getStarterEntries('a')).map((e) => e.id)).toEqual(['a2', 'a1']);

    await app.store.deleteStarter('a');
    expect(await entries.getStarterEntries('a')).toEqual([]);
    expect((await entries.getStarterEntries('b')).map((e) => e.id)).toEqual(['b1']);
    const raw = openRaw(APP_DB());
    expect(raw.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    raw.close();
  });

  it('wpis dla zakwasu, którego nie ma w bazie, jest odrzucony (klucz obcy)', async () => {
    const app = restartApp();
    await app.schema.initDatabase();
    const entries = require('../starter-entries-store') as typeof import('../starter-entries-store');
    await expect(entries.addStarterEntry(feed('x1', 'nie-ma', 1000))).rejects.toThrow(/FOREIGN KEY/i);
  });

  it('zapis profilu zakwasu (UPSERT) nie dotyka last_fed_at ani last_feed_ratio (ADR-008)', () => {
    const { STARTER_UPSERT, starterParams } = require('../starter-entries-store') as typeof import('../starter-entries-store');
    expect(STARTER_UPSERT).toMatch(/ON CONFLICT\(id\) DO UPDATE/);
    expect(STARTER_UPSERT).not.toMatch(/last_fed_at|last_feed_ratio/);
    expect(starterParams({ ...starter('a'), lastFedAt: 9, setupStartedAt: 5 })).toEqual(['a', 'a', 'Żytnia', 100, 1, 'ROOM_TEMP', 5, null]);
  });

  it('BR-ZAKW-005 zacznij od nowa po pleśni: wpisy tego zakwasu usunięte, dzień 1 od nowego wpisu, inne zakwasy bez zmian', async () => {
    const app = restartApp();
    await app.schema.initDatabase();
    const entries = require('../starter-entries-store') as typeof import('../starter-entries-store');
    await entries.createStarterWithEntry({ ...starter('a'), setupStartedAt: 1000 }, feed('a1', 'a', 1000));
    await entries.addStarterEntry({ ...feed('a2', 'a', 2000), kind: 'observation', feedRatio: undefined, signs: ['mold_signs'] }, { setupCompletedAt: 2000 });
    await entries.createStarterWithEntry(starter('b'), feed('b1', 'b', 1500));

    await entries.restartStarterSetup('a', feed('a-new', 'a', 9000));
    expect((await entries.getStarterEntries('a')).map((e) => e.id)).toEqual(['a-new']);
    expect((await entries.getAllStarterEntries()).map((e) => e.id).sort()).toEqual(['a-new', 'b1']);
    const a = (await app.store.getStarters()).find((s) => s.id === 'a');
    expect(a?.setupStartedAt).toBe(9000);
    expect(a?.setupCompletedAt).toBeUndefined();
  });

  it('insertStarterEntryRow z ignoreExisting nie nadpisuje istniejącego wpisu', async () => {
    const app = restartApp();
    await app.schema.initDatabase();
    const entries = require('../starter-entries-store') as typeof import('../starter-entries-store');
    await entries.createStarterWithEntry(starter('a'), feed('a1', 'a', 1000));
    const db = await app.schema.getDb();
    await entries.insertStarterEntryRow(db!, feed('a1', 'a', 5000), true);
    expect((await entries.getStarterEntries('a'))[0].occurredAt).toBe(1000);
    await expect(entries.insertStarterEntryRow(db!, feed('a1', 'a', 5000))).rejects.toThrow(/UNIQUE|PRIMARY/i);
  });

  it('w src/ nie ma INSERT OR REPLACE INTO starters', () => {
    const files: string[] = [];
    const walk = (d: string) => {
      for (const f of fs.readdirSync(d)) {
        const p = path.join(d, f);
        if (fs.statSync(p).isDirectory()) {
          if (f !== '__tests__') walk(p);
        } else if (/\.tsx?$/.test(f)) files.push(p);
      }
    };
    walk(path.join(__dirname, '..', '..'));
    const hits = files.filter((f) => /INSERT\s+OR\s+REPLACE\s+INTO\s+starters\b/i.test(fs.readFileSync(f, 'utf8')));
    expect(hits).toEqual([]);
  });
});
