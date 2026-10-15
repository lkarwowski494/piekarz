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
  restoreFromBackupData: jest.fn().mockResolvedValue(undefined),
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
    const importBtn = root.findByProps({ testID: 'import-backup-btn' });

    expect(plBtn).toBeDefined();
    expect(enBtn).toBeDefined();
    expect(exportBtn).toBeDefined();
    expect(importBtn).toBeDefined();
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

  it('opens and cancels JSON import input box', async () => {
    await act(async () => {
      tree = renderer.create(<SettingsModal visible={true} onClose={mockOnClose} />);
    });

    const root = tree!.root;
    const importBtn = root.findByProps({ testID: 'import-backup-btn' });

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

  it('handles invalid JSON import gracefully', async () => {
    (backupModule.parseAndValidateBackup as jest.Mock).mockImplementation(() => {
      throw new Error('Nieprawidłowy format JSON');
    });

    await act(async () => {
      tree = renderer.create(<SettingsModal visible={true} onClose={mockOnClose} />);
    });

    const root = tree!.root;
    const importBtn = root.findByProps({ testID: 'import-backup-btn' });

    await act(async () => {
      importBtn.props.onPress();
    });

    const input = root.findByProps({ testID: 'import-json-input' });
    await act(async () => {
      input.props.onChangeText('{ bad json');
    });

    const confirmBtn = root.findByProps({ testID: 'confirm-import-btn' });
    await act(async () => {
      await confirmBtn.props.onPress();
    });

    expect(Alert.alert).toHaveBeenCalledWith(
      expect.any(String),
      'Nieprawidłowy format JSON'
    );
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
    const importBtn = root.findByProps({ testID: 'import-backup-btn' });

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
