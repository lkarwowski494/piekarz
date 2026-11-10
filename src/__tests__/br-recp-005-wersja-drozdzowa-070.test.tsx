/**
 * BR-RECP-005 (docs/brd/wymagania-dziennik.md): scenariusze przełącznika „na zakwasie / na drożdżach” na ekranie
 * receptury, sprawdzane na karcie „Do miski” (D-154, D-173, D-178, D-152). Wpis „bez kodu” w scripts/br-wyjatki.json
 * był nieaktualny (07-jakosc-006) [M1-audytor-generalny-070].
 * Scenariusz „Wersja ze źródła szczebla 4” bez testu: notatka tartine nie nazywa King Arthur Baking (wpis „czesciowe”).
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const Stack = ({ children }: { children: React.ReactNode }) => ReactMod.createElement(ReactMod.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    useRouter: () => ({ push: mockPush, navigate: jest.fn(), setParams: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => ReactMod.useEffect(cb, []),
  };
});
jest.mock('react-native-safe-area-context', () => {
  const ReactMod = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => ReactMod.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import EkranReceptury from '../../app/(tabs)/receptury/receptura';
import { initDatabase, _resetMemStore, setActiveBake, setAppSetting } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { clearPendingRecipeToLoad, setPendingRecipeToLoad } from '../lib/recipe-navigation';
import { ustawRecepturePlanu, recepturaPlanu } from '../lib/plan-receptury';
import { CATALOG_RECIPES } from '../recipes/katalog';
import { calculateDoughRecipe } from '../core/domain-rules';
import { formulaWersji } from '../recipes/wersje-drozdzowe';
import { KLUCZ_RODZAJU_DROZDZY, _resetRodzajDrozdzy } from '../lib/rodzaj-drozdzy';
import { formatDoseWeight } from '../lib/unit-converter';
import { zUprawnieniem, bezUprawnienia } from '../../tests/helpers/platnosci';
import { setLang } from '../lib/i18n';

jest.setTimeout(30000);

type Wezel = renderer.ReactTestInstance;
const host = (root: Wezel, id: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const tekst = (n: Wezel): string =>
  n.findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)))
    .join(' ');
const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
  });
};
const nacisnij = async (root: Wezel, id: string) => {
  const p = root.findAll((n) => n.props.testID === id && typeof n.props.onPress === 'function');
  expect(p.map(() => id)).toEqual([id]);
  await act(async () => {
    await p[0].props.onPress();
  });
  await settle();
};
const doMiski = (root: Wezel) => {
  const k = host(root, 'do-miski');
  expect(k).toHaveLength(1);
  return k[0];
};
const wiersz = (root: Wezel, id: string) => host(doMiski(root), id).map(tekst);

describe('BR-RECP-005 Wersja na drożdżach w recepturze na zakwasie', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const otworz = async (id: string) => {
    const p = CATALOG_RECIPES.find((r) => r.id === id)!;
    setPendingRecipeToLoad({ id: p.id, name: p.namePl, formula: p.formula, targetDDT: p.targetDDT });
    await act(async () => {
      tree = renderer.create(<EkranReceptury />);
    });
    await settle();
    return tree!.root;
  };
  const zamknij = () => {
    if (tree) act(() => tree?.unmount());
    tree = null;
  };
  beforeEach(async () => {
    useTempDbDir();
    zUprawnieniem();
    _resetMemStore();
    _resetRodzajDrozdzy();
    setActiveBake(null);
    setLang('pl');
    clearPendingRecipeToLoad();
    ustawRecepturePlanu(null);
    mockPush.mockClear();
    await initDatabase();
    // Wybory z poprzednich testów (wersja receptury, rodzaj drożdży) nie przechodzą do następnego
    await setAppSetting('wersje_receptur', '{}');
    await setAppSetting(KLUCZ_RODZAJU_DROZDZY, 'swieze');
  });
  afterEach(() => {
    zamknij();
    ustawRecepturePlanu(null);
  });

  // Przykłady scenariusza: procent drożdży świeżych z danych tej receptury (rejestr roli 06)
  it.each([
    ['spelt_ancient_seeded', 3, undefined, undefined],
    ['graham_bread_honey', 2, undefined, undefined],
    ['rye_100_pan', 3, 76, 1.2],
    ['tartine_high_hydration_80', 1.7, undefined, undefined],
  ] as const)('BR-RECP-005 Przełączenie na drożdże: %s — „Do miski” bez zakwasu, drożdże świeże %s% mąki', async (id, proc, woda, sol) => {
    const root = await otworz(id);
    expect(wiersz(root, 'scale-item-starter')).toHaveLength(1);
    expect(wiersz(root, 'scale-item-yeast')).toHaveLength(0);
    await nacisnij(root, 'recipe-version-yeast');
    expect(wiersz(root, 'scale-item-starter')).toEqual([]);
    const [drozdze] = wiersz(root, 'scale-item-yeast');
    expect(drozdze).toContain(`${String(proc).replace('.', ',')}%`);
    // Masa drożdży = procent wersji × masa mąki tej samej formuły (świeże, bez przelicznika)
    const p = CATALOG_RECIPES.find((r) => r.id === id)!;
    const c = calculateDoughRecipe(formulaWersji(p.formula, id, 'drozdze'));
    expect(c.starterGrams).toBe(0);
    expect(c.yeastGrams).toBeCloseTo((c.baseFlourWeightGrams * proc) / 100, 0);
    expect(drozdze).toContain(formatDoseWeight(c.yeastGrams, 'metric'));
    if (woda !== undefined) expect(tekst(host(root, 'scale-item-water')[0])).toContain(`${woda}%`);
    if (sol !== undefined) expect(tekst(host(root, 'scale-item-salt')[0])).toContain(`${String(sol).replace('.', ',')}%`);
  });

  it('BR-RECP-005 Przełączenie na drożdże: orkisz podaje też wariant z nocą w lodówce (1%, DRO-WER-SP-002)', async () => {
    const root = await otworz('spelt_ancient_seeded');
    await nacisnij(root, 'recipe-version-yeast');
    expect(tekst(host(root, 'recipe-about')[0])).toContain('Z nocą w lodówce: 1% drożdży');
  });

  it.each(['country_loaf_72', 'pain_de_campagne', 'san_francisco_sourdough', 'borodinsky_rye', 'lievito_madre_panettone_brioche'])(
    'BR-RECP-005 Receptura bez źródła wersji drożdżowej: %s bez przełącznika, zakwas na karcie „Do miski”',
    async (id) => {
      const root = await otworz(id);
      expect(host(root, 'recipe-version')).toHaveLength(0);
      expect(host(root, 'recipe-version-yeast')).toHaveLength(0);
      expect(wiersz(root, 'scale-item-starter')).toHaveLength(1);
    },
  );

  it('BR-RECP-005 Powrót do wersji na zakwasie: zakwas i te same ilości co przed przełączeniem', async () => {
    const root = await otworz('rye_100_pan');
    const przed = tekst(doMiski(root));
    await nacisnij(root, 'recipe-version-yeast');
    expect(tekst(doMiski(root))).not.toBe(przed);
    await nacisnij(root, 'recipe-version-sourdough');
    expect(tekst(doMiski(root))).toBe(przed);
    expect(wiersz(root, 'scale-item-starter')).toHaveLength(1);
  });

  it('BR-RECP-005 Rodzaj drożdży w wersji drożdżowej: „suche” daje masę drożdży suchych według RD-19 (× 0,35)', async () => {
    const root = await otworz('graham_bread_honey');
    await nacisnij(root, 'recipe-version-yeast');
    const c = calculateDoughRecipe(formulaWersji(CATALOG_RECIPES.find((r) => r.id === 'graham_bread_honey')!.formula, 'graham_bread_honey', 'drozdze'));
    expect(wiersz(root, 'scale-item-yeast')[0]).toContain(formatDoseWeight(c.yeastGrams, 'metric'));
    await nacisnij(root, 'do-miski-yeast-dry');
    const [suche] = wiersz(root, 'scale-item-yeast');
    expect(suche).toContain(formatDoseWeight(c.yeastGrams * 0.35, 'metric'));
    expect(suche).not.toContain(formatDoseWeight(c.yeastGrams, 'metric'));
    expect(wiersz(root, 'scale-item-starter')).toEqual([]);
  });

  it('BR-RECP-005 Bez Pro: Basic przełącza na drożdże i widzi wersję bez oferty zakupu (D-152)', async () => {
    bezUprawnienia();
    const root = await otworz('graham_bread_honey');
    await nacisnij(root, 'recipe-version-yeast');
    expect(host(root, 'recipe-version-yeast')[0].props.accessibilityState).toMatchObject({ checked: true });
    expect(wiersz(root, 'scale-item-starter')).toEqual([]);
    expect(wiersz(root, 'scale-item-yeast')[0]).toContain('2%');
    expect(tekst(host(root, 'recipe-about')[0])).toContain('Na drożdżach: 2% drożdży świeżych względem mąki.');
    expect(mockPush).not.toHaveBeenCalled();
    expect(tekst(host(root, 'recipe-version')[0])).not.toMatch(/Pro/);
    expect(tekst(doMiski(root))).not.toMatch(/Pro/);
    await nacisnij(root, 'start-bake-btn');
    expect(recepturaPlanu()?.wersja).toBe('drozdze');
  });
});
