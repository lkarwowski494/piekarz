/**
 * M1-audytor-generalny-104 (P0, ADR-008 „Format kopii w wersji 2”, R1 roli 05): ekran Ustawień bierze stan do kopii
 * bezpieczeństwa przed importem i do eksportu z collectBackupData — z dziennikiem zakwasu i spiżarnią. Inaczej
 * kopia `piekarz-przed-importem-*` nie ma wpisów dziennika i import je nadpisuje bez śladu (utrata danych).
 */
jest.mock('expo-sqlite', () => require('./helpers/node-sqlite-adapter').createExpoSqliteMock());

import type React from 'react';
import type renderer from 'react-test-renderer';
import { useTempDbDir, restartApp } from './helpers/node-sqlite-adapter';
import type { StoredStarter, StoredStarterEntry } from '../db';

const starter = (id: string): StoredStarter => ({ id, name: id, flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'FRIDGE' });
const entry = (id: string, starterId: string, when: number): StoredStarterEntry => ({
  id, starterId, kind: 'feeding', occurredAt: when, feedRatio: '1:2:2', flourGrams: 50, waterGrams: 50,
  signs: [], createdAt: when, updatedAt: when,
});

async function seededSettings() {
  const app = restartApp();
  await app.schema.initDatabase();
  const entries = require('../starter-entries-store') as typeof import('../starter-entries-store');
  await entries.createStarterWithEntry(starter('a'), entry('a1', 'a', 1000));
  await entries.addStarterEntry(entry('a2', 'a', 2000));
  await entries.addStarterEntry(entry('a3', 'a', 3000));
  await app.store.saveFlourInventoryItem({ id: 'm1', name: 'Mąka 750', stockGrams: 900, updatedAt: 1 });
  const before = await app.store.collectBackupData();
  const { BackupAndDataSection } = require('../../components/settings/BackupAndDataSection');
  const R: typeof React = require('react');
  const TR: typeof renderer = require('react-test-renderer');
  const RN: typeof import('react-native') = require('react-native');
  const alert = jest.spyOn(RN.Alert, 'alert').mockImplementation(() => {});
  let tree: renderer.ReactTestRenderer | null = null;
  await TR.act(async () => {
    tree = TR.create(R.createElement(BackupAndDataSection));
  });
  const t = tree as unknown as renderer.ReactTestRenderer;
  const press = async (testID: string) => {
    await TR.act(async () => {
      await t.root.findByProps({ testID }).props.onPress();
    });
  };
  const mockFiles: Map<string, string> = require('expo-file-system/legacy').__mockFiles;
  const done = () => {
    TR.act(() => t.unmount());
    alert.mockRestore();
  };
  return { app, TR, tree: t, press, mockFiles, before, done };
}

describe('104 P0: kopia przed importem i eksport z Ustawień mają dziennik zakwasu i spiżarnię', () => {
  beforeEach(() => {
    useTempDbDir();
  });

  it('import pliku po zapisaniu wpisów dziennika: kopia piekarz-przed-importem-* zawiera wszystkie wpisy i zapasy (liczności przed/po)', async () => {
    const s = await seededSettings();
    expect(s.before.starterEntries).toHaveLength(3);
    s.mockFiles.clear();
    const plik = JSON.stringify(s.app.backup.buildBackup({ bakes: [], starters: [starter('z')], customRecipes: [], starterEntries: [] }));
    await s.press('import-backup-btn');
    await s.TR.act(async () => {
      s.tree.root.findByProps({ testID: 'import-json-input' }).props.onChangeText(plik);
    });
    await s.press('confirm-import-btn');

    const kopie = [...s.mockFiles.entries()].filter(([k]) => /piekarz-przed-importem-/.test(k));
    expect(kopie).toHaveLength(1);
    const kopia = JSON.parse(kopie[0][1]);
    expect((kopia.state.starterEntries ?? []).map((e: StoredStarterEntry) => e.id).sort()).toEqual(['a1', 'a2', 'a3']);
    expect(kopia.state.starterEntries).toHaveLength(s.before.starterEntries?.length ?? -1);
    expect(kopia.state.flourInventory).toEqual(s.before.flourInventory);
    // Kopia przywraca dziennik: import kopii bezpieczeństwa oddaje wszystkie wpisy
    const parsed = s.app.backup.parseAndValidateBackup(kopie[0][1]);
    await s.app.store.restoreFromBackupData(parsed.state);
    expect((await s.app.store.collectBackupData()).starterEntries?.map((e) => e.id).sort()).toEqual(['a1', 'a2', 'a3']);
    s.done();
  });

  it('Eksportuj do pliku: udostępniany plik zawiera dziennik zakwasu i spiżarnię (BR-DANE-003 Pełny eksport)', async () => {
    const s = await seededSettings();
    const sharing = require('expo-sharing') as { shareAsync: jest.Mock };
    let shared = '';
    sharing.shareAsync.mockImplementation(async (path: string) => {
      shared = s.mockFiles.get(path) ?? '';
    });
    await s.press('export-backup-btn');
    const plik = JSON.parse(shared);
    expect((plik.state.starterEntries ?? []).map((e: StoredStarterEntry) => e.id).sort()).toEqual(['a1', 'a2', 'a3']);
    expect(plik.state.flourInventory).toEqual(s.before.flourInventory);
    s.done();
  });
});
