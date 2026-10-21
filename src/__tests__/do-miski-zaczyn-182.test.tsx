/**
 * Karta „Do miski” z zaczynem: suma wierszy grupy „Do miski” = masa ciasta ±1 g, grupa „Zaczyn” = wiersz „cały” ±1 g,
 * bez podwójnego zakwasu (D-061, DEC-23 a) — przez ekran receptury, dla poolish, biga, pâte fermentée i levain,
 * z zakwasem i bez [M1-audytor-generalny-182; M2-koordynator-napraw-101]. Wzór własności: DoMiski-suma-040.
 */
import React from 'react';
import { ActionSheetIOS } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as fc from 'fast-check';
import EkranReceptury from '../../app/(tabs)/receptury/receptura';
import { setPendingRecipeToLoad, clearPendingRecipeToLoad } from '../lib/recipe-navigation';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { ZACZYNY_W_MENU, PROCENTY_MAKI_W_ZACZYNIE } from '../components/receptury/nazwy-receptur';
import { procentyFormulyZZaczynem, zaczynWFormule } from '../core/zaczyn-w-formule';
import type { PrefermentType } from '../core/preferments';

jest.setTimeout(60000);
jest.mock('../lib/wejscia-pozniej', () => ({ wejscieWidoczne: () => true }));
jest.mock('expo-router', () => ({ useRouter: () => ({ push: jest.fn(), setParams: jest.fn() }), useLocalSearchParams: () => ({}) }));
jest.mock('react-native-safe-area-context', () => {
  const ReactMod = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => ReactMod.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const PBT_SEED: number | undefined = fc.readConfigureGlobal().seed;

const teksty = (n: renderer.ReactTestInstance): string[] =>
  n.findAll((c) => (c.type as unknown) === 'Text').map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)));
const host = (root: renderer.ReactTestInstance, id: string) =>
  root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const nacisnij = async (root: renderer.ReactTestInstance, id: string) => {
  const el = root.findAll((n) => n.props.testID === id && typeof n.props.onPress === 'function')[0];
  if (!el) throw new Error(`brak ${id}`);
  await act(async () => {
    el.props.onPress();
  });
};
/** Masa z tekstu wiersza („1 000 g”, „0,3 g”). */
const gramy = (s: string): number => {
  const m = s.replace(/[\s  ]/g, '').match(/(\d+(?:[.,]\d+)?)g$/);
  if (!m) throw new Error(`nie rozpoznano masy: ${s}`);
  return Number((m[1] ?? '').replace(',', '.'));
};
const masaWiersza = (w: renderer.ReactTestInstance) => gramy(teksty(w).slice(-1)[0] ?? '');
const wierszeGrupy = (root: renderer.ReactTestInstance, grupa: string) => {
  const g = host(root, grupa)[0];
  if (!g) throw new Error(`brak grupy ${grupa}`);
  return g.findAll((n) => typeof n.type === 'string' && typeof n.props.testID === 'string' && n.props.testID.startsWith('scale-item-'));
};

type Przypadek = { zaczyn: PrefermentType; zakwas: number; woda: number; procentMaki: number };

async function karta(p: Przypadek) {
  setPendingRecipeToLoad({
    id: 'test-182',
    name: 'Test 182',
    formula: {
      flours: [{ name: 'Mąka pszenna typ 750', percentage: 100 }],
      waterPercentage: p.woda,
      saltPercentage: 2,
      starterPercentage: p.zakwas,
      starterHydration: 100,
      extraYeastPercentage: 0,
      targetDoughWeightGrams: 1000,
    },
    targetDDT: 24,
  });
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<EkranReceptury />);
  });
  await act(async () => {
    await Promise.resolve();
  });
  const root = tree!.root;
  await nacisnij(root, 'edit-ingredients-btn');
  const menu = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation(() => undefined);
  await nacisnij(root, 'preferment-type-btn');
  await act(async () => menu.mock.calls[0][1](ZACZYNY_W_MENU.indexOf(p.zaczyn)));
  await nacisnij(root, 'preferment-flour-btn');
  await act(async () => menu.mock.calls[1][1](PROCENTY_MAKI_W_ZACZYNIE.indexOf(p.procentMaki)));
  return tree!;
}

const PRZYPADKI: Przypadek[] = (['poolish', 'biga', 'pate_fermentee', 'levain'] as PrefermentType[]).flatMap((zaczyn) =>
  [0, 20].flatMap((zakwas) => [
    { zaczyn, zakwas, woda: 70, procentMaki: 20 },
    { zaczyn, zakwas, woda: 50, procentMaki: 40 },
  ]),
);

describe('182: karta „Do miski” z zaczynem sumuje się do masy ciasta (D-061)', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    clearPendingRecipeToLoad();
    await initDatabase();
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    jest.restoreAllMocks();
  });

  it.each(PRZYPADKI)('przez ekran: $zaczyn, zakwas $zakwas%, woda $woda%, mąka w zaczynie $procentMaki%', async (p) => {
    tree = await karta(p);
    const root = tree.root;
    const masa = gramy(teksty(host(root, 'recipe-total')[0]!).join(''));
    const misa = wierszeGrupy(root, 'do-miski-ciasto');
    const suma = misa.reduce((a, w) => a + masaWiersza(w), 0);
    expect(Math.abs(suma - masa)).toBeLessThanOrEqual(1.0001);

    const caly = masaWiersza(host(root, 'scale-item-preferment-all')[0]!);
    const zaczyn = wierszeGrupy(root, 'do-miski-zaczyn').reduce((a, w) => a + masaWiersza(w), 0);
    expect(Math.abs(zaczyn - caly)).toBeLessThanOrEqual(1.0001);

    // Bez podwójnego zakwasu: przy levainie zakwas jest w zaczynie, poza levainem w misce, nigdy w obu
    const zakwasWMisce = misa.filter((w) => w.props.testID === 'scale-item-starter').length;
    const zakwasWZaczynie = host(root, 'scale-item-preferment-starter').length;
    expect(zakwasWMisce + zakwasWZaczynie).toBe(p.zakwas > 0 ? 1 : 0);
    if (p.zakwas > 0) expect(p.zaczyn === 'levain' ? zakwasWZaczynie : zakwasWMisce).toBe(1);
    for (const w of misa) expect(masaWiersza(w)).toBeGreaterThanOrEqual(0);
  });

  it('własność: 20 000 receptur (4 zaczyny, zakwas 0–40%) — suma wierszy = masa ±1 g, wiersze ≥ 0', () => {
    const dziesiate = (g: number[], d: number[]) => g.reduce((a, x) => a + 10 * x, 0) + d.reduce((a, x) => a + Math.round(x * 10), 0);
    try {
      fc.assert(
        fc.property(
          fc.constantFrom<PrefermentType>('poolish', 'biga', 'pate_fermentee', 'levain'),
          fc.integer({ min: 300, max: 5000 }),
          fc.constantFrom(...PROCENTY_MAKI_W_ZACZYNIE),
          fc.double({ min: 30, max: 100, noNaN: true }),
          fc.double({ min: 0, max: 4, noNaN: true }),
          fc.double({ min: 0, max: 2, noNaN: true }),
          fc.oneof(fc.constant(0), fc.double({ min: 5, max: 40, noNaN: true })),
          fc.double({ min: 50, max: 200, noNaN: true }),
          (typ, masa, pMaki, woda, sol, drozdze, zakwas, hydrZakwasu) => {
            const wejscie = { prefermentType: typ, prefermentFlourPercentage: pMaki, waterPercentage: woda, saltPercentage: sol, yeastPercentage: drozdze, starterPercentage: zakwas, starterHydration: hydrZakwasu };
            const r = zaczynWFormule({ ...wejscie, ...procentyFormulyZZaczynem(wejscie), targetDoughWeightGrams: masa })!;
            const misa = dziesiate([r.prefermentTotalWeightGrams, r.doughAddedFlourGrams, r.doughAddedWaterGrams, r.doughStarterGrams], [r.doughAddedSaltGrams, r.doughYeastGrams]);
            const zaczyn = dziesiate([r.prefermentFlourGrams, r.prefermentWaterGrams, r.prefermentStarterGrams], [r.prefermentYeastGrams, r.prefermentSaltGrams]);
            expect(Math.abs(misa - masa * 10)).toBeLessThanOrEqual(10);
            expect(Math.abs(zaczyn - r.prefermentTotalWeightGrams * 10)).toBeLessThanOrEqual(10);
            for (const x of [r.doughAddedFlourGrams, r.doughAddedWaterGrams, r.doughStarterGrams, r.doughAddedSaltGrams, r.doughYeastGrams]) expect(x).toBeGreaterThanOrEqual(0);
            expect(typ === 'levain' ? r.doughStarterGrams : r.prefermentStarterGrams).toBe(0);
          },
        ),
        { numRuns: 20000, ...(PBT_SEED !== undefined ? { seed: PBT_SEED } : {}) },
      );
    } catch (error: unknown) {
      console.warn(`[182 PBT FAILURE] ziarno: ${PBT_SEED ?? 'losowe: patrz raport fast-check (seed)'}`);
      throw error;
    }
  });

  it('pâte fermentée według D-060: 75% wody, 1% drożdży i 2% soli w zaczynie, drożdże i sól w masie ciasta', () => {
    const wejscie = { prefermentType: 'pate_fermentee' as PrefermentType, prefermentFlourPercentage: 25, waterPercentage: 70, saltPercentage: 2, yeastPercentage: 0, starterPercentage: 0, starterHydration: 100 };
    const f = procentyFormulyZZaczynem(wejscie);
    expect(f.yeastPercentage).toBeCloseTo(0.25, 6);
    const r = zaczynWFormule({ ...wejscie, ...f, targetDoughWeightGrams: 1000 })!;
    expect(r.prefermentWaterGrams / r.prefermentFlourGrams).toBeCloseTo(0.75, 1);
    expect(r.prefermentSaltGrams).toBeGreaterThan(0);
    expect(r.prefermentYeastGrams).toBeGreaterThan(0);
  });
});
