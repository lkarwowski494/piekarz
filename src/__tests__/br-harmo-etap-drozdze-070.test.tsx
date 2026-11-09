/**
 * BR-HARMO-001 i BR-ETAP-001 (docs/brd/wymagania-wypiek.md): scenariusze drożdżowe, które kod spełnia — plan wersji
 * drożdżowej z czasami z receptury, temperatura w kuchni nie zmienia czasów (D-155, D-174), gotowość ciasta
 * na krokach rośnięcia (DRO-MOD-013, DRO-MOD-016). Wpisy „kod blokuje plan bez zakwasu” / „prowadzenie nie istnieje”
 * w scripts/br-wyjatki.json były nieaktualne (07-jakosc-006) [M1-audytor-generalny-070].
 * Bez testu (wpisy „czesciowe”): receptury drożdżowe z katalogu (np. bagietka) nadal nie mają planu, orkisz na drożdżach
 * też nie; krok rośnięcia mówi o wskazówce czasu albo o teście palca, nie o obu.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, getActiveBake, setActiveBake } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { ustawRecepturePlanu } from '../lib/plan-receptury';
import { calculateDoughRecipe } from '../core/domain-rules';
import { formulaWersji } from '../recipes/wersje-drozdzowe';
import { MASTER_RECIPES } from '../recipes/presets';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};
const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
async function render(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree!;
}
async function pressId(tree: renderer.ReactTestRenderer, testID: string): Promise<void> {
  const all = tree.root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
  expect(all.length).toBeGreaterThan(0);
  await act(async () => {
    await all[all.length - 1].props.onPress();
  });
  await flush();
}
async function pressText(tree: renderer.ReactTestRenderer, label: string): Promise<void> {
  const all = tree.root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children) === label);
  expect(all.length).toBeGreaterThan(0);
  await act(async () => {
    await all[all.length - 1].props.onPress();
  });
  await flush();
}
const osCzasu = (tree: renderer.ReactTestRenderer) =>
  tree.root.findAll((n) => typeof n.type === 'string' && n.props?.testID === 'karta-osi-czasu').map((n) => textOf(n.props.children)).join('|').replace(/\s/g, ' ');

const START = new Date(2026, 10, 4, 8, 0).getTime();
const planZ = (id: string, wersja: 'zakwas' | 'drozdze') => {
  const p = MASTER_RECIPES.find((r) => r.id === id)!;
  const recipeFormula = formulaWersji(p.formula, id, wersja);
  ustawRecepturePlanu({ recipeName: p.namePl, recipeId: id, wersja, calculatedRecipe: calculateDoughRecipe(recipeFormula), recipeFormula });
};
const ZAKWAS_TYLKO = 'Plan wypieku jest tylko dla chleba na zakwasie, a ta receptura nie ma zakwasu.';

describe('BR-HARMO-001 i BR-ETAP-001: plan i prowadzenie wersji drożdżowej', () => {
  beforeEach(async () => {
    jest.spyOn(Date, 'now').mockImplementation(() => START);
    _resetMemStore();
    setActiveBake(null);
    await saveBakeSession(null);
    await initDatabase();
    zUprawnieniem();
  });
  afterEach(() => {
    jest.restoreAllMocks();
    ustawRecepturePlanu(null);
  });

  it.each([
    ['graham_bread_honey', ['Mieszanie i wyrabianie', 'Pierwsze rośnięcie', 'Odgazowanie', 'Odpoczynek na desce', 'Kształtowanie', 'Drugie rośnięcie', 'Pieczenie', 'Studzenie na kratce'], ['15 min', '1 h 10 min']],
    ['tartine_high_hydration_80', ['Mieszanie ciasta', 'Pierwsze rośnięcie', 'Odgazowanie', 'Kształtowanie', 'Drugie rośnięcie', 'Pieczenie', 'Studzenie na kratce'], ['8 h', '1 h 30 min']],
  ])('BR-HARMO-001 Plan dla wersji drożdżowej: %s — kroki DRO-MOD-016 z czasami z receptury, bez komunikatu „tylko na zakwasie”', async (id, kroki, czasyRosniecia) => {
    planZ(id, 'drozdze');
    const plan = await render(<HarmonogramScreen />);
    const tekst = textOf(plan.toJSON());
    expect(tekst).not.toContain(ZAKWAS_TYLKO);
    const os = osCzasu(plan);
    let od = 0;
    for (const k of kroki) {
      const i = os.indexOf(k, od);
      expect([k, i >= 0]).toEqual([k, true]);
      od = i + k.length;
    }
    for (const c of czasyRosniecia) expect(os).toContain(c);
    // Ostatni krok kończy się o godzinie z pola „Kiedy chleb ma być gotowy?”
    const pole = plan.root.findAll((n) => typeof n.type === 'string' && n.props?.testID === 'plan-pole-gotowosci').map((n) => textOf(n.props.children)).join('');
    await pressId(plan, 'plan-start-bake-btn');
    act(() => plan.unmount());
    const sesja = getActiveBake()?.steps ?? [];
    expect(sesja.map((k) => k.name)).toEqual(kroki);
    const koniec = new Date(sesja[sesja.length - 1].plannedEnd ?? 0);
    expect(pole).toContain(`${String(koniec.getHours()).padStart(2, '0')}:${String(koniec.getMinutes()).padStart(2, '0')}`);
  });

  it('BR-HARMO-001 Temperatura nie zmienia czasów drożdżowych: 20 °C i 26 °C dają ten sam plan wersji drożdżowej', async () => {
    planZ('graham_bread_honey', 'drozdze');
    const plan = await render(<HarmonogramScreen />);
    await pressText(plan, '20°C');
    const przy20 = osCzasu(plan);
    await pressText(plan, '26°C');
    const przy26 = osCzasu(plan);
    expect(przy20).toContain('1 h 10 min');
    expect(przy26).toBe(przy20);
    act(() => plan.unmount());
  });

  it('BR-HARMO-001 Temperatura nie zmienia czasów drożdżowych: kontrola — plan tej receptury na zakwasie zmienia się z temperaturą', async () => {
    planZ('graham_bread_honey', 'zakwas');
    const plan = await render(<HarmonogramScreen />);
    await pressText(plan, '20°C');
    const przy20 = osCzasu(plan);
    await pressText(plan, '26°C');
    expect(osCzasu(plan)).not.toBe(przy20);
    act(() => plan.unmount());
  });

  // Scenariusz w części, którą kod spełnia: pierwsze rośnięcie mówi, że czas jest wskazówką; drugie rośnięcie
  // (ciasto pszenne) podaje test palca. Żyto: gotowość po powierzchni ciasta (D-256), bez testu palca.
  it('BR-ETAP-001 Gotowość ciasta drożdżowego (część): pierwsze rośnięcie — czas jest wskazówką; drugie rośnięcie — wgłębienie po palcu zostaje', async () => {
    planZ('graham_bread_honey', 'drozdze');
    const plan = await render(<HarmonogramScreen />);
    await pressId(plan, 'plan-start-bake-btn');
    act(() => plan.unmount());
    const tree = await render(<StolnicaScreen />);
    const kroki = getActiveBake()?.steps ?? [];
    const naKroku = async (nazwa: string) => {
      const nr = kroki.findIndex((k) => k.name === nazwa) + 1;
      expect(nr).toBeGreaterThan(0);
      const naglowek = `Krok ${nr} z ${kroki.length}`;
      for (let i = 0; i < 10 && !textOf(tree.toJSON()).includes(naglowek); i++) await pressId(tree, 'next-or-finish-step-btn');
      expect(textOf(tree.toJSON())).toContain(naglowek);
      return textOf(tree.toJSON());
    };
    const pierwsze = await naKroku('Pierwsze rośnięcie');
    expect(pierwsze).toContain('Czasy są wskazówką, bo tempo rośnięcia zależy od składników, siły ciasta, temperatury i wilgotności.');
    const drugie = await naKroku('Drugie rośnięcie');
    expect(drugie).toContain('Ciasto jest gotowe, gdy wgłębienie po naciśnięciu palcem zostaje.');
    act(() => tree.unmount());
  });
});
