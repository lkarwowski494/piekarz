// ============================================================================
// Piekarz (Crust) — Close Button Contract Guard (S1, NFR-INT-001)
// Pilnuje jednoznacznej semantyki zamykania ekranów modalnych i arkuszy (CloseButton).
// ============================================================================

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { CloseButton, CLOSE_TEST_ID } from '../src/components/CloseButton';
import { SettingsModal } from '../src/components/SettingsModal';
import { BreadAcademyModal } from '../src/components/BreadAcademyModal';

jest.mock('../src/data/sqlite-store', () => ({
  getAppSetting: jest.fn().mockResolvedValue(null),
  setAppSetting: jest.fn().mockResolvedValue(undefined),
  getBakeLogs: jest.fn().mockResolvedValue([]),
  getStarters: jest.fn().mockResolvedValue([]),
  getRecipes: jest.fn().mockResolvedValue([]),
  getFlourInventory: jest.fn().mockResolvedValue([]),
  restoreFromBackupData: jest.fn().mockResolvedValue(undefined),
  getBakerRitualProfile: jest.fn().mockResolvedValue('artisan_hybrid'),
  setBakerRitualProfile: jest.fn().mockResolvedValue(undefined),
  getBakingVessel: jest.fn().mockResolvedValue('dutch_oven'),
  setBakingVessel: jest.fn().mockResolvedValue(undefined),
  getCompletedLessons: jest.fn().mockResolvedValue([]),
  toggleLessonProgress: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../src/lib/backup', () => ({
  exportBackup: jest.fn().mockResolvedValue(true),
  safetyBackup: jest.fn().mockResolvedValue(true),
  parseAndValidateBackup: jest.fn(),
}));

describe('Guard S1 & NFR-INT-001: Close Button & Modal Semantics', () => {
  it('CloseButton renders with standard CLOSE_TEST_ID ("close-modal") and triggers onPress', () => {
    const onPress = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(<CloseButton onPress={onPress} />);
    });

    const btn = tree.root.findByProps({ testID: CLOSE_TEST_ID });
    expect(btn).toBeTruthy();
    expect(btn.props.title).toBe('Anuluj');

    act(() => {
      btn.props.onPress();
    });
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('SettingsModal includes standard close-modal trigger in its header', async () => {
    const onClose = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<SettingsModal visible={true} onClose={onClose} />);
    });

    const closeBtn = tree.root.findByProps({ testID: 'close-modal' });
    expect(closeBtn).toBeTruthy();

    act(() => {
      closeBtn.props.onPress();
    });
    expect(onClose).toHaveBeenCalled();
  });

  it('BreadAcademyModal includes standard close-modal trigger in its header', async () => {
    const onClose = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<BreadAcademyModal visible={true} onClose={onClose} />);
    });

    const closeBtn = tree.root.findByProps({ testID: 'close-modal' });
    expect(closeBtn).toBeTruthy();

    act(() => {
      closeBtn.props.onPress();
    });
    expect(onClose).toHaveBeenCalled();
  });
});
