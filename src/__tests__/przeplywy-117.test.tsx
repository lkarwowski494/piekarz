/**
 * Każdy przycisk prowadzi do przepływu z kontraktu, bez wejść do funkcji PÓŹNIEJ (SP-01; design-spec §5)
 * [M1-audytor-generalny-117; 04-studio-projektowe-036]:
 * (a) „Doktor” na Zakwasach otwiera Doktora zakwasu, etykieta VoiceOver „Doktor zakwasu” / “Starter Doctor”;
 * (b) bez eksportu ukrytej spiżarni mąk (F-30 PÓŹNIEJ, wejścia-później 'spizarnia') w Ustawieniach;
 * (c) Stolnica bez trwającego wypieku przekierowuje na Dziś (decyzja właściciela 2a, plan E0 partii 6) —
 *     także po dotknięciu powiadomienia, gdy wypiek już się skończył.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
const mockNawigacja = { push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn() };
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    get router() {
      return mockNawigacja;
    },
    useRouter: () => mockNawigacja,
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
    Stack: Object.assign(({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children), {
      Screen: ({ options }: { options?: { headerRight?: (p: object) => React.ReactNode } }) =>
        options && options.headerRight ? React.createElement(React.Fragment, null, options.headerRight({})) : null,
    }),
  };
});

import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import ZakwasyLayout from '../../app/(tabs)/zakwasy/_layout';
import StolnicaScreen from '../../app/stolnica';
import { BackupAndDataSection } from '../components/settings/BackupAndDataSection';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, setActiveBake, saveBakeLog } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { trasaZPowiadomienia } from '../core/notification-plan';
import { setLang, t } from '../lib/i18n';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};

async function render(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree;
}

const teksty = (tree: renderer.ReactTestRenderer) => tree.root.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');

describe('117: przepływy bez ślepych wejść', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    _resetMemStore();
    zUprawnieniem();
    await initDatabase();
    await saveBakeSession(null);
    setActiveBake(null);
  });
  afterEach(() => setLang('pl'));

  it('(a) „Doktor” na Zakwasach otwiera Doktora zakwasu; etykieta VoiceOver PL i EN', async () => {
    const tree = await render(<ZakwasyLayout />);
    const btn = tree.root.findAll((n) => n.props.testID === 'zakwas-doctor-shortcut-btn' && n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function')[0];
    expect(btn.props.accessibilityLabel).toBe('Doktor zakwasu');
    act(() => btn.props.onPress());
    expect(mockNawigacja.push).toHaveBeenCalledTimes(1);
    expect([mockNawigacja.push.mock.calls[0][0]].flat().map((a: unknown) => (typeof a === 'string' ? a : (a as { pathname: string }).pathname))).toEqual([
      '/zakwasy/doktor-zakwasu',
    ]);
    act(() => tree.unmount());
    setLang('en');
    expect(t('Doktor zakwasu')).toBe('Starter Doctor');
  });

  it('(b) Ustawienia: eksport historii wypieków jest, eksportu spiżarni mąk nie ma (F-30 PÓŹNIEJ)', async () => {
    const tree = await render(<BackupAndDataSection />);
    expect(tree.root.findAllByProps({ testID: 'export-bakes-csv-btn' }).length).toBeGreaterThan(0);
    expect(tree.root.findAllByProps({ testID: 'export-inventory-csv-btn' })).toHaveLength(0);
    expect(teksty(tree)).not.toContain('Eksportuj spiżarnię mąk (CSV)');
    act(() => tree.unmount());
  });

  it('(c) Stolnica bez trwającego wypieku (np. z powiadomienia po wypieku) przekierowuje na Dziś, bez stanu „Brak aktywnego wypieku” i drugiej historii', async () => {
    await saveBakeLog({ id: 'bake_117', recipeName: 'Chleb z historii', startedAt: 1, finishedAt: 2, ratingStars: 4 });
    expect(trasaZPowiadomienia('/stolnica')).toBe('/stolnica');
    const tree = await render(<StolnicaScreen />);
    expect(mockNawigacja.replace).toHaveBeenCalledWith('/');
    const txt = teksty(tree);
    expect(txt).not.toContain('Brak aktywnego wypieku');
    expect(txt).not.toContain('Chleb z historii');
    expect(txt).not.toContain('Zacznij wypiek');
    act(() => tree.unmount());
  });

  it('(c) kontrola: z trwającym wypiekiem Stolnica prowadzi krok i nie przekierowuje', async () => {
    setActiveBake({ id: 'bake_trwa', recipeName: 'Chleb w toku', startedAt: Date.now(), currentStageId: 'mix', ambientTempC: 22, actualDdtC: 25 });
    const tree = await render(<StolnicaScreen />);
    expect(mockNawigacja.replace).not.toHaveBeenCalled();
    expect(teksty(tree)).toContain('Chleb w toku');
    act(() => tree.unmount());
  });
});
