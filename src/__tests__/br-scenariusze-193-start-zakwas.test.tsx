/**
 * M1-audytor-generalny-193 (01-odkrywanie-601): scenariusze BRD z nazwą w tytule testu.
 * - BR-START-001 „Powrót z trwającym wypiekiem” (ER-53, D-066 6a): ekran Dziś.
 * - BR-ZAKW-004 „Tylko płyn o zapachu alkoholu” (RD-21-W3, ZAK-HOO-001; ER-54, D-066 4a): ekran Zakwasy.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  Stack.Screen = ({ options }: { options?: { headerRight?: () => React.ReactNode } }) =>
    options?.headerRight ? React.createElement(React.Fragment, null, options.headerRight()) : null;
  return {
    Stack,
    useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});

import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { planBakeSteps } from '../core/bake-steps';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

jest.setTimeout(20000);

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};
const teksty = (root: renderer.ReactTestInstance): string[] =>
  root.findAllByType(Text).map((n) => [n.props.children].flat().join(''));

describe('BR-START-001 i BR-ZAKW-004: scenariusze na ekranie', () => {
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    await initDatabase();
    await saveBakeSession(null);
  });

  // Zmiana M3 D4b: kolejność według D-105 (wybór właściciela, wariant 3+1): pas z „Następne” u góry, kafle czynności,
  // pod nimi trwający wypiek jako spirala z powrotem jednym dotknięciem. Scenariusz BRD „na górze trwający wypiek”
  // do uzgodnienia przez rolę 01 (zgłoszenie w raporcie D4b); asercje powrotu i kroku bez zmian.
  it('BR-START-001 Powrót z trwającym wypiekiem: trwający wypiek z bieżącym krokiem i powrotem jednym dotknięciem pod kaflami (D-105)', async () => {
    const start = Date.now() - 60_000;
    const steps = planBakeSteps({ startAt: start, isHighRye: false });
    await saveBakeSession({ version: 2, steps, stepIdx: 3, dutchOvenPhase: 'lid_on', timerEndsAt: null, pausedLeftSec: 600, recipeName: 'Chleb pszenny na zakwasie', startedAt: start, bake: null });
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <AppAccessProvider>
          <StartScreen />
        </AppAccessProvider>,
      );
    });
    await flush();
    const t = teksty(tree.root);
    const iWypiek = t.findIndex((s) => s.includes('Chleb pszenny na zakwasie'));
    const iWybor = t.findIndex((s) => s.includes('Piekę na drożdżach albo pizzę'));
    expect(iWybor).toBeGreaterThanOrEqual(0);
    expect(iWypiek).toBeGreaterThan(iWybor);
    // Bieżący krok (4 z n) i jeden przycisk powrotu
    expect(tree.root.findByProps({ testID: 'brand-spiral' }).props.accessibilityLabel).toContain(`krok 4 z ${steps.length}`);
    const wroc = tree.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'resume-bake-btn');
    expect(wroc).toHaveLength(1);
    expect(wroc[0].props.accessibilityRole).toBe('button');
    // Wybór czynności nadal jest (niżej), z trzema przyciskami
    expect(tree.root.findAllByProps({ testID: 'start-czynnosci' }).length).toBeGreaterThan(0);
    act(() => tree.unmount());
  });

  it('BR-ZAKW-004 Tylko płyn o zapachu alkoholu: według CSU Extension płyn jest w porządku, rada „zlej albo wmieszaj”, bez „dokarm” i bez polecenia wyrzucenia (RD-21-W3)', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<ZakwasScreen />);
    });
    await flush();
    const hooch = tree.root.findAll((n) => typeof n.props?.onPress === 'function' && n.props.testID === 'check-hooch');
    expect(hooch.length).toBeGreaterThan(0);
    await act(async () => {
      hooch[0].props.onPress();
    });
    const t = teksty(tree.root).join(' ');
    const rada = teksty(tree.root).filter((s) => s.includes('CSU Extension'));
    expect(rada).toHaveLength(1);
    expect(rada[0]).toContain('Według CSU Extension warstwa płynu o zapachu alkoholu jest w porządku');
    expect(rada[0]).toContain('Możesz ją zlać albo wmieszać');
    expect(rada[0]).not.toMatch(/dokarm/i);
    expect(t).not.toContain('Wyrzuć zakwas');
    act(() => tree.unmount());
  });
});
