/**
 * M1-audytor-generalny-193 (01-odkrywanie-601): scenariusze BRD z nazwą w tytule testu, liczby z BRD.
 * - BR-KALK-003 „Suma równa masie ciasta” (RD-15-W3) i „Korekta zaokrągleń” (RD-15-W8): karta „Do miski”.
 * - BR-HARMO-003 „Temperatura tylko z zakresu modelu” (RD-17-W5, RD-17-W6; D-066 2a): ekran planu.
 * Dlaczego: bramka br-bez-testu sprawdza ID BR, nie scenariusz; bez tych testów zmiana zaokrągleń albo
 * dodanie pola temperatury nie zaczerwieniłaby niczego.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { DoMiski, DoMiskiProps } from '../components/receptury/DoMiski';
import { calculateDoughRecipe } from '../core/domain-rules';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

jest.setTimeout(20000);

jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), navigate: jest.fn() }), useLocalSearchParams: () => ({}) }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const tekstWezla = (n: renderer.ReactTestInstance): string =>
  n
    .findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children ?? '')))
    .join(' ')
    .replace(/[  ]/g, ' ');

/** Wiersze karty: [nazwa, masa] z testID scale-item-*. */
async function wierszeKarty(masa: number, zakwas: number): Promise<{ wiersze: string[]; calosc: string }> {
  const calc = calculateDoughRecipe({
    targetDoughWeightGrams: masa,
    flours: [{ name: 'Mąka', percentage: 100 }],
    waterPercentage: 70,
    saltPercentage: 2,
    starterPercentage: zakwas,
    starterHydration: 100,
  });
  const props: DoMiskiProps = {
    calculations: calc,
    waterPct: 70,
    starterPct: zakwas,
    starterHydration: 100,
    saltPct: 2,
    yeastPct: 0,
    calcMode: 'loaves',
    loavesCount: 1,
    onLoavesChange: jest.fn(),
    loafWeightGrams: masa,
    onLoafWeightChange: jest.fn(),
    flourGrams: 500,
    onFlourGramsChange: jest.fn(),
    prefermentType: 'direct',
    prefermentBreakdown: null,
  };
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<DoMiski {...props} />);
  });
  const wiersze = tree.root
    .findAll((n) => typeof n.type === 'string' && typeof n.props.testID === 'string' && n.props.testID.startsWith('scale-item-'))
    .map(tekstWezla);
  const calosc = tekstWezla(tree.root);
  act(() => tree.unmount());
  return { wiersze, calosc };
}

const masaWiersza = (w: string): number => {
  const m = w.match(/(\d+(?:,\d+)?) g\s*$/);
  if (!m) throw new Error(`nie rozpoznano masy: ${w}`);
  return Number(m[1].replace(',', '.'));
};

describe('BR-KALK-003: skalowanie do masy ciasta (RD-15)', () => {
  it('BR-KALK-003 Suma równa masie ciasta: 999 g → 581 g mąki, 407 g wody, 11,6 g soli, „Razem 999 g”, suma wierszy 999,6 g (RD-15-W3)', async () => {
    const { wiersze, calosc } = await wierszeKarty(999, 0);
    expect(wiersze.map(masaWiersza)).toEqual([581, 407, 11.6]);
    expect(calosc).toMatch(/Razem:? 999 g/);
    const suma = wiersze.map(masaWiersza).reduce((a, b) => a + b, 0);
    expect(Math.round(suma * 10) / 10).toBe(999.6);
    expect(Math.abs(suma - 999)).toBeLessThanOrEqual(1);
  });

  it('BR-KALK-003 Korekta zaokrągleń: 569 g z zakwasem 20% → 296 g mąki, 208 g wody, 59 g zakwasu, 5,9 g soli, w wierszach 568,9 g (RD-15-W8)', async () => {
    const { wiersze } = await wierszeKarty(569, 20);
    const masy = wiersze.map(masaWiersza);
    expect([...masy].sort((a, b) => a - b)).toEqual([5.9, 59, 208, 296]);
    expect(Math.round(masy.reduce((a, b) => a + b, 0) * 10) / 10).toBe(568.9);
  });
});

describe('BR-HARMO-003: czas fermentacji z temperatury w planie', () => {
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
  });

  it('BR-HARMO-003 Temperatura tylko z zakresu modelu: start 23 °C, wybór tylko 20/22/24/26 °C, bez pola do wpisania (RD-17-W5, RD-17-W6; D-066 2a)', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });
    const tekst = tekstWezla(tree.root);
    expect(tekst).toMatch(/Temperatura w kuchni: 23 ?°C/);
    // Chipy temperatury: wszystkie wartości °C na przyciskach mieszczą się w 20–26 °C
    const etykiety = tree.root
      .findAll((n) => typeof n.props?.onPress === 'function')
      .map(tekstWezla)
      .filter((s) => /^\s*\d+ ?°C\s*$/.test(s));
    const wartosci = [...new Set(etykiety.map((s) => Number(s.replace(/[^\d]/g, ''))))].sort((a, b) => a - b);
    expect(wartosci).toEqual([20, 22, 24, 26]);
    // Żadnego pola tekstowego temperatury (nie da się wpisać 19,9 °C)
    const pola = tree.root.findAll((n) => (n.type as unknown) === 'TextInput');
    expect(pola.filter((p) => /temp|°C|kuchni/i.test(`${p.props.testID ?? ''} ${p.props.accessibilityLabel ?? ''} ${p.props.placeholder ?? ''}`))).toEqual([]);
    act(() => tree.unmount());
  });
});
