import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { SettingsModal } from '../SettingsModal';
import { lang, setLang } from '../../lib/i18n';
import * as backupModule from '../../lib/backup';
import * as sqliteModule from '../../data/sqlite-store';

jest.mock('../../lib/backup', () => ({
  exportBackup: jest.fn().mockResolvedValue(true),
  safetyBackup: jest.fn().mockResolvedValue(true),
  parseAndValidateBackup: jest.fn(),
}));

jest.mock('../../data/sqlite-store', () => ({
  getBakeLogs: jest.fn().mockResolvedValue([]),
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

jest.mock('../../lib/csv-exporter', () => ({
  exportBakeLogsCsv: jest.fn().mockReturnValue('mock-bake-csv'),
  exportFlourInventoryCsv: jest.fn().mockReturnValue('mock-inventory-csv'),
  exportAndShareCsv: jest.fn().mockResolvedValue(true),
}));

describe('SettingsModal Component', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setLang('pl');
    jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    if (tree) {
      act(() => {
        tree?.unmount();
      });
      tree = null;
    }
  });

  it('renders correctly with language buttons, database info, and manifesto', async () => {
    await act(async () => {
      tree = renderer.create(<SettingsModal visible={true} onClose={mockOnClose} />);
    });

    const root = tree!.root;
    const plBtn = root.findByProps({ testID: 'lang-pl' });
    const enBtn = root.findByProps({ testID: 'lang-en' });
    const exportBtn = root.findByProps({ testID: 'export-backup-btn' });
    const importBtn = root.findByProps({ testID: 'import-file-btn' });

    expect(plBtn).toBeDefined();
    expect(enBtn).toBeDefined();
    expect(exportBtn).toBeDefined();
    expect(importBtn).toBeDefined();
  });

  // F-52 PÓŹNIEJ (ZM-14, D-034 wybór 8a); link prywatności należy do F-40 i zostaje [M1-audytor-generalny-032; 03-zakres-010]
  it('hides the Apps4Craft family section and keeps the privacy policy link visible', async () => {
    await act(async () => {
      tree = renderer.create(<SettingsModal visible={true} onClose={mockOnClose} />);
    });
    const root = tree!.root;
    const texts = root
      .findAll((n) => (n.type as unknown) === 'Text')
      .map((n) => (Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)));
    expect(texts).not.toContain('Rodzina Apps4Craft Studio');
    expect(texts).not.toContain('Ta aplikacja');
    const privacy = root.findByProps({ testID: 'settings-privacy-link' });
    expect(privacy.props.accessibilityRole).toBe('link');
    expect(texts).toContain('Polityka prywatności');
  });

  it('switches application language when tapping English and Polish buttons', async () => {
    await act(async () => {
      tree = renderer.create(<SettingsModal visible={true} onClose={mockOnClose} />);
    });

    const root = tree!.root;
    const enBtn = root.findByProps({ testID: 'lang-en' });

    await act(async () => {
      enBtn.props.onPress();
    });

    expect(lang()).toBe('en');

    const plBtn = root.findByProps({ testID: 'lang-pl' });
    await act(async () => {
      plBtn.props.onPress();
    });

    expect(lang()).toBe('pl');
  });

  it('triggers exportBackup when tapping export button', async () => {
    await act(async () => {
      tree = renderer.create(<SettingsModal visible={true} onClose={mockOnClose} />);
    });

    const exportBtn = tree!.root.findByProps({ testID: 'export-backup-btn' });

    await act(async () => {
      await exportBtn.props.onPress();
    });

    expect(backupModule.exportBackup).toHaveBeenCalled();
  });

  it('switches measurement units between metric and imperial', async () => {
    const unitConverter = require('../../lib/unit-converter');
    await act(async () => {
      tree = renderer.create(<SettingsModal visible={true} onClose={mockOnClose} />);
    });

    const root = tree!.root;
    const imperialBtn = root.findByProps({ testID: 'unit-imperial' });
    const metricBtn = root.findByProps({ testID: 'unit-metric' });

    await act(async () => {
      imperialBtn.props.onPress();
    });
    expect(unitConverter.getUnitSystem()).toBe('imperial');

    await act(async () => {
      metricBtn.props.onPress();
    });
    expect(unitConverter.getUnitSystem()).toBe('metric');
  });

  // Eksport spiżarni ma wejście tylko z widoczną spiżarnią (F-30 PÓŹNIEJ) [M1-audytor-generalny-117]; kod eksportu zostaje
  it('triggers CSV exports for bakes and inventory (inventory with the pantry entry visible)', async () => {
    const csvModule = require('../../lib/csv-exporter');
    const wejscia = require('../../lib/wejscia-pozniej');
    const prawdziwe = wejscia.wejscieWidoczne;
    const spy = jest.spyOn(wejscia, 'wejscieWidoczne').mockImplementation((w) => w === 'spizarnia' || prawdziwe(w));
    await act(async () => {
      tree = renderer.create(<SettingsModal visible={true} onClose={mockOnClose} />);
    });

    const root = tree!.root;
    const bakesCsvBtn = root.findByProps({ testID: 'export-bakes-csv-btn' });
    const inventoryCsvBtn = root.findByProps({ testID: 'export-inventory-csv-btn' });

    await act(async () => {
      await bakesCsvBtn.props.onPress();
    });
    expect(csvModule.exportBakeLogsCsv).toHaveBeenCalled();
    expect(csvModule.exportAndShareCsv).toHaveBeenCalledWith(
      expect.stringContaining('piekarz-historia-wypiekow-'),
      'mock-bake-csv',
      expect.any(String)
    );

    await act(async () => {
      await inventoryCsvBtn.props.onPress();
    });
    expect(csvModule.exportFlourInventoryCsv).toHaveBeenCalled();
    expect(csvModule.exportAndShareCsv).toHaveBeenCalledWith(
      expect.stringContaining('piekarz-spizarnia-mak-'),
      'mock-inventory-csv',
      expect.any(String)
    );
    spy.mockRestore();
  });

  it('opens and cancels JSON import input box', async () => {
    await act(async () => {
      tree = renderer.create(<SettingsModal visible={true} onClose={mockOnClose} />);
    });

    const root = tree!.root;
    const importBtn = root.findByProps({ testID: 'import-file-btn' });

    // Click import to open input box
    await act(async () => {
      importBtn.props.onPress();
    });

    const input = root.findByProps({ testID: 'import-json-input' });
    const cancelBtn = root.findByProps({ testID: 'cancel-import-btn' });
    expect(input).toBeDefined();
    expect(cancelBtn).toBeDefined();

    // Cancel closes input box
    await act(async () => {
      cancelBtn.props.onPress();
    });

    expect(root.findAllByProps({ testID: 'import-json-input' })).toHaveLength(0);
  });

  it('handles invalid JSON import gracefully (BR-DANE-003 Plik uszkodzony)', async () => {
    (backupModule.parseAndValidateBackup as jest.Mock).mockImplementation(() => {
      throw new Error('Nieprawidłowy format JSON');
    });

    await act(async () => {
      tree = renderer.create(<SettingsModal visible={true} onClose={mockOnClose} />);
    });

    const root = tree!.root;
    const importBtn = root.findByProps({ testID: 'import-file-btn' });

    await act(async () => {
      importBtn.props.onPress();
    });

    const input = root.findByProps({ testID: 'import-json-input' });
    await act(async () => {
      input.props.onChangeText('{ bad json');
    });

    // 113: uszkodzony plik to plik nierozpoznany — komunikat w arkuszu, bez przycisku zapisu [M1-audytor-generalny-113]
    expect(root.findAllByProps({ testID: 'import-unrecognized' }).length).toBeGreaterThan(0);
    expect(root.findAllByProps({ testID: 'confirm-import-btn' })).toHaveLength(0);
    expect(sqliteModule.restoreFromBackupData).not.toHaveBeenCalled();
  });

  it('executes safety backup and restores state when valid JSON backup is submitted', async () => {
    const validEnvelope = {
      format: 'piekarz-backup',
      schemaVersion: 1,
      exportedAt: '2026-10-15',
      state: {
        bakes: [{ id: 'b-99', recipeName: 'Pain Rustique', startedAt: 123456 }],
        starters: [{ id: 's-1', name: 'Zakwasik', flourType: 'rye', hydration: 100, birthDate: 1234, storageState: 'FRIDGE' }],
        customRecipes: [],
      },
    };

    (backupModule.parseAndValidateBackup as jest.Mock).mockReturnValue(validEnvelope);

    await act(async () => {
      tree = renderer.create(<SettingsModal visible={true} onClose={mockOnClose} />);
    });

    const root = tree!.root;
    const importBtn = root.findByProps({ testID: 'import-file-btn' });

    await act(async () => {
      importBtn.props.onPress();
    });

    const input = root.findByProps({ testID: 'import-json-input' });
    await act(async () => {
      input.props.onChangeText(JSON.stringify(validEnvelope));
    });

    const confirmBtn = root.findByProps({ testID: 'confirm-import-btn' });
    await act(async () => {
      await confirmBtn.props.onPress();
    });

    // Invariant check: safetyBackup must precede restore
    expect(backupModule.safetyBackup).toHaveBeenCalledWith('import', expect.any(Object));
    expect(sqliteModule.restoreFromBackupData).toHaveBeenCalledWith(validEnvelope.state);
    expect(Alert.alert).toHaveBeenCalledWith('Kopia zapasowa', 'Zaimportowano pomyślnie!');

    // Import box should close after successful import
    expect(root.findAllByProps({ testID: 'import-json-input' })).toHaveLength(0);
  });

  it('calls onClose when close button is pressed', async () => {
    await act(async () => {
      tree = renderer.create(<SettingsModal visible={true} onClose={mockOnClose} />);
    });

    const closeBtn = tree!.root.findByProps({ testID: 'close-modal' });
    await act(async () => {
      closeBtn.props.onPress();
    });

    expect(mockOnClose).toHaveBeenCalled();
  });
});
