/**
 * Reaudit noc N-10 (M1-audytor-generalny-136): zmiana języka w Ustawieniach od razu uzgadnia zaplanowane
 * powiadomienia, już w nowym języku, a nie dopiero przy powrocie aplikacji na pierwszy plan.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { SettingsModal } from '../components/SettingsModal';
import { lang, setLang, type Lang } from '../lib/i18n';
import { resyncNotifications } from '../lib/notifications';

const jezykPrzyUzgodnieniu: Lang[] = [];

jest.mock('../lib/notifications', () => {
  const actual = jest.requireActual('../lib/notifications');
  return {
    ...actual,
    resyncNotifications: jest.fn(() => {
      jezykPrzyUzgodnieniu.push(require('../lib/i18n').lang());
      return Promise.resolve({ status: 'granted', ok: true });
    }),
  };
});

jest.mock('../lib/backup', () => ({
  exportBackup: jest.fn().mockResolvedValue(true),
  safetyBackup: jest.fn().mockResolvedValue(true),
  parseAndValidateBackup: jest.fn(),
  rescueAfterOpenFailure: jest.fn().mockResolvedValue(null),
}));

jest.mock('../data/sqlite-store', () => ({
  getBakeLogs: jest.fn().mockResolvedValue([]),
  getStarters: jest.fn().mockResolvedValue([]),
  getRecipes: jest.fn().mockResolvedValue([]),
  getFlourInventory: jest.fn().mockResolvedValue([]),
  collectBackupData: jest.fn().mockResolvedValue({ bakes: [], starters: [], customRecipes: [], starterEntries: [], flourInventory: [] }),
  restoreFromBackupData: jest.fn().mockResolvedValue(undefined),
  getAppSetting: jest.fn().mockResolvedValue(null),
  setAppSetting: jest.fn().mockResolvedValue(undefined),
  getBakerRitualProfile: jest.fn().mockResolvedValue(`${'artisan_hybrid'}`),
  setBakerRitualProfile: jest.fn().mockResolvedValue(undefined),
  getBakingVessel: jest.fn().mockResolvedValue(`${'dutch_oven'}`),
  setBakingVessel: jest.fn().mockResolvedValue(undefined),
}));

describe('N-10: zmiana języka uzgadnia powiadomienia od razu', () => {
  beforeEach(() => {
    setLang('pl');
    jezykPrzyUzgodnieniu.length = 0;
    (resyncNotifications as jest.Mock).mockClear();
  });
  afterEach(() => setLang('pl'));

  it('PL → EN: resyncNotifications wywołane po ustawieniu języka, z językiem EN', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<SettingsModal visible onClose={() => undefined} />);
    });
    (resyncNotifications as jest.Mock).mockClear();
    jezykPrzyUzgodnieniu.length = 0;
    await act(async () => {
      tree.root.findByProps({ testID: 'lang-en' }).props.onPress();
    });
    const wynik = { jezyk: lang(), wywolania: (resyncNotifications as jest.Mock).mock.calls.length, jezykPrzyUzgodnieniu: [...jezykPrzyUzgodnieniu] };
    act(() => tree.unmount());
    expect(wynik).toEqual({ jezyk: 'en', wywolania: 1, jezykPrzyUzgodnieniu: ['en'] });
  });
});
