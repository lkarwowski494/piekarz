/**
 * Ścieżka ratunkowa przy uszkodzonym pliku bazy [M1-audytor-generalny-122; 12-niezawodnosc-503].
 * Prawdziwy SQLite (node:sqlite) dla aplikacji; pliki do kopii w makiecie expo-file-system (jak w teście 024).
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());

import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import type renderer from 'react-test-renderer';
import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, control, openRaw, dbFilePath } from '../data/__tests__/helpers/node-sqlite-adapter';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
// Plik bazy tak, jak widzi go aplikacja na iOS (katalog z dbDirectory), w makiecie plików
const DB_URI = 'file:///var/mobile/Containers/Data/Application/TEST/Library/SQLite/piekarz.db';
const APP_DB = () => dbFilePath('piekarz.db', '/Library/SQLite');
const sha = (f: string) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const flush = async () => {
  for (let i = 0; i < 50; i++) await new Promise((r) => setImmediate(r));
};

type Pakiet = { format: string; pliki: Array<{ nazwa: string; base64: string }> };
const pakiet = (uri: string | null): Pakiet => JSON.parse(String(mockFiles.get(String(uri))));

function uruchom() {
  jest.resetModules();
  return {
    store: require('../data/sqlite-store') as typeof import('../data/sqlite-store'),
    status: require('../data/storage-status') as typeof import('../data/storage-status'),
    Gate: (require('../components/StorageGate') as typeof import('../components/StorageGate')).StorageGate,
    Rescue: (require('../components/RescueScreen') as typeof import('../components/RescueScreen')).RescueScreen,
    React: require('react') as typeof import('react'),
    TR: require('react-test-renderer') as typeof import('react-test-renderer'),
    // Makieta expo-sharing z rejestru po resetModules: ta sama, której używa aplikacja
    share: (require('expo-sharing') as typeof import('expo-sharing')).shareAsync as jest.Mock,
  };
}

describe('Uszkodzony plik bazy: plik ratunkowy, surowe kopie i udostępnienie (122)', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
  });

  it('S4: start z nadpisanym nagłówkiem daje plik ratunkowy z listą kopii, oryginał bez zmian, a ekran błędu udostępnia kopię', async () => {
    // Plik bazy z uszkodzonym nagłówkiem (otwarcie przechodzi, pierwszy odczyt nie)
    fs.mkdirSync(path.dirname(APP_DB()), { recursive: true });
    fs.writeFileSync(APP_DB(), Buffer.alloc(8192, 0x41));
    const before = sha(APP_DB());
    mockFiles.set(DB_URI, 'UKLAD-BAZY-BASE64');
    mockFiles.set(`${DB_URI}-wal`, 'WAL-BASE64');

    const m = uruchom();
    // Kopie ratunkowe biorą adres pliku bazy bez otwierania jej (ten sam, który aplikacja otwiera na iOS)
    expect((require('../data/sqlite-schema') as typeof import('../data/sqlite-schema')).dbFileUri()).toBe(DB_URI);
    await m.store.initDatabase();
    await flush();

    expect(m.status.getStorageState()).toBe('unavailable');
    expect(sha(APP_DB())).toBe(before);
    // Plik ratunkowy state_corrupt_* z listą surowych kopii (.db i -wal)
    const corrupt = [...mockFiles.keys()].filter((k) => /state_corrupt_[^/]+\.json$/.test(k));
    expect(corrupt).toHaveLength(1);
    const copies: string[] = JSON.parse(String(mockFiles.get(corrupt[0]))).recovery.rawFiles;
    expect(copies.map((c) => c.split('/').pop()).sort()).toEqual(['piekarz.db', 'piekarz.db-wal']);
    // Jeden plik do udostępnienia: komplet plików bazy (wybór P-122 a)
    const kind: import('../data/storage-status').RescueKind = 'pliki-bazy';
    expect(m.status.getRescueKind()).toBe(kind);
    const rescue = m.status.getRescueFile();
    expect(rescue).toMatch(/kopie-ratunkowe\/piekarz-pliki-bazy-[^/]+\.json$/);
    const p = pakiet(rescue);
    expect(p.format).toBe('piekarz-pliki-bazy');
    expect(p.pliki.map((f) => [f.nazwa, f.base64])).toEqual([
      ['piekarz.db', 'UKLAD-BAZY-BASE64'],
      ['piekarz.db-wal', 'WAL-BASE64'],
    ]);

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
    expect(m.share).toHaveBeenCalledWith(rescue, expect.objectContaining({ mimeType: 'application/json' }));
  });

  it('ratujPlikiBazy: plik ratunkowy z opisem błędu i pakiet z błędem; bez plików bazy pakietu nie ma', async () => {
    const { ratujPlikiBazy, pakietPlikowBazy, PAKIET_FORMAT, PAKIET_PREFIX } = require('../lib/kopia-plikow-bazy') as typeof import('../lib/kopia-plikow-bazy');
    expect(PAKIET_FORMAT).toBe('piekarz-pliki-bazy');
    mockFiles.set(DB_URI, 'DB');
    const p = await ratujPlikiBazy(DB_URI, 'file is not a database');
    expect(String(p).split('/').pop()?.startsWith(PAKIET_PREFIX)).toBe(true);
    expect(JSON.parse(String(mockFiles.get(String(p))))).toEqual(
      expect.objectContaining({ format: 'piekarz-pliki-bazy', blad: 'file is not a database', pliki: [{ nazwa: 'piekarz.db', base64: 'DB' }] })
    );
    expect([...mockFiles.keys()].some((k) => /state_corrupt_[^/]+\.json$/.test(k))).toBe(true);
    mockFiles.clear();
    expect(await pakietPlikowBazy(DB_URI)).toBeNull();
  });
});
