// Start „Co dziś robisz?” zastępuje powitanie z wyborem stylu: bez modułu OnboardingModal,
// bez wyboru stylu w Ustawieniach i bez jego tekstów w słowniku [M1-audytor-generalny-101; BR-START-001]
import React from 'react';
import fs from 'fs';
import path from 'path';
import renderer, { act } from 'react-test-renderer';
import { SettingsModal } from '../SettingsModal';
import { setLang } from '../../lib/i18n';
import { EN } from '../../lib/i18n.en';

jest.mock('../../data/sqlite-store', () => ({
  getBakeLogs: jest.fn().mockResolvedValue([]),
  getStarters: jest.fn().mockResolvedValue([]),
  getRecipes: jest.fn().mockResolvedValue([]),
  getFlourInventory: jest.fn().mockResolvedValue([]),
  collectBackupData: jest.fn().mockResolvedValue({ bakes: [], starters: [], customRecipes: [], starterEntries: [], flourInventory: [] }),
  restoreFromBackupData: jest.fn().mockResolvedValue(undefined),
  getAppSetting: jest.fn().mockResolvedValue(null),
  setAppSetting: jest.fn().mockResolvedValue(undefined),
  getBakerRitualProfile: jest.fn().mockResolvedValue('sourdough_purist'),
  setBakerRitualProfile: jest.fn().mockResolvedValue(undefined),
  getBakingVessel: jest.fn().mockResolvedValue('dutch_oven'),
  setBakingVessel: jest.fn().mockResolvedValue(undefined),
}));

const TEKSTY_STYLU = [
  'Rytuał piekarski',
  'Wybierz styl prowadzenia ciasta i filozofię wypieku:',
  'Klasyczny Zakwasowiec',
  'Nowoczesny Rzemieślnik',
  'Początkujący Piekarz',
  'Witaj w Piekarzu',
  'Jaki jest Twój styl wypieku?',
  'Rozpocznij rytuał wypieku',
  'Wybierz swój styl wypieku. Ustawi on startowy filtr receptur w Kalkulatorze; wszystkie receptury zostają dostępne.',
];

describe('bez wyboru stylu wypieku (101)', () => {
  beforeEach(() => setLang('pl'));

  it('Ustawienia nie mają wyboru stylu; wybór naczynia zostaje', async () => {
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<SettingsModal visible onClose={() => {}} />);
    });
    const root = tree!.root;
    for (const id of ['ritual-purist-btn', 'ritual-hybrid-btn', 'ritual-beginner-btn']) {
      expect(root.findAllByProps({ testID: id })).toHaveLength(0);
    }
    const teksty = root
      .findAll((n) => (n.type as unknown) === 'Text')
      .map((n) => (Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)));
    for (const s of TEKSTY_STYLU) expect(teksty).not.toContain(s);
    expect(root.findAllByProps({ testID: 'vessel-dutch-oven-btn' }).length).toBeGreaterThan(0);
    act(() => tree!.unmount());
  });

  it('nie ma modułu OnboardingModal ani jego testu', () => {
    const katalog = path.join(__dirname, '..');
    expect(fs.existsSync(path.join(katalog, 'OnboardingModal.tsx'))).toBe(false);
    expect(fs.existsSync(path.join(__dirname, 'onboarding-modal.test.tsx'))).toBe(false);
  });

  it('słownik EN nie ma tekstów stylu wypieku', () => {
    for (const s of TEKSTY_STYLU) expect(Object.prototype.hasOwnProperty.call(EN, s)).toBe(false);
  });
});
