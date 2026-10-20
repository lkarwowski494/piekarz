/**
 * M1-audytor-generalny-104, F-33 (ADR-008 „Format kopii w wersji 2”, T7 roli 05): eksport → import przenosi dziennik
 * zakwasu; kopia v1 daje wpis z lastFedAt; plik v2 w parserze starej wersji (SCHEMA_VERSION 1) jest odrzucony
 * czytelnym komunikatem bez zmian w bazie; wpis z nieznanym starterId pominięty i policzony; kopia bezpieczeństwa
 * z collectBackupData zawiera dziennik.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import { useTempDbDir, restartApp } from './helpers/node-sqlite-adapter';
import type { StoredStarter, StoredStarterEntry } from '../db';

const starter = (id: string): StoredStarter => ({ id, name: id, flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'FRIDGE' });
const entry = (id: string, starterId: string, kind: 'feeding' | 'observation', when: number): StoredStarterEntry => ({
  id, starterId, kind, occurredAt: when,
  ...(kind === 'feeding' ? { feedRatio: '1:2:2', flourGrams: 50, waterGrams: 50 } : {}),
  signs: kind === 'observation' ? ['doubled', 'bubbles'] : [], createdAt: when, updatedAt: when + 1,
});

async function seeded() {
  const app = restartApp();
  await app.schema.initDatabase();
  const entries = require('../starter-entries-store') as typeof import('../starter-entries-store');
  await entries.createStarterWithEntry({ ...starter('a'), setupStartedAt: 500 }, entry('a1', 'a', 'feeding', 1000));
  await entries.addStarterEntry(entry('a2', 'a', 'observation', 2000));
  await entries.createStarterWithEntry(starter('b'), entry('b1', 'b', 'feeding', 3000));
  return { app, entries };
}

describe('F-33: kopia zapasowa z dziennikiem zakwasu (104)', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('eksport → import: liczności i wartości wpisów oraz stan zakładania wracają', async () => {
    const { app, entries } = await seeded();
    const data = await app.store.collectBackupData();
    expect(data.starterEntries).toHaveLength(3);
    const json = JSON.stringify(app.backup.buildBackup(data));
    expect(JSON.parse(json).schemaVersion).toBe(2);
    const before = { a: await entries.getStarterEntries('a'), b: await entries.getStarterEntries('b') };

    await app.store.restoreFromBackupData({ bakes: [], starters: [], customRecipes: [], starterEntries: [] });
    expect(await entries.getStarterEntries('a')).toEqual([]);

    const parsed = app.backup.parseAndValidateBackup(json);
    expect(parsed.skippedRows).toBe(0);
    await app.store.restoreFromBackupData(parsed.state);

    const again = restartApp();
    await again.schema.initDatabase();
    const fresh = require('../starter-entries-store') as typeof import('../starter-entries-store');
    expect(await fresh.getStarterEntries('a')).toEqual(before.a);
    expect(await fresh.getStarterEntries('b')).toEqual(before.b);
    const a = (await again.store.getStarters()).find((s) => s.id === 'a');
    expect(a).toEqual(expect.objectContaining({ setupStartedAt: 500, lastFedAt: 1000, feedingRatio: '1:2:2' }));
  });

  it('kopia v1 (bez dziennika) w nowej aplikacji: wpis feeding z lastFedAt, przypomnienie jak przed importem (BR-DANE-003 Import starszego pliku)', async () => {
    const app = restartApp();
    await app.schema.initDatabase();
    const v1 = JSON.stringify({
      format: 'piekarz-backup', schemaVersion: 1, exportedAt: 'x',
      state: { bakes: [], customRecipes: [], starters: [{ ...starter('old'), lastFedAt: 7000, feedingRatio: '1:3:3' }, starter('never')] },
    });
    const parsed = app.backup.parseAndValidateBackup(v1);
    expect(parsed.state.starterEntries).toEqual([
      { id: 'v5-old', starterId: 'old', kind: 'feeding', occurredAt: 7000, feedRatio: '1:3:3', signs: [], createdAt: 7000, updatedAt: 7000 },
    ]);
    await app.store.restoreFromBackupData(parsed.state);
    const s = (await app.store.getStarters()).find((x) => x.id === 'old');
    expect(s).toEqual(expect.objectContaining({ lastFedAt: 7000, feedingRatio: '1:3:3' }));
  });

  it('wpis z nieznanym starterId albo nieznanym kodem obserwacji jest pominięty i policzony', async () => {
    const app = restartApp();
    await app.schema.initDatabase();
    const v2 = JSON.stringify({
      format: 'piekarz-backup', schemaVersion: 2, exportedAt: 'x',
      state: {
        bakes: [], customRecipes: [], starters: [starter('a')],
        starterEntries: [entry('ok', 'a', 'feeding', 10), entry('obcy', 'zz', 'feeding', 20), { ...entry('zly', 'a', 'observation', 30), signs: ['smells_nice'] }],
      },
    });
    const parsed = app.backup.parseAndValidateBackup(v2);
    expect(parsed.state.starterEntries?.map((e) => e.id)).toEqual(['ok']);
    expect(parsed.skippedRows).toBe(2);
    await app.store.restoreFromBackupData(parsed.state);
  });

  it('plik z wersji wyższej niż znana parserowi daje komunikat przed dotknięciem danych (tak stara aplikacja z wersją 1 odrzuci v2)', async () => {
    const { app, entries } = await seeded();
    const envelope = app.backup.buildBackup(await app.store.collectBackupData());
    expect(envelope.schemaVersion).toBe(2);
    expect(app.backup.SCHEMA_VERSION).toBe(2);
    const before = await entries.getStarterEntries('a');
    const newer = JSON.stringify({ ...envelope, schemaVersion: app.backup.SCHEMA_VERSION + 1 });
    expect(() => app.backup.parseAndValidateBackup(newer)).toThrow(`Kopia pochodzi z nowszej wersji aplikacji (v${app.backup.SCHEMA_VERSION + 1}). Zaktualizuj aplikację.`);
    expect(await entries.getStarterEntries('a')).toEqual(before);
  });

  it('kopia bezpieczeństwa przed importem (collectBackupData) zawiera dziennik', async () => {
    const { app } = await seeded();
    const state = await app.store.collectBackupData();
    expect(state.starterEntries?.map((e) => e.id).sort()).toEqual(['a1', 'a2', 'b1']);
  });
});
