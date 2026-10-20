/**
 * Plik ratunkowy po błędzie otwarcia bazy zawiera surowe pliki bazy, a „Ukryj” go nie usuwa
 * [M1-audytor-generalny-024; 12-niezawodnosc-006].
 */
jest.mock('expo-sqlite', () => require('../../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import * as FileSystem from 'expo-file-system/legacy';
import { useTempDbDir, control } from '../../data/__tests__/helpers/node-sqlite-adapter';
import { initDatabase } from '../../data/sqlite-store';
import { checkCorruptState, dismissCorruptState, AUTO_DIR } from '../backup';
import { CorruptStateRecoveryBanner } from '../../components/CorruptStateRecoveryBanner';
import { resetStorageState } from '../../data/storage-status';

const mockFiles = (FileSystem as unknown as { __mockFiles: Map<string, string> }).__mockFiles;
const DB_URI = 'file:///var/mobile/Containers/Data/Application/TEST/Library/SQLite/piekarz.db';
const backupDir = () => `${FileSystem.documentDirectory}${AUTO_DIR}`;
const corruptFiles = () => [...mockFiles.keys()].filter((k) => k.startsWith(backupDir()) && /state_corrupt_[^/]+\.json$/.test(k));
const flush = async () => {
  for (let i = 0; i < 50; i++) await new Promise((r) => setImmediate(r));
};
const textOf = (n: unknown): string => {
  if (typeof n === 'string') return n;
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  return '';
};

describe('Rescue file after a database open failure (024)', () => {
  beforeEach(() => {
    useTempDbDir();
    mockFiles.clear();
    resetStorageState();
    mockFiles.set(DB_URI, 'RAW-DB-BYTES');
    mockFiles.set(`${DB_URI}-wal`, 'RAW-WAL-BYTES');
    control().failOpen = true;
  });
  afterEach(() => {
    control().failOpen = false;
  });

  it('copies the raw database files (.db and -wal) next to the rescue file and lists them in it (BR-DANE-001 Uszkodzony plik stanu)', async () => {
    await initDatabase();
    await flush();
    const files = corruptFiles();
    expect(files).toHaveLength(1);
    const rescue = JSON.parse(mockFiles.get(files[0]) as string);
    const copies: string[] = rescue.recovery.rawFiles;
    expect(copies.map((c) => c.split('/').pop()).sort()).toEqual(['piekarz.db', 'piekarz.db-wal']);
    expect(copies.map((c) => mockFiles.get(c)).sort()).toEqual(['RAW-DB-BYTES', 'RAW-WAL-BYTES']);
    expect(copies.every((c) => c.startsWith(backupDir()))).toBe(true);
  });

  it('"Ukryj" hides the banner but keeps the rescue file and the raw copies', async () => {
    await initDatabase();
    await flush();
    const info = await checkCorruptState();
    expect(info).not.toBeNull();
    const before = [...mockFiles.keys()].filter((k) => k.startsWith(backupDir())).sort();
    await dismissCorruptState(String(info?.corruptFile));
    expect(await checkCorruptState()).toBeNull();
    const after = [...mockFiles.keys()].filter((k) => k.startsWith(backupDir()));
    expect(after).toEqual(expect.arrayContaining(before));
    expect(before.every((k) => mockFiles.get(k) !== undefined)).toBe(true);
  });

  it('copyRawDatabaseFiles copies only existing files into Backup/kopie-ratunkowe/<stamp>/; rescueAfterOpenFailure lists them', async () => {
    const { copyRawDatabaseFiles, rescueAfterOpenFailure, RESCUE_DIR } = require('../backup');
    expect(RESCUE_DIR).toBe('kopie-ratunkowe/');
    const copies: string[] = await copyRawDatabaseFiles(DB_URI);
    expect(copies).toHaveLength(2);
    expect(copies.every((c) => c.startsWith(`${backupDir()}${RESCUE_DIR}`))).toBe(true);
    expect(mockFiles.get(DB_URI)).toBe('RAW-DB-BYTES'); // oryginał nietknięty

    const rescue: string | null = await rescueAfterOpenFailure(DB_URI, 'disk I/O error');
    const body = JSON.parse(mockFiles.get(String(rescue)) as string);
    expect(body.recovery.rawFiles).toHaveLength(2);
    expect(JSON.parse(body.recovery.rawPayload)).toEqual({ error: 'disk I/O error' });
  });

  it('without raw files to copy the banner says only the error note was saved', async () => {
    mockFiles.clear();
    await initDatabase();
    await flush();
    const info = await checkCorruptState();
    expect(info?.rawFiles).toEqual([]);
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<CorruptStateRecoveryBanner />);
    });
    await act(flush);
    const text = textOf(tree!.toJSON());
    expect(text).toContain(`Zapisano opis błędu w pliku: ${info?.corruptFile}. Kopii plików bazy nie udało się wykonać.`);
    const { t } = require('../i18n');
    expect(t('Zapisano opis błędu w pliku: {file}. Kopii plików bazy nie udało się wykonać.', { file: 'x.json' })).toContain('x.json');
    act(() => tree!.unmount());
  });

  it('the banner does not claim the data was secured when only an error note exists, and names the copy folder when it exists', async () => {
    await initDatabase();
    await flush();
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<CorruptStateRecoveryBanner />);
    });
    await act(flush);
    const text = textOf(tree!.toJSON());
    expect(text).not.toContain('bezpiecznie zabezpieczyła');
    expect(text).toContain('Baza danych nie otworzyła się przy poprzednim uruchomieniu');
    expect(text).toContain('Kopia plików bazy z tej chwili jest w aplikacji Pliki: Piekarz › Backup › kopie-ratunkowe.');
    act(() => tree!.unmount());
  });
});
