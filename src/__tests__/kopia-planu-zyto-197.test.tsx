/**
 * M1-audytor-generalny-197 (03-zakres-601): „Kopiuj harmonogram” kopiuje plan pokazany na ekranie.
 * Droga: receptura żytnia → „Ułóż plan” → „Kopiuj harmonogram” → schowek. Tekst ma etapy żytnie bez składań,
 * a godziny i łączny czas są równe krokom planu (te same, które dostaje Stolnica po „Zacznij wypiek”).
 * Zegar ustawiony na 8:00, 14:00 i 23:55 (o 14:00 i 23:55 kopia dopisywała kolizje z etapów pszennych).
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), navigate: jest.fn() }), useLocalSearchParams: () => ({}) }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import * as Clipboard from 'expo-clipboard';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { initDatabase, getActiveBake, setActiveBake, _resetMemStore, getStarters, deleteStarter } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { ustawRecepturePlanu } from '../lib/plan-receptury';
import { calculateDoughRecipe } from '../core/domain-rules';
import { setLang } from '../lib/i18n';
import { formatTime } from '../lib/format';
import { czasTrwania } from '../lib/czas-trwania';

jest.setTimeout(30000);

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};

describe('197: kopia planu żytniego = plan na ekranie', () => {
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    await initDatabase();
    for (const s of await getStarters()) await deleteStarter(s.id);
  });
  afterEach(() => {
    jest.useRealTimers();
    ustawRecepturePlanu(null);
  });

  it.each([[8, 0], [14, 0], [23, 55]])('zegar %i:%i: etapy żytnie bez składań, godziny i łączny czas jak w planie', async (h, m) => {
    jest.useFakeTimers({ now: new Date(2026, 9, 21, h, m).getTime(), doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    const formula = {
      flours: [{ name: 'Mąka żytnia 2000', percentage: 100, type: 'zytnia_2000' }],
      waterPercentage: 75, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000,
    };
    ustawRecepturePlanu({ recipeName: 'Żytni', calculatedRecipe: calculateDoughRecipe(formula), recipeFormula: formula });
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
    });
    await act(async () => {
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });
    const set = Clipboard.setStringAsync as jest.Mock;
    set.mockClear();
    await act(async () => {
      tree.root.findAll((n) => n.props?.testID === 'copy-schedule-btn' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    expect(set).toHaveBeenCalledTimes(1);
    const kopia = String(set.mock.calls[0][0]);
    const ekran = textOf(tree.toJSON());
    expect(ekran).toContain('Rozrost w formie');

    // Kroki planu z ekranu: te same, które dostaje Stolnica
    await act(async () => {
      tree.root.findAll((n) => n.props?.testID === 'plan-start-bake-btn' && typeof n.props.onPress === 'function')[0].props.onPress();
    });
    const kroki = getActiveBake()!.steps!;
    act(() => tree.unmount());

    expect(kopia).toContain('Rozrost w formie');
    expect(kopia).not.toMatch(/Składanie|składaniami|Formowanie wstępne|Garowanie chłodnicze|Stretch|Coil/);
    const linie = kopia.split('\n').filter((l) => /^\d+\. /.test(l));
    expect(linie).toHaveLength(kroki.length);
    kroki.forEach((k, i) => {
      expect(linie[i]).toContain(k.name);
      expect(linie[i]).toContain(formatTime(k.plannedStart!));
    });
    const lacznie = (kroki[kroki.length - 1].plannedEnd! - kroki[0].plannedStart!) / 60_000;
    expect(kopia).toContain(`Łączny czas: ${czasTrwania(lacznie).tekst}`);
    // Kolizje tylko z kroków żytnich pokazanych na ekranie (bez etapów pszennych)
    const kolizja = kopia.split('\n').find((l) => l.startsWith('Kolizja ze snem'));
    if (kolizja) expect(kolizja).not.toMatch(/Składanie|Formowanie wstępne|Fermentacja burzliwa/);
  });
});
