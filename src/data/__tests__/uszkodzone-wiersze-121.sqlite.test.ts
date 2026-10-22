/**
 * Uszkodzone wiersze nie znikają bez śladu, a import kopii nie kasuje ich treści na stałe
 * [M1-audytor-generalny-121; 12-niezawodnosc-502, 05-architekt-503, 01-odkrywanie-501] (BR-DANE-001).
 * S7 na prawdziwym SQLite (node:sqlite): receptura z uszkodzonym JSON, profil sensoryczny, wpis zakwasu i sesja wypieku.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw } from './helpers/node-sqlite-adapter';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const BAD_RECIPE = '{"flours": [ZEPSUTE';
const BAD_PROFILE = '{"acidity": 4, ZEPSUTE';
const BAD_SESSION = '{"version": 2, "steps": ZEPSUTE';
// Poprawny JSON (CHECK tabeli), ale objaw spoza listy: parser pomija wpis
const BAD_SIGNS = '["objaw-z-nowszej-wersji"]';

const pliki = (re: RegExp) => [...mockFiles.keys()].filter((k) => re.test(k));
/** Surowe treści wierszy z plików pasujących do wzorca (pole `wiersze` pliku ratunkowego albo `state.uszkodzoneWiersze` kopii). */
const surowe = (re: RegExp): string[] =>
  pliki(re).flatMap((k) => {
    const v = JSON.parse(String(mockFiles.get(k)));
    const w: Array<{ surowe: string }> = v.wiersze ?? v.state?.uszkodzoneWiersze ?? [];
    return w.map((x) => x.surowe);
  });
const zawiera = (lista: string[], s: string) => lista.some((x) => x.includes(s));

async function bazaZUszkodzeniami() {
  const app = restartApp();
  await app.schema.initDatabase();
  const file = (await app.schema.getDb())?.databasePath;
  if (!file) throw new Error('brak bazy');
  const raw = openRaw(file);
  const formula = JSON.stringify({ flours: [{ name: 'Mąka 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000 });
  raw.prepare('INSERT INTO recipes (id, name, formula_json, target_ddt, is_built_in, created_at) VALUES (?, ?, ?, 25, 0, 1)').run('r_ok', 'Dobra', formula);
  raw.prepare('INSERT INTO recipes (id, name, formula_json, target_ddt, is_built_in, created_at) VALUES (?, ?, ?, 25, 0, 2)').run('r_bad', 'Zepsuta', BAD_RECIPE);
  raw.prepare('INSERT INTO bakes (id, recipe_name, started_at, sensory_profile) VALUES (?, ?, ?, ?)').run('bake_1', 'Chleb', 1, BAD_PROFILE);
  raw.prepare('INSERT INTO starters (id, name, flour_type, hydration, birth_date, storage_state) VALUES (?, ?, ?, ?, ?, ?)').run('s1', 'Zakwas', 'Żytnia', 100, 1, 'FRIDGE');
  raw.prepare('INSERT INTO starter_entries (id, starter_id, kind, occurred_at, signs, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)').run('e_bad', 's1', 'feeding', 5, BAD_SIGNS, 5, 5);
  // Sesja od v6 w bake_sessions (D-102); do v5 ten sam tekst leżał w app_settings.active_bake_session [M3 D1]
  raw.prepare("INSERT INTO bake_sessions (id, status, session_json, created_at, updated_at) VALUES ('bake_x', 'active', ?, 1, 1)").run(BAD_SESSION);
  raw.close();
  return restartApp();
}

describe('Uszkodzone wiersze: plik ratunkowy i kopia przed importem (121; BR-DANE-001 Uszkodzony plik stanu)', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('S7: po odczycie istnieje plik ratunkowy z surową treścią receptury, profilu, wpisu zakwasu i sesji; drugi odczyt nie dubluje wierszy', async () => {
    const app = await bazaZUszkodzeniami();
    const { loadBakeSession } = require('../bake-session-store') as typeof import('../bake-session-store');
    const { zapisUszkodzonych, uszkodzoneWiersze, zachowajUszkodzony } = require('../uszkodzone-wiersze') as typeof import('../uszkodzone-wiersze');
    expect((await app.store.getRecipes()).map((r) => r.id)).toContain('r_ok');
    await app.store.getBakeLogs();
    await (require('../starter-entries-store') as typeof import('../starter-entries-store')).getAllStarterEntries();
    expect(await loadBakeSession()).toBeNull();
    await zapisUszkodzonych();
    const t = surowe(/kopie-ratunkowe\/uszkodzone-wiersze-[^/]+\.json$/);
    for (const s of [BAD_RECIPE, BAD_PROFILE, 'objaw-z-nowszej-wersji', BAD_SESSION]) expect(zawiera(t, s)).toBe(true);
    // Drugi odczyt: te same wiersze, bez dubli
    await app.store.getRecipes();
    await app.store.getBakeLogs();
    zachowajUszkodzony({ tabela: 'recipes', id: 'r_bad', surowe: 'inna treść' }); // ten sam wiersz: bez zmian
    await zapisUszkodzonych();
    expect(uszkodzoneWiersze().map((w) => `${w.tabela}/${w.id}`).sort()).toEqual([
      'bake_sessions/bake_x',
      'bakes/bake_1',
      'recipes/r_bad',
      'starter_entries/e_bad',
    ]);
  });

  it('S7: import kopii — surowa treść uszkodzonych wierszy jest w kopii przed importem, choć import kasuje je z bazy', async () => {
    const app = await bazaZUszkodzeniami();
    const { importujKopie } = require('../../lib/import-z-pliku') as typeof import('../../lib/import-z-pliku');
    const { parseAndValidateBackup, buildBackup } = require('../../lib/backup') as typeof import('../../lib/backup');
    const kopia = parseAndValidateBackup(JSON.stringify(buildBackup({ bakes: [], starters: [], customRecipes: [], starterEntries: [], flourInventory: [] })));
    await importujKopie(kopia);
    const przed = surowe(/piekarz-przed-importem-[^/]+\.json$/);
    for (const s of [BAD_RECIPE, BAD_PROFILE, 'objaw-z-nowszej-wersji']) expect(zawiera(przed, s)).toBe(true);
    expect((await app.store.getRecipes()).some((r) => r.id === 'r_bad')).toBe(false);
  });
});
