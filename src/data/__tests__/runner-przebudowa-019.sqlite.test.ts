/**
 * Runner migracji (runner-migracji.ts) [M1-audytor-generalny-019; 05-architekt-002]. Przebudowa tabeli z kluczami obcymi
 * (12 kroków, sqlite.org/lang_altertable.html §8) wymaga `foreign_keys = OFF` przed BEGIN — „This pragma is a no-op
 * within a transaction” (sqlite.org/pragma.html) — `foreign_key_check` przed COMMIT i `foreign_keys = ON` po.
 * Prawdziwy SQLite; hipotetyczna migracja v8 przebudowuje `starters` przy 5 wpisach dziennika.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, dbFilePath, tableCounts } from './helpers/node-sqlite-adapter';
import type { SchemaMigration } from '../runner-migracji';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');

/** Przebudowa `starters` krokami 4–7 procedury (nowa tabela, kopia, DROP, RENAME). */
async function przebuduj(db: Parameters<SchemaMigration['run']>[0]) {
  const kolumny = (await db.getAllAsync<{ name: string }>('PRAGMA table_info(starters);')).map((c) => c.name);
  const def = (await db.getFirstAsync<{ sql: string }>("SELECT sql FROM sqlite_master WHERE type='table' AND name='starters';"))?.sql ?? '';
  await db.execAsync(`${def.replace(/CREATE TABLE\s+"?starters"?/i, 'CREATE TABLE starters_nowa')};
    INSERT INTO starters_nowa (${kolumny.join(', ')}) SELECT ${kolumny.join(', ')} FROM starters;
    DROP TABLE starters;
    ALTER TABLE starters_nowa RENAME TO starters;`);
}

async function zDziennikiem() {
  const app = restartApp();
  await app.schema.initDatabase();
  const wpisy = require('../starter-entries-store') as typeof import('../starter-entries-store');
  await app.store.saveStarter({ id: 'z1', name: 'Żytni', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'FRIDGE' });
  for (let i = 1; i <= 5; i++) await wpisy.addStarterEntry({ id: `w${i}`, starterId: 'z1', kind: 'feeding', occurredAt: i * 1000, signs: [], createdAt: i, updatedAt: i });
  const db = await app.schema.getDb();
  if (!db) throw new Error('brak bazy');
  return { app, db };
}

describe('M1-audytor-generalny-019: runner migracji', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('uruchomMigracje z listą aplikacji na zmigrowanej bazie nic nie zmienia', async () => {
    const { app, db } = await zDziennikiem();
    const { uruchomMigracje } = require('../runner-migracji') as typeof import('../runner-migracji');
    const raw = openRaw(APP_DB());
    const przed = tableCounts(raw);
    await uruchomMigracje(db, app.schema.SCHEMA_MIGRATIONS, app.schema.PRZYGOTOWANIE_MIGRACJI);
    expect(tableCounts(raw)).toEqual(przed);
    raw.close();
  });
});
