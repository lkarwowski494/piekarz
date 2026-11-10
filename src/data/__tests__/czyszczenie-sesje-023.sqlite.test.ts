/**
 * „Usuń wszystkie dane”: kopia przed czyszczeniem obejmuje trwające i zaplanowane wypieki (bake_sessions), a import tej
 * kopii je przywraca [M1-audytor-generalny-023; 05-architekt-504] (DEC-11 a, D-286; zasada wspólna 10, D-082).
 * Format kopii zostaje w wersji 2: pole opcjonalne `bakeSessions` (surowe wiersze tabeli). Kopia bez pola (1014–1023,
 * eksport, kopie po wypieku i przed importem) importuje się jak dotąd: sesje w telefonie zostają nietknięte.
 * Import dopisuje wypieki z kopii obok tych w telefonie (wiersz tego samego id zostaje z telefonu), z limitami
 * trwających i zaplanowanych, bez wypieku, który ma już wpis w Dzienniku. Prawdziwy SQLite (node:sqlite), baza 1021.
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, dbFilePath } from './helpers/node-sqlite-adapter';
import { zalozBaze1021 } from './helpers/baza-1021';
import { kopia1014 } from './helpers/baza-1014';

const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const przedCzyszczeniem = () => [...mockFiles.keys()].filter((k) => /piekarz-przed-czyszczeniem-[^/]+\.json$/.test(k));

type App = ReturnType<typeof restartApp>;
type Wiersz = { id: string; status: string; session_json: string; created_at: number; updated_at: number };

async function baza(app: App) {
  const db = await app.schema.getDb();
  if (!db) throw new Error('brak bazy');
  return db;
}
const sesje = async (app: App) =>
  (await baza(app)).getAllAsync<Wiersz>('SELECT id, status, session_json, created_at, updated_at FROM bake_sessions ORDER BY id;');
const TABELE = ['bakes', 'starters', 'starter_entries', 'flour_inventory', 'lesson_progress', 'bake_sessions'] as const;
async function licznosci(app: App): Promise<Record<string, number>> {
  const db = await baza(app);
  const out: Record<string, number> = {};
  for (const t of TABELE) out[t] = ((await db.getAllAsync<{ n: number }>(`SELECT count(*) AS n FROM ${t};`))[0]?.n ?? -1);
  out.recipes_wlasne = (await db.getAllAsync<{ n: number }>('SELECT count(*) AS n FROM recipes WHERE is_built_in = 0;'))[0]?.n ?? -1;
  return out;
}

async function telefon1021(): Promise<App> {
  useTempDbDir();
  mockFiles.clear();
  zalozBaze1021(APP_DB());
  const app = restartApp();
  await app.schema.initDatabase();
  return app;
}

const usun = async () => (require('../usun-wszystko') as typeof import('../usun-wszystko')).usunWszystkieDane();

describe('023: kopia przed czyszczeniem z trwającymi i zaplanowanymi wypiekami (DEC-11 a)', () => {
  it('baza 1021: liczności przed czyszczeniem = po imporcie kopii przed czyszczeniem; wiersze sesji identyczne', async () => {
    const app = await telefon1021();
    const przed = await licznosci(app);
    const sesjePrzed = await sesje(app);
    expect(sesjePrzed.map((w) => [w.id, w.status])).toEqual([['bake_live', 'active'], ['plan_sobota', 'planned']]);

    await usun();
    expect((await licznosci(app)).bake_sessions).toBe(0);
    const kopie = przedCzyszczeniem();
    expect(kopie).toHaveLength(1);
    const plik = String(mockFiles.get(kopie[0]));
    const koperta = JSON.parse(plik);
    expect(koperta.schemaVersion).toBe(2);
    expect(koperta.state.bakeSessions).toEqual(sesjePrzed);

    const kopia = app.backup.parseAndValidateBackup(plik);
    expect(kopia.skippedRows).toBe(0);
    await app.store.restoreFromBackupData(kopia.state);
    expect(await licznosci(app)).toEqual(przed);
    expect(await sesje(app)).toEqual(sesjePrzed);

    // Po ponownym uruchomieniu ekrany czytają przywrócony wypiek i plan
    const app2 = restartApp();
    await app2.schema.initDatabase();
    const bs = require('../bake-sessions-store') as typeof import('../bake-sessions-store');
    expect((await bs.loadActiveBakeSessions()).map((s) => s.bake?.id)).toEqual(['bake_live']);
    expect((await bs.loadPlannedBakes()).map((p) => p.id)).toEqual(['plan_sobota']);
  });

  it('stara kopia bez pola (eksport 1014) importuje się jak dotąd: sesje w telefonie zostają, parser nie dodaje pola', async () => {
    const app = await telefon1021();
    const sesjePrzed = await sesje(app);
    const kopia = app.backup.parseAndValidateBackup(kopia1014());
    expect('bakeSessions' in kopia.state).toBe(false);
    await app.store.restoreFromBackupData(kopia.state);
    expect(await sesje(app)).toEqual(sesjePrzed);
  });

  it('eksport i kopia przed importem nie niosą sesji (D-102 dla eksportu bez zmian)', async () => {
    const app = await telefon1021();
    expect('bakeSessions' in (await app.store.collectBackupData())).toBe(false);
  });

  it('import pola: wiersz telefonu wygrywa, uszkodzony pominięty i policzony, wypiek z wpisem w Dzienniku nie wraca, limity', async () => {
    const app = await telefon1021();
    const telefon = await sesje(app);
    const live = telefon.find((w) => w.id === 'bake_live');
    const plan = telefon.find((w) => w.id === 'plan_sobota');
    if (!live || !plan) throw new Error('brak sesji w bazie 1021');
    const zmien = (w: Wiersz, id: string, created: number): Wiersz => {
      const j = JSON.parse(w.session_json);
      if (j.bake) j.bake.id = id;
      if (w.status === 'planned') j.id = id;
      return { ...w, id, session_json: JSON.stringify(j), created_at: created, updated_at: created };
    };
    const koperta = JSON.parse(JSON.stringify(app.backup.buildBackup(await app.store.collectBackupData())));
    koperta.state.bakeSessions = [
      { ...live, created_at: 1, updated_at: 1 }, // to samo id, starsza wersja: wiersz telefonu zostaje
      zmien(live, 'bake_drugi', 10),
      zmien(live, 'bake_trzeci', 20), // trzeci trwający ponad limit 2
      zmien(live, 'bake_4', 30), // id wpisu w Dzienniku (koniec wypieku): nie wraca jako trwający
      { ...plan, id: 'plan_zly', session_json: '{"version":1' }, // uszkodzony JSON
      { id: 'zly_status', status: 'done', session_json: '{}', created_at: 1, updated_at: 1 },
      zmien(plan, 'plan_niedziela', 40),
    ];
    const kopia = app.backup.parseAndValidateBackup(JSON.stringify(koperta));
    expect(kopia.skippedRows).toBe(2); // plan_zly, zly_status
    await app.store.restoreFromBackupData(kopia.state);
    const po = await sesje(app);
    expect(po.map((w) => [w.id, w.status])).toEqual([
      ['bake_drugi', 'active'],
      ['bake_live', 'active'],
      ['plan_niedziela', 'planned'],
      ['plan_sobota', 'planned'],
    ]);
    expect(po.find((w) => w.id === 'bake_live')).toEqual(live);
  });
});

describe('023: funkcje modułu sesje-kopii', () => {
  it('parseSesjeKopii: brak tablicy = brak pola; zły kształt, status i JSON pominięte i policzone', () => {
    const k = require('../sesje-kopii') as typeof import('../sesje-kopii');
    expect(k.parseSesjeKopii(undefined)).toBeNull();
    expect(k.parseSesjeKopii({})).toBeNull();
    expect(k.parseSesjeKopii([{ id: 'x', status: 'active', session_json: '{}', created_at: 1 }, 'x', { id: 'y', status: 'planned', session_json: '[]', created_at: 1, updated_at: 1 }])).toEqual({ rows: [], skipped: 3 });
  });

  it('czytajSesjeDoKopii i wstawSesjeZKopii na bazie 1021; wstawSesjeWPamieci w trybie bez bazy z tymi samymi regułami', async () => {
    const app = await telefon1021();
    const db = await baza(app);
    const k = require('../sesje-kopii') as typeof import('../sesje-kopii');
    const wiersze = await k.czytajSesjeDoKopii(db);
    expect(wiersze).toEqual(await sesje(app));
    await db.execAsync('DELETE FROM bake_sessions;');
    await db.withTransactionAsync(async (tx) => {
      await k.wstawSesjeZKopii(tx, wiersze);
      await k.wstawSesjeZKopii(tx, wiersze); // drugi raz: ON CONFLICT DO NOTHING
    });
    expect(await sesje(app)).toEqual(wiersze);

    const schema = app.schema;
    schema._resetMemStore();
    schema.memStore.logs = [{ id: 'bake_4', recipeName: 'x', startedAt: 1 }];
    k.wstawSesjeWPamieci([...wiersze, { ...wiersze[0], id: 'bake_4' }, { ...wiersze[0], id: 'a2' }, { ...wiersze[0], id: 'a3' }]);
    expect(schema.memStore.bakeSessions.map((w) => w.id)).toEqual(['bake_live', 'plan_sobota', 'a2']);
    expect(await k.czytajSesjeDoKopii(null)).toEqual(schema.memStore.bakeSessions);
  });
});
