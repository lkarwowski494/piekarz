import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { SettingsModal } from '../SettingsModal';
import { lang, setLang } from '../../lib/i18n';
import * as backupModule from '../../lib/backup';

jest.mock('../../lib/backup', () => ({
  exportBackup: jest.fn().mockResolvedValue(true),
}));

jest.mock('../../data/sqlite-store', () => ({
  getBakeLogs: jest.fn().mockResolvedValue([]),
  getStarters: jest.fn().mockResolvedValue([]),
  getRecipes: jest.fn().mockResolvedValue([]),
}));

describe('SettingsModal Component', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    setLang('pl');
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

    expect(plBtn).toBeDefined();
    expect(enBtn).toBeDefined();
    expect(exportBtn).toBeDefined();
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
