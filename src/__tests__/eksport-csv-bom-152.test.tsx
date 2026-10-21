/**
 * M1-audytor-generalny-152 (08-programista-505): plik CSV z Ustawień zaczyna się od
 * znacznika U+FEFF, żeby Excel odczytał polskie znaki jako UTF-8. Test idzie przez
 * ekran użytkownika: Ustawienia → „Eksportuj historię wypieków (CSV)”.
 */
import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { SettingsModal } from '../components/SettingsModal';
import { setLang } from '../lib/i18n';

jest.mock('../lib/backup', () => ({
  exportBackup: jest.fn().mockResolvedValue(true),
  safetyBackup: jest.fn().mockResolvedValue(true),
  parseAndValidateBackup: jest.fn(),
}));

jest.mock('../data/sqlite-store', () => ({
  getBakeLogs: jest.fn().mockResolvedValue([
    { id: 'bake_1', recipeName: 'Chleb żytni', startedAt: 1718000000000, notes: 'Skórka złocista, miąższ wilgotny' },
  ]),
  getStarters: jest.fn().mockResolvedValue([]),
  getRecipes: jest.fn().mockResolvedValue([]),
  getFlourInventory: jest.fn().mockResolvedValue([]),
  collectBackupData: jest.fn().mockResolvedValue({ bakes: [], starters: [], customRecipes: [], starterEntries: [], flourInventory: [] }),
  restoreFromBackupData: jest.fn().mockResolvedValue(undefined),
  getAppSetting: jest.fn().mockResolvedValue(null),
  setAppSetting: jest.fn().mockResolvedValue(undefined),
  getBakerRitualProfile: jest.fn().mockResolvedValue('artisan_hybrid'),
  setBakerRitualProfile: jest.fn().mockResolvedValue(undefined),
  getBakingVessel: jest.fn().mockResolvedValue('dutch_oven'),
  setBakingVessel: jest.fn().mockResolvedValue(undefined),
}));

/** Parser jak w arkuszu: znacznik BOM to kodowanie, nie część pierwszej kolumny. */
const naglowek = (csv: string) => csv.replace(/^﻿/, '').split('\n')[0].split(',');

describe('Eksport CSV z Ustawień zaczyna się od BOM (152)', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(() => {
    setLang('pl');
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
    (Sharing.isAvailableAsync as jest.Mock).mockResolvedValue(true);
    (Sharing.shareAsync as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    act(() => tree?.unmount());
    tree = null;
    jest.restoreAllMocks();
  });

  it('zapisany plik historii wypieków ma U+FEFF, a nagłówek czyta się od „id”', async () => {
    const zapis = jest.spyOn(FileSystem, 'writeAsStringAsync').mockResolvedValue(undefined);
    jest.spyOn(FileSystem, 'deleteAsync').mockResolvedValue(undefined);
    await act(async () => {
      tree = renderer.create(<SettingsModal visible={true} onClose={() => {}} />);
    });
    const przycisk = tree!.root.findByProps({ testID: 'export-bakes-csv-btn' });
    await act(async () => {
      await przycisk.props.onPress();
    });

    expect(zapis).toHaveBeenCalledTimes(1);
    const tresc = zapis.mock.calls[0][1];
    expect(tresc.charCodeAt(0)).toBe(0xfeff);
    expect(naglowek(tresc)[0]).toBe('id');
    expect(tresc).toContain('Chleb żytni');
  });
});
