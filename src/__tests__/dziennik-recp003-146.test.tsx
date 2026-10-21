/**
 * M1-audytor-generalny-146 (01-odkrywanie-504), BR-RECP-003: wpis w historii z temperaturami, które zapisał
 * wypiek (kuchnia i ciasto, gdy są), i wszystkie wpisy w historii (dawniej najwyżej 15).
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
  Stack.Screen = () => null;
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
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, saveBakeLog } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { formatTemperature } from '../lib/unit-converter';
import { setLang, t } from '../lib/i18n';
import { EN } from '../lib/i18n.en';

jest.setTimeout(30000);

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};

async function dziennik(): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider><DziennikScreen /></AppAccessProvider>);
  });
  await flush();
  return tree;
}

describe('BR-RECP-003: dziennik wypieków', () => {
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    setLang('pl');
    await initDatabase();
  });

  it('BR-RECP-003 Ocena po wypieku: wpis pokazuje temperaturę w kuchni i ciasta zapisane przy wypieku', async () => {
    await saveBakeLog({ id: 'b1', recipeName: 'Mój chleb', startedAt: 1_800_000_000_000, finishedAt: 1_800_000_100_000, ratingStars: 4, ambientTemp: 22, actualDDT: 25, notes: 'Dłużej garować' });
    const tree = await dziennik();
    const karta = tree.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'bake-log-card-b1')[0];
    const tekst = karta.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');
    expect(tekst).toContain(`${t('Temperatura w kuchni:')} ${formatTemperature(22)}`);
    expect(tekst).toContain(`${t('Temperatura ciasta:')} ${formatTemperature(25)}`);
    expect(tekst).toContain('Ocena: 4/5');
    expect(tekst).toContain('Dłużej garować');
    act(() => tree.unmount());
  });

  it('wpis bez temperatur nie pokazuje pustych pól temperatury (nic nie jest zgadywane, 017)', async () => {
    await saveBakeLog({ id: 'b2', recipeName: 'Bez temperatur', startedAt: 1_800_000_000_000, ratingStars: 3 });
    const tree = await dziennik();
    const karta = tree.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'bake-log-card-b2')[0];
    const tekst = karta.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');
    expect(tekst).not.toContain('Temperatura w kuchni:');
    expect(tekst).not.toContain('Temperatura ciasta:');
    act(() => tree.unmount());
  });

  it('BR-RECP-003 Przegląd historii bez zakupu: historia pokazuje wszystkie wpisy (20 z 20, nie 15)', async () => {
    for (let i = 0; i < 20; i++) await saveBakeLog({ id: `w${i}`, recipeName: `Chleb ${i}`, startedAt: 1_800_000_000_000 + i * 86_400_000, ratingStars: 4 });
    const tree = await dziennik();
    const karty = tree.root.findAll((n) => typeof n.type === 'string' && /^bake-log-card-w\d+$/.test(String(n.props.testID)));
    expect(karty).toHaveLength(20);
    act(() => tree.unmount());
  });

  it('nowy tekst ma wpis EN', () => {
    expect(EN['Temperatura ciasta:']).toBe('Dough temperature:');
  });
});
