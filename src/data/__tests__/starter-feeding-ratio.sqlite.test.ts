/**
 * Proporcja ostatniego dokarmiania jest zapisywana i wraca po restarcie [M1-audytor-generalny-023; 05-architekt-009].
 * Migracja v4 dodaje pustą kolumnę starters.last_feed_ratio (decyzja właściciela 2026-10-19, wariant a); stara
 * feeding_ratio (domyślne '1:1:1', nigdy niezapisywane przez aplikację) zostaje nieczytana.
 * Bazy wydanych wersji: fixtures/schema-<commit>.sql (70fd81a, adfe1fa, b21c194: user_version 0; ebd8471 = b1013: 3).
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as path from 'node:path';
import { useTempDbDir, restartApp, openRaw, dbFilePath, tableCounts } from './helpers/node-sqlite-adapter';

const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');

function seed(sha: string): Record<string, number> {
  const raw = openRaw(APP_DB());
  raw.exec(fs.readFileSync(path.join(__dirname, 'fixtures', `schema-${sha}.sql`), 'utf8'));
  for (let n = 1; n <= 2; n++) {
    raw.prepare('INSERT INTO starters (id, name, flour_type, hydration, birth_date, storage_state, last_fed_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(`starter_${n}`, `Zakwas ${n}`, 'Żytnia 2000', 100, 1, 'FRIDGE', 2);
  }
  raw.prepare('INSERT INTO bakes (id, recipe_name, started_at) VALUES (?, ?, ?)').run('bake_1', 'Chleb', 1);
  const before = tableCounts(raw);
  raw.close();
  return before;
}

const columns = (raw: ReturnType<typeof openRaw>, table: string) =>
  (raw.prepare(`PRAGMA table_info(${table})`).all() as Array<{ name: string }>).map((c) => c.name);

describe.each(['70fd81a', 'adfe1fa', 'b21c194', 'ebd8471'])('baza z wydanego buildu %s', (sha) => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('migruje do bieżącej wersji (v6) bez strat; istniejące zakwasy bez zapisanej proporcji', async () => {
    const before = seed(sha);
    const app = restartApp();
    await app.schema.initDatabase();
    expect(app.status.getStorageState()).toBe('ok');

    const raw = openRaw(APP_DB());
    const after = tableCounts(raw);
    for (const t of ['starters', 'bakes', 'recipes', 'flour_inventory', 'app_access', 'app_settings', 'lesson_progress']) {
      if (before[t] !== undefined && t !== 'recipes') expect({ table: t, count: after[t] }).toEqual({ table: t, count: before[t] });
    }
    expect(raw.prepare('PRAGMA user_version').get()).toEqual({ user_version: 6 }); // bieżąca wersja: v6 (D-102) [M3 D1]
    expect(raw.prepare('PRAGMA integrity_check').get()).toEqual({ integrity_check: 'ok' });
    expect(raw.prepare('PRAGMA foreign_key_check').all()).toEqual([]);
    expect(columns(raw, 'starters')).toContain('last_feed_ratio');
    expect(raw.prepare('SELECT count(*) AS c FROM starters WHERE last_feed_ratio IS NOT NULL').get()).toEqual({ c: 0 });
    raw.close();

    const starters = await app.store.getStarters();
    expect(starters.map((s) => s.feedingRatio)).toEqual([undefined, undefined]);
  });

  it('proporcja zapisana przy dokarmianiu wraca po restarcie; zapis profilu jej nie zeruje', async () => {
    seed(sha);
    let app = restartApp();
    await app.schema.initDatabase();
    const [first] = await app.store.getStarters();
    await app.store.saveStarter({ ...first, lastFedAt: 5000, feedingRatio: '1:5:5' });

    app = restartApp();
    await app.schema.initDatabase();
    const reloaded = (await app.store.getStarters()).find((s) => s.id === first.id)!;
    expect(reloaded.feedingRatio).toBe('1:5:5');
    expect(reloaded.lastFedAt).toBe(5000);

    await app.store.saveStarter({ ...reloaded, name: 'Nowa nazwa' });
    app = restartApp();
    await app.schema.initDatabase();
    const renamed = (await app.store.getStarters()).find((s) => s.id === first.id)!;
    expect(renamed).toEqual(expect.objectContaining({ name: 'Nowa nazwa', feedingRatio: '1:5:5' }));

    // Ponowne uruchomienie niczego nie zmienia
    const raw = openRaw(APP_DB());
    expect(raw.prepare('PRAGMA user_version').get()).toEqual({ user_version: 6 }); // bieżąca wersja: v6 (D-102) [M3 D1]
    expect(raw.prepare('SELECT count(*) AS c FROM starters').get()).toEqual({ c: 2 });
    raw.close();
  });
});

describe('kopia zapasowa', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('import kopii przenosi proporcję zakwasu', async () => {
    let app = restartApp();
    await app.schema.initDatabase();
    await app.store.restoreFromBackupData({
      bakes: [],
      customRecipes: [],
      starters: [{ id: 's1', name: 'Ala', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: 2, feedingRatio: '1:3:3' }],
    });

    app = restartApp();
    await app.schema.initDatabase();
    expect((await app.store.getStarters()).find((s) => s.id === 's1')?.feedingRatio).toBe('1:3:3');
  });
});
