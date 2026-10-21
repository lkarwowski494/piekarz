/**
 * Eksport w trybie awaryjnym bez otwierania bazy i bez migracji [M1-audytor-generalny-123; 12-niezawodnosc-505].
 * Aplikacja (app/_layout.tsx) po dwóch nieudanych startach pokazuje ekran awaryjny; plik bazy v4 w makiecie
 * expo-file-system; aplikacja nie może otworzyć bazy (control().opened).
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';
import type renderer from 'react-test-renderer';
import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, control, openRaw } from '../data/__tests__/helpers/node-sqlite-adapter';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
// Plik bazy tak, jak widzi go aplikacja na iOS (katalog z dbDirectory), w makiecie plików
const DB_URI = 'file:///var/mobile/Containers/Data/Application/TEST/Library/SQLite/piekarz.db';
const flush = async () => {
  for (let i = 0; i < 50; i++) await new Promise((r) => setImmediate(r));
};

type Pakiet = { format: string; pliki: Array<{ nazwa: string; base64: string }> };
const pakiet = (uri: string | null): Pakiet => JSON.parse(String(mockFiles.get(String(uri))));

/** Trzeci start po dwóch nieudanych: strażnik startu zwraca tryb awaryjny (018). */
function uruchomWTrybieAwaryjnym() {
  jest.resetModules();
  jest.doMock('../lib/startup-guard', () => ({
    beginStartup: async () => ({ rescue: true }),
    markStartupSucceeded: async () => undefined,
    STARTUP_MILESTONE_MS: 5000,
  }));
  return {
    Layout: (require('../../app/_layout') as { default: React.ComponentType }).default,
    React: require('react') as typeof import('react'),
    TR: require('react-test-renderer') as typeof import('react-test-renderer'),
    // Makieta expo-sharing z rejestru po resetModules: ta sama, której używa aplikacja
    share: (require('expo-sharing') as typeof import('expo-sharing')).shareAsync as jest.Mock,
  };
}

describe('Tryb awaryjny: eksport bez migracji (123)', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });
  afterEach(() => {
    jest.dontMock('../lib/startup-guard');
  });

  it('S3: baza v4 z 3 wypiekami — „Eksportuj kopię danych” udostępnia komplet plików bazy z 3/3 wypiekami, bez otwierania bazy i bez migracji', async () => {
    // Baza v4 (bez starter_entries z v5) z 3 wypiekami, zapisana przez starszą wersję
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'piekarz-v4-'));
    const v4 = path.join(tmp, 'piekarz.db');
    const raw = openRaw(v4);
    raw.exec(`CREATE TABLE bakes (id TEXT PRIMARY KEY, recipe_name TEXT, started_at INTEGER); PRAGMA user_version = 4;`);
    for (let n = 1; n <= 3; n++) raw.prepare('INSERT INTO bakes VALUES (?, ?, ?)').run(`bake_${n}`, `Chleb ${n}`, n);
    raw.close();
    mockFiles.set(DB_URI, fs.readFileSync(v4).toString('base64'));

    const m = uruchomWTrybieAwaryjnym();
    // Adres pliku bazy bez otwierania jej: ten sam, który aplikacja otwiera na iOS
    expect((require('../data/sqlite-schema') as typeof import('../data/sqlite-schema')).dbFileUri()).toBe(DB_URI);
    let tree!: renderer.ReactTestRenderer;
    await m.TR.act(async () => {
      tree = m.TR.create(m.React.createElement(m.Layout));
      await flush();
    });
    expect(tree.root.findAllByProps({ testID: 'rescue-screen' }).length).toBeGreaterThan(0);
    await m.TR.act(async () => {
      tree.root.findByProps({ testID: 'rescue-export' }).props.onPress();
      await flush();
    });

    expect(control().opened).toEqual([]); // aplikacja nie otworzyła bazy, więc nie migrowała
    const call = m.share.mock.calls[0];
    expect(call?.[1]).toEqual(expect.objectContaining({ mimeType: 'application/json' }));
    const p = pakiet(call?.[0] ?? null);
    const db = p.pliki.find((f) => f.nazwa === 'piekarz.db');
    const out = path.join(tmp, 'z-pakietu.db');
    fs.writeFileSync(out, Buffer.from(String(db?.base64), 'base64'));
    const check = openRaw(out);
    expect((check.prepare('SELECT count(*) AS c FROM bakes').get() as { c: number }).c).toBe(3);
    expect((check.prepare('PRAGMA user_version').get() as { user_version: number }).user_version).toBe(4);
    check.close();
    m.TR.act(() => tree.unmount());
  });
});
