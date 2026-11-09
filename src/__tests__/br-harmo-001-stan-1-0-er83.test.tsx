/**
 * BR-HARMO-001 w stanie 1.0 po D-312 pkt 3 (ER-83, docs/brd/wymagania-wypiek.md): scenariusze, które wpis „czesciowe”
 * w scripts/br-wyjatki.json opisywał jako bez testu z ID [07-przek-1; ER-83, D-312].
 * - „Receptura drożdżowa z katalogu w 1.0”: chałka, bagietka, pizza — „Ułóż plan” nieaktywne z powodem D-3
 *   (powodBezZakwasu, src/lib/plan-receptury.ts); plan dla nich: backlog 1.0.1.
 * - „Wersja drożdżowa bez podziału czasu na etapy”: orkisz na drożdżach (DRO-WER-SP-001: 3 h bez podziału) —
 *   „Ułóż plan” nieaktywne z powodem D-257; na zakwasie aktywne (kontrola).
 * - „Plan dla wersji drożdżowej”, chleb żytni 100% w formie (src/recipes/yeast-stages.ts): kroki i czasy ze źródła
 *   ZYT-DRO-002 (Koistinen i in., Sci. Rep. 2018, Tabela 3: odpoczynek 60 min, garowanie 60 min, pieczenie 10 min
 *   w 240 °C + 35 min w 220 °C), bez wyrabiania i odgazowania (D-256), ostatni krok kończy się o godzinie „gotowe”.
 * Wyrocznia tekstów: zdania dosłownie z kryteriów BRD; wyrocznia czasów: rejestr roli 06 (docs/tresci/rejestr.json).
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
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { initDatabase, setActiveBake, _resetMemStore, getActiveBake } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { clearPendingRecipeToLoad, setPendingRecipeToLoad } from '../lib/recipe-navigation';
import { ustawRecepturePlanu } from '../lib/plan-receptury';
import { calculateDoughRecipe } from '../core/domain-rules';
import { formulaWersji } from '../recipes/wersje-drozdzowe';
import { MASTER_RECIPES } from '../recipes/presets';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang } from '../lib/i18n';

jest.setTimeout(20000);

const BEZ_ZAKWASU = 'Plan wypieku jest tylko dla chleba na zakwasie, a ta receptura nie ma zakwasu.';
const BEZ_PODZIALU = 'Plan dla tej receptury na drożdżach czeka na czasy etapów. Ilości i wskazówki są wyżej.';
const START = new Date(2026, 10, 9, 8, 0).getTime();

const host = (root: renderer.ReactTestInstance, id: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const tekst = (n: renderer.ReactTestInstance): string =>
  n.findAll((c) => (c.type as unknown) === 'Text')
    .map((c) => (Array.isArray(c.props.children) ? c.props.children.join('') : String(c.props.children)))
    .join(' ');
const settle = async () => {
  await act(async () => {
    for (let i = 0; i < 20; i++) await new Promise((r) => setImmediate(r));
  });
};
const nacisnij = async (root: renderer.ReactTestInstance, id: string) => {
  const all = root.findAll((n) => n.props.testID === id && typeof n.props.onPress === 'function');
  expect([id, all.length > 0]).toEqual([id, true]);
  await act(async () => {
    await all[all.length - 1].props.onPress();
  });
  await settle();
};

describe('BR-HARMO-001 w stanie 1.0 (ER-83, D-312 pkt 3)', () => {
  let tree: renderer.ReactTestRenderer | null = null;
  const otworz = async (id: string) => {
    const p = MASTER_RECIPES.find((r) => r.id === id)!;
    expect(p).toBeDefined();
    setPendingRecipeToLoad({ id: p.id, name: p.namePl, formula: p.formula, targetDDT: p.targetDDT });
    await act(async () => {
      tree = renderer.create(<EkranReceptury />);
    });
    await settle();
    return tree!.root;
  };
  /** Stan „Ułóż plan”: nieaktywny?, tekst obszaru akcji; naciśnięcie nie otwiera planu, gdy nieaktywny. */
  const ulozPlan = async (root: renderer.ReactTestInstance) => {
    const btn = host(root, 'start-bake-btn')[0];
    const stan = { nieaktywny: btn.props.accessibilityState?.disabled === true, powod: tekst(host(root, 'recipe-actions')[0]) };
    mockPush.mockClear();
    await nacisnij(root, 'start-bake-btn');
    return { ...stan, otworzyl: mockPush.mock.calls.some((c) => c[0] === '/receptury/harmonogram') };
  };

  beforeEach(async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => START);
    useTempDbDir();
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    clearPendingRecipeToLoad();
    ustawRecepturePlanu(null);
    mockPush.mockClear();
    await initDatabase();
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    ustawRecepturePlanu(null);
    jest.restoreAllMocks();
  });

  it.each(['sweet_chalka', 'baguette_tradition_poolish', 'pizza_napoletana_48h'])(
    'BR-HARMO-001 Receptura drożdżowa z katalogu w 1.0: %s — „Ułóż plan” nieaktywne z powodem „Plan wypieku jest tylko dla chleba na zakwasie…”',
    async (id) => {
      const root = await otworz(id);
      expect(host(root, 'recipe-version-yeast')).toHaveLength(0); // bez wersji na zakwasie: nie ma przełącznika wersji
      const r = await ulozPlan(root);
      expect(r).toEqual({ nieaktywny: true, powod: expect.stringContaining(BEZ_ZAKWASU), otworzyl: false });
    },
  );

  it('BR-HARMO-001 Wersja drożdżowa bez podziału czasu na etapy: orkisz na drożdżach — „Ułóż plan” nieaktywne z powodem D-257; na zakwasie aktywne', async () => {
    const root = await otworz('spelt_ancient_seeded');
    const naZakwasie = await ulozPlan(root);
    expect(naZakwasie.nieaktywny).toBe(false);
    expect(naZakwasie.powod).not.toContain(BEZ_PODZIALU);
    await nacisnij(root, 'recipe-version-yeast');
    const r = await ulozPlan(root);
    expect(r).toEqual({ nieaktywny: true, powod: expect.stringContaining(BEZ_PODZIALU), otworzyl: false });
    expect(r.powod).not.toContain(BEZ_ZAKWASU);
  });

  it('BR-HARMO-001 Plan dla wersji drożdżowej: chleb żytni 100% w formie — kroki i czasy ZYT-DRO-002, bez komunikatu „tylko na zakwasie”, koniec o godzinie „gotowe”', async () => {
    const p = MASTER_RECIPES.find((r) => r.id === 'rye_100_pan')!;
    const recipeFormula = formulaWersji(p.formula, p.id, 'drozdze');
    ustawRecepturePlanu({ recipeName: p.namePl, recipeId: p.id, wersja: 'drozdze', calculatedRecipe: calculateDoughRecipe(recipeFormula), recipeFormula });
    await act(async () => {
      tree = renderer.create(<HarmonogramScreen />);
    });
    await settle();
    const root = tree!.root;
    expect(host(root, 'plan-start-bake-btn')[0].props.accessibilityState?.disabled).not.toBe(true);
    expect(tekst(root)).not.toContain(BEZ_ZAKWASU);
    const pole = host(root, 'plan-pole-gotowosci').map(tekst).join(' ');
    await nacisnij(root, 'plan-start-bake-btn');
    const kroki = getActiveBake()?.steps ?? [];
    const min = (nazwa: string) => {
      const k = kroki.find((s) => s.name === nazwa);
      return k ? ((k.plannedEnd ?? 0) - (k.plannedStart ?? 0)) / 60_000 : null;
    };
    // Kolejność DRO-MOD-016 bez wyrabiania i odgazowania (ciasto żytnie, D-256)
    expect(kroki.map((k) => k.name).filter((n) => n !== 'Studzenie na kratce')).toEqual(['Mieszanie ciasta', 'Pierwsze rośnięcie', 'Podział i formowanie', 'Drugie rośnięcie', 'Pieczenie']);
    // ZYT-DRO-002: odpoczynek 60 min, garowanie 60 min, pieczenie 10 + 35 min
    expect({ pierwsze: min('Pierwsze rośnięcie'), drugie: min('Drugie rośnięcie'), pieczenie: min('Pieczenie') }).toEqual({ pierwsze: 60, drugie: 60, pieczenie: 45 });
    const koniec = new Date(kroki[kroki.length - 1].plannedEnd ?? 0);
    expect(pole).toContain(`${String(koniec.getHours()).padStart(2, '0')}:${String(koniec.getMinutes()).padStart(2, '0')}`);
  });
});
