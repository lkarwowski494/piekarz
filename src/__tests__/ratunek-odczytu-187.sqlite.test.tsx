/**
 * Uszkodzona strona tabeli przy dobrym nagłówku bazy [M1-audytor-generalny-187; 12-niezawodnosc-601] (sonda P1):
 * błąd odczytu z otwartej bazy („database disk image is malformed”) daje ten sam ratunek co błąd otwarcia (122):
 * surowe kopie, plik ratunkowy state_corrupt_* i pakiet do udostępnienia z ekranu błędu; oryginał bez zmian.
 * Prawdziwy SQLite (node:sqlite); pliki kopii w makiecie expo-file-system (jak w teście 122).
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as crypto from 'node:crypto';
import type renderer from 'react-test-renderer';
import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, restartApp, openRaw, dbFilePath } from '../data/__tests__/helpers/node-sqlite-adapter';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const DB_URI = 'file:///var/mobile/Containers/Data/Application/TEST/Library/SQLite/piekarz.db';
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const sha = (f: string) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const flush = async () => {
  for (let i = 0; i < 50; i++) await new Promise((r) => setImmediate(r));
};

/** Baza z 400 wypiekami i 1 recepturą użytkownika, potem nadpisana strona korzenia tabeli bakes. */
async function bazaZUszkodzonaTabela() {
  const app = restartApp();
  await app.schema.initDatabase();
  const db = await app.schema.getDb();
  await db?.closeAsync();
  const raw = openRaw(APP_DB());
  raw.exec('PRAGMA journal_mode = DELETE;');
  const ins = raw.prepare('INSERT INTO bakes (id, recipe_name, started_at, notes) VALUES (?, ?, ?, ?)');
  for (let n = 0; n < 400; n++) ins.run(`bake_${n}`, `Chleb ${n}`, n, 'x'.repeat(200));
  const formula = JSON.stringify({ flours: [{ name: 'Mąka 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000 });
  raw.prepare('INSERT INTO recipes (id, name, formula_json, target_ddt, is_built_in, created_at) VALUES (?, ?, ?, 25, 0, 1)').run('r_moja', 'Moja', formula);
  const { rootpage } = raw.prepare("SELECT rootpage FROM sqlite_master WHERE type='table' AND name='bakes'").get() as { rootpage: number };
  const { page_size } = raw.prepare('PRAGMA page_size').get() as { page_size: number };
  raw.close();
  const fd = fs.openSync(APP_DB(), 'r+');
  fs.writeSync(fd, Buffer.alloc(page_size, 0xa5), 0, page_size, (rootpage - 1) * page_size);
  fs.closeSync(fd);
  mockFiles.set(DB_URI, 'BAZA-Z-USZKODZONA-TABELA');
}

function uruchom() {
  const app = restartApp();
  return {
    ...app,
    Gate: (require('../components/StorageGate') as typeof import('../components/StorageGate')).StorageGate,
    React: require('react') as typeof import('react'),
    TR: require('react-test-renderer') as typeof import('react-test-renderer'),
    share: (require('expo-sharing') as typeof import('expo-sharing')).shareAsync as jest.Mock,
  };
}

describe('187: uszkodzona strona tabeli — ratunek po błędzie odczytu', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('sonda P1: odczyt Dziennika daje plik ratunkowy z listą kopii i pakiet, ekran błędu udostępnia kopię, oryginał bez zmian', async () => {
    await bazaZUszkodzonaTabela();
    const m = uruchom();
    await m.schema.initDatabase();
    // Stan pliku po starcie (wbudowane receptury dopisuje initDatabase); ratunek i odczyt go nie zmieniają
    const przed = sha(APP_DB());
    expect(m.status.getStorageState()).toBe('ok');
    expect((await m.store.getRecipes()).map((r) => r.id)).toContain('r_moja');
    await m.store.getBakeLogs();
    await flush();

    expect(m.status.getStorageState()).toBe('unavailable');
    const corrupt = [...mockFiles.keys()].filter((k) => /state_corrupt_[^/]+\.json$/.test(k));
    expect(corrupt).toHaveLength(1);
    expect(JSON.parse(String(mockFiles.get(corrupt[0]))).recovery.rawFiles.map((c: string) => c.split('/').pop())).toEqual(['piekarz.db']);
    expect(m.status.getRescueKind()).toBe('pliki-bazy');
    const pakiet = m.status.getRescueFile();
    expect(pakiet).toMatch(/kopie-ratunkowe\/piekarz-pliki-bazy-[^/]+\.json$/);
    expect(sha(APP_DB())).toBe(przed);

    let tree!: renderer.ReactTestRenderer;
    await m.TR.act(async () => {
      tree = m.TR.create(m.React.createElement(m.Gate, { onRetry: async () => undefined, children: null }));
    });
    const share = tree.root.findAllByProps({ testID: 'storage-share-rescue' });
    expect(share.length).toBeGreaterThan(0);
    await m.TR.act(async () => {
      share[0].props.onPress();
      await flush();
    });
    expect(m.share).toHaveBeenCalledWith(pakiet, expect.objectContaining({ mimeType: 'application/json' }));
    m.TR.act(() => tree.unmount());

    // Kolejne odczyty w tym uruchomieniu nie robią nowych kopii
    await m.store.getBakeLogs();
    await flush();
    expect([...mockFiles.keys()].filter((k) => /state_corrupt_[^/]+\.json$/.test(k))).toHaveLength(1);
  });

  it('ratunekPoBledzie: surowe kopie, plik ratunkowy i pakiet z ekranu błędu (wspólny dla otwarcia i odczytu)', async () => {
    mockFiles.set(DB_URI, 'BAZA');
    const m = uruchom();
    await m.schema.ratunekPoBledzie('database disk image is malformed');
    expect(m.status.getStorageState()).toBe('unavailable');
    expect(m.status.getRescueKind()).toBe('pliki-bazy');
    expect(m.status.getRescueFile()).toMatch(/piekarz-pliki-bazy-[^/]+\.json$/);
    expect([...mockFiles.keys()].filter((k) => /state_corrupt_[^/]+\.json$/.test(k))).toHaveLength(1);
  });

  it('błąd odczytu inny niż uszkodzenie (np. brak tabeli) zmienia tylko stan, bez kopii', async () => {
    const m = uruchom();
    const { odczytNieudany } = require('../data/odczyt') as typeof import('../data/odczyt');
    expect(odczytNieudany(new Error('no such table: starters'))).toEqual([]);
    await flush();
    expect(m.status.getStorageState()).toBe('unavailable');
    expect([...mockFiles.keys()].filter((k) => /state_corrupt_/.test(k))).toHaveLength(0);
  });
});
