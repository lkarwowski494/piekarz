/**
 * Pamięć uprawnień na prawdziwym SQLite i bazach z wydanych buildów TestFlight
 * [M1-audytor-generalny-008; 02-monetyzacja-001, 08-programista-016]. Bez nowej migracji:
 * pamięć to wiersz app_settings; stare kolumny app_access zostają i nie nadają dostępu.
 * Zastępuje test „detects tampering and reseals app_access” (podpis HMAC z kluczem w repo).
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as Iap from 'expo-iap';
import { useTempDbDir, restartApp, openRaw, dbFilePath, tableCounts } from './helpers/node-sqlite-adapter';

const mockIap = (Iap as unknown as { __mock: any }).__mock;
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const LIFETIME = 'com.apps4brew.baker.pro.lifetime';

function seed(sha: string): Record<string, number> {
  const raw = openRaw(APP_DB());
  raw.exec(fs.readFileSync(path.join(__dirname, 'fixtures', `schema-${sha}.sql`), 'utf8'));
  raw.prepare('INSERT INTO bakes (id, recipe_name, started_at) VALUES (?, ?, ?)').run('bake_1', 'Chleb', 1);
  raw.prepare('INSERT INTO starters (id, name, flour_type, hydration, birth_date, storage_state) VALUES (?, ?, ?, ?, ?, ?)').run('s1', 'Zakwas', 'Żytnia', 100, 1, 'FRIDGE');
  // Dawna symulacja zapisała „lifetime” bez transakcji: ten wiersz nie może dać dostępu.
  raw.prepare("INSERT INTO app_access (id, trial_started_at, trial_days, subscription_tier, completed_bakes_count) VALUES ('current_user', 1, 7, 'lifetime', 3)").run();
  const before = tableCounts(raw);
  raw.close();
  return before;
}

function startStore() {
  const app = restartApp();
  const stan = require('../../lib/platnosci/stan') as typeof import('../../lib/platnosci/stan');
  return { ...app, stan };
}

describe.each(['70fd81a', 'adfe1fa', 'b21c194'])('Entitlement memory on the database from build %s (008)', (sha) => {
  beforeEach(() => {
    useTempDbDir();
    mockIap.reset();
  });

  it('old app_access tier gives no access; a store read writes only app_settings; integrity ok', async () => {
    const before = seed(sha);
    const { schema, stan } = startStore();
    await schema.initDatabase();

    expect((await stan.odswiezDostep()).dostep).toBe(false); // sklep pusty, „lifetime” w bazie bez znaczenia

    mockIap.entitlements = [{ id: 't', transactionId: 't', productId: LIFETIME, purchaseState: 'purchased', transactionDate: 1 }];
    expect((await stan.odswiezDostep()).dostep).toBe(true);

    const raw = openRaw(APP_DB());
    const after = tableCounts(raw);
    for (const t of ['bakes', 'starters', 'app_access', 'recipes', 'flour_inventory']) {
      if (before[t] !== undefined && t !== 'recipes') expect({ t, n: after[t] }).toEqual({ t, n: before[t] });
    }
    const row = raw.prepare("SELECT value FROM app_settings WHERE key = 'platnosci_pamiec'").get() as { value: string };
    expect(JSON.parse(row.value)).toEqual({ produkty: [LIFETIME], wygasa: null });
    expect(raw.prepare("SELECT subscription_tier, completed_bakes_count FROM app_access").get()).toEqual({ subscription_tier: 'lifetime', completed_bakes_count: 3 });
    expect(raw.prepare('PRAGMA integrity_check').get()).toEqual({ integrity_check: 'ok' });
    expect(raw.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    raw.close();
  });
});

describe('Entitlement memory survives a restart and editing the database grants nothing (008)', () => {
  beforeEach(() => {
    useTempDbDir();
    mockIap.reset();
  });

  it('no network after restart: access from memory; editing subscription_tier does not grant access', async () => {
    const first = startStore();
    await first.schema.initDatabase();
    mockIap.entitlements = [{ id: 't', transactionId: 't', productId: LIFETIME, purchaseState: 'purchased', transactionDate: 1 }];
    await first.stan.odswiezDostep();

    mockIap.failRead = true;
    const second = startStore();
    await second.schema.initDatabase();
    expect(await second.stan.odswiezDostep()).toEqual({ dostep: true, powod: 'pamiec', pamiec: { produkty: [LIFETIME], wygasa: null } });

    // Ponowna instalacja (pusta baza), brak zakupu w sklepie, ręczna edycja bazy: brak dostępu.
    useTempDbDir();
    mockIap.reset();
    const third = startStore();
    await third.schema.initDatabase();
    const raw = openRaw(APP_DB());
    raw.prepare("UPDATE app_access SET subscription_tier = 'lifetime', subscription_expires_at = NULL").run();
    raw.close();
    expect((await third.stan.odswiezDostep()).dostep).toBe(false);
  });
});
