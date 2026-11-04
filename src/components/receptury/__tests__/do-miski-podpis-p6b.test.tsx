/**
 * M3 p6b (D-209, README §6, makieta karty/receptury.html #receptura): karta „Do miski” z nagłówkiem „Do miski”
 * i podpisem „Odhaczaj przy ważeniu.” pod nagłówkiem — podpis jako element `Karta` (tokeny: przypis, tusz2).
 */
jest.mock('../../../data/sqlite-store', () => ({
  getAppSetting: jest.fn(async () => undefined),
  setAppSetting: jest.fn(async () => undefined),
}));
jest.mock('react-native-safe-area-context', () => {
  const ReactMod = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => ReactMod.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { DoMiski, DoMiskiProps } from '../DoMiski';
import { Karta } from '../../../ui/karty/Karta';
import { calculateDoughRecipe } from '../../../core/domain-rules';
import { procentyFormulyZZaczynem, zaczynWFormule } from '../../../core/zaczyn-w-formule';
import { setLang } from '../../../lib/i18n';
import { _resetRodzajDrozdzy } from '../../../lib/rodzaj-drozdzy';
import { theme } from '../../../ui/theme';
import { typografia } from '../../../ui/tokeny';

type Wezel = renderer.ReactTestInstance;
const host = (root: Wezel, id: string) => root.findAll((n) => typeof n.type === 'string' && n.props?.testID === id);
const tekstWezla = (n: Wezel): string => [n.props.children].flat().join('');

const formula = (yeast: number) => ({
  flours: [{ name: 'Mąka pszenna typ 650', percentage: 100 }], waterPercentage: 68, saltPercentage: 2,
  starterPercentage: 0, extraYeastPercentage: yeast, targetDoughWeightGrams: 1000 * (1 + 0.68 + 0.02 + yeast / 100),
});
function props(): DoMiskiProps {
  return {
    calculations: calculateDoughRecipe(formula(1)),
    waterPct: 68, starterPct: 0, starterHydration: 100, saltPct: 2, yeastPct: 1,
    calcMode: 'loaves', loavesCount: 1, onLoavesChange: jest.fn(), loafWeightGrams: 1000, onLoafWeightChange: jest.fn(),
    flourGrams: 1000, onFlourGramsChange: jest.fn(), prefermentType: 'direct', prefermentBreakdown: null,
  };
}
function zBiga(): DoMiskiProps {
  const f = { waterPercentage: 70, saltPercentage: 2, starterPercentage: 0, starterHydration: 100, yeastPercentage: 0.5 };
  const wej = { ...f, prefermentType: 'biga' as const, prefermentFlourPercentage: 50 };
  const proc = procentyFormulyZZaczynem(wej);
  return { ...props(), yeastPct: proc.yeastPercentage, prefermentType: 'biga', prefermentBreakdown: zaczynWFormule({ ...wej, ...proc, targetDoughWeightGrams: 1000 }) };
}
async function render(el: React.ReactElement) {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(el);
  });
  return tree!;
}

describe('M3 p6b: „Do miski” + podpis „Odhaczaj przy ważeniu.” (README §6, D-209)', () => {
  beforeEach(() => {
    setLang('pl');
    _resetRodzajDrozdzy();
    Object.assign(mockOkno, { fontScale: 1 });
  });

  it.each([['bez zaczynu', props], ['z zaczynem (biga)', zBiga]])('%s: nagłówek „Do miski”, podpis pod nagłówkiem w karcie', async (_n, p) => {
    const tree = await render(<DoMiski {...p()} />);
    const [karta] = host(tree.root, 'karta-do-miski');
    expect(karta).toBeDefined();
    expect(tekstWezla(host(karta, 'karta-do-miski-tytul')[0])).toBe('Do miski');
    const podpis = host(karta, 'karta-do-miski-podpis');
    expect(podpis.map(tekstWezla)).toEqual(['Odhaczaj przy ważeniu.']);
    // Podpis bez roli nagłówka; po nagłówku, przed wierszami
    expect(podpis[0].props.accessibilityRole).toBeUndefined();
    const kolejnosc = karta.findAll((n) => typeof n.type === 'string' && ['karta-do-miski-naglowek', 'karta-do-miski-podpis', 'scale-item-water'].includes(n.props?.testID)).map((n) => n.props.testID);
    expect(kolejnosc).toEqual(['karta-do-miski-naglowek', 'karta-do-miski-podpis', 'scale-item-water']);
    act(() => tree.unmount());
  });

  it('Karta: podpis z tokenów (przypis, tusz2), bez limitu skali; bez podpisu brak elementu', async () => {
    const tree = await render(<Karta testID="k" tytul="Tytuł" podpis="Zdanie." />);
    const podpisy = host(tree.root, 'k-podpis');
    expect(podpisy.map(tekstWezla)).toEqual(['Zdanie.']);
    const [p] = podpisy;
    const s = StyleSheet.flatten(p.props.style);
    expect([s.fontSize, s.color]).toEqual([typografia.style.przypis.pt, theme.colors.tusz2]);
    expect(p.props.maxFontSizeMultiplier).toBeUndefined();
    const bez = await render(<Karta testID="k2" tytul="Tytuł" />);
    expect(host(bez.root, 'k2-podpis')).toHaveLength(0);
    act(() => tree.unmount());
    act(() => bez.unmount());
  });
});
