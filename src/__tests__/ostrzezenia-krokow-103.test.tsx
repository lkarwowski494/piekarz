/**
 * M1-audytor-generalny-103 (BR-ETAP-004, F-57, RD-22, RD-23, ER-42): kroki z gorącym naczyniem i surowym ciastem
 * pokazują Ostrzeżenie (komponent systemu: ostrzTlo/ostrzTusz, ikona, tytuł, tekst, role=alert); krok nieznanego
 * rodzaju ma ostrzeżenie zamiast ciszy (RD-22-W4, w czasie wypieku także RD-23-W4). Test dla każdego rodzaju kroku
 * z kodu: oczekiwane zdania według tabeli 103 roli 06 (docs/tresci/pl/ostrzezenia-krokow.md, wypiek-bezpieczenstwo.md).
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
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
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import { StrefaKroku } from '../components/stolnica/StrefaKroku';
import { ostrzezeniaKroku, wTrakcieWypieku } from '../core/ostrzezenia-kroku';
import { DEFAULT_STAGE_TEMPLATES, type StageCategory } from '../scheduler/reverse-scheduler';
import { RYE_STAGE_TEMPLATES } from '../core/rye-stages';
import type { SessionStep } from '../core/bake-steps';
import type { DutchOvenBakePhase } from '../core/baking-phases';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { koloryMotywu } from '../ui/motyw';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

// Zdania z docs/tresci (przegląd człowieka w rejestrze: BEZ-OPA-003/004/005, BEZ-SUR-001/002, ZAK-SUR-001)
const ZAKWAS = ['Nie próbuj surowego zakwasu ani mąki.', 'Po pracy z mąką i zakwasem umyj ręce mydłem pod bieżącą wodą.'];
const CIASTO = ['Nie próbuj surowego ciasta ani mąki.', 'Po pracy z ciastem umyj ręce mydłem pod bieżącą wodą.'];
const GORACE = 'Gorący garnek, pokrywkę i formę chwytaj suchymi rękawicami kuchennymi albo łapkami.';
const DZIECI = 'Dzieci trzymaj z dala od kuchenki i miejsca, w którym pracujesz.';
const NIEZNANY = 'Jeśli w tym kroku pracujesz z surową mąką, ciastem albo zakwasem, nie próbuj ich, a potem umyj ręce mydłem pod bieżącą wodą.';

/** Tabela 103 roli 06: rodzaj kroku z kodu → oczekiwane zdania (pusta lista = brak ostrzeżenia). */
const OCZEKIWANE: Record<string, string[]> = {
  starter_feed: ZAKWAS, rye_starter: ZAKWAS,
  mix: [], rye_mix: [], // zdania BEZ-SUR są już w instrukcji kroku (RD-22-W1)
  autolyse: CIASTO, bulk_ferment: CIASTO, pre_shape: CIASTO, final_shape: CIASTO, rye_shape: CIASTO,
  lid_off: [], // zdanie BEZ-OPA-001..003 w banerze zdjęcia pokrywki (RD-23-W1)
  preheat_oven: [GORACE, DZIECI], bake: [GORACE, DZIECI], lid_on: [GORACE, DZIECI], rye_bake: [GORACE, DZIECI],
  cool: [GORACE], rye_cool: [GORACE],
  bench_rest: [], final_proof: [], rye_rest: [], rye_proof: [],
};

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};

const krok = (id: string, category: StageCategory): SessionStep => ({
  id, name: id, category, durationMin: 30, isPassive: false, instructions: '', plannedStart: null, plannedEnd: null,
});
/** Każdy rodzaj kroku z kodu jako krok sesji (fazy garnka: krok bake w danej fazie). */
const RODZAJE: Array<[string, SessionStep, DutchOvenBakePhase | undefined]> = [
  ...DEFAULT_STAGE_TEMPLATES.map((s): [string, SessionStep, undefined] => [s.category, krok(s.category, s.category), undefined]),
  ...RYE_STAGE_TEMPLATES.map((s): [string, SessionStep, undefined] => [s.id, krok(s.id, s.category), undefined]),
  ['lid_on', krok('bake', 'bake'), 'lid_on'],
  ['lid_off', krok('bake', 'bake'), 'lid_off'],
];

function strefa(steps: SessionStep[], idx: number, phase?: DutchOvenBakePhase) {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <StrefaKroku step={steps[idx]} formattedTime="10:00" unitSystem="metric" dutchOvenPhase={phase ?? 'lid_on'} isCompleted={false}
        onSwitchPhase={() => undefined} onStartPhase2AfterSteamAlert={() => undefined} ostrzezenia={ostrzezeniaKroku(steps, idx, phase)} />
    );
  });
  const alerty = tree.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'step-warning' && n.props.accessibilityRole === 'alert');
  const tekst = (n: renderer.ReactTestInstance): string[] =>
    n.findAll((x) => typeof x.type === 'string' && x.props.testID === 'step-warning-text').map((x) => x.children.join(''));
  const wynik = { liczba: alerty.length, zdania: alerty.flatMap(tekst), styl: alerty[0] ? StyleSheet.flatten(alerty[0].props.style) : null };
  act(() => tree.unmount());
  return wynik;
}

describe('103: Ostrzeżenie w kroku według rodzaju kroku (BR-ETAP-004)', () => {
  it('mapa w teście obejmuje każdy rodzaj kroku z kodu', () => {
    expect(RODZAJE.map(([r]) => r).sort()).toEqual(Object.keys(OCZEKIWANE).sort());
  });

  it.each(RODZAJE)('%s: oczekiwane ostrzeżenie (albo brak) w strefie kroku', (rodzaj, step, phase) => {
    const w = strefa([step], 0, phase);
    expect({ rodzaj, zdania: w.zdania }).toEqual({ rodzaj, zdania: OCZEKIWANE[rodzaj] });
    expect(w.liczba).toBe(OCZEKIWANE[rodzaj].length > 0 ? 1 : 0);
    if (w.styl) expect(w.styl.backgroundColor).toBe(koloryMotywu.ostrzTlo);
  });

  it('krok nieznanego rodzaju: ostrzeżenie ogólne zamiast ciszy, w czasie wypieku także gorące naczynie', () => {
    const wlasny = (id: string) => krok(id, id as StageCategory);
    const plan = [krok('mix', 'mix'), wlasny('wlasny_przed'), krok('preheat_oven', 'preheat_oven'), wlasny('wlasny_w_piecu'), krok('cool', 'cool'), wlasny('wlasny_po')];
    expect([1, 3, 5].map((i) => wTrakcieWypieku(plan, i))).toEqual([false, true, false]);
    expect(strefa(plan, 1).zdania).toEqual([NIEZNANY]);
    expect(strefa(plan, 3).zdania).toEqual([NIEZNANY, GORACE]);
    expect(strefa(plan, 5).zdania).toEqual([NIEZNANY]);
  });

  it('prowadzenie: krok dokarmienia zakwasu pokazuje Ostrzeżenie z rolą alert i tytułem', async () => {
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<StolnicaScreen />);
    });
    await act(async () => {
      for (let i = 0; i < 20; i++) await Promise.resolve();
    });
    await act(async () => {
      tree.root.findAll((n) => typeof n.props.onPress === 'function' && textOf(n.props.children).includes('Zacznij wypiek'))[0].props.onPress();
    });
    const alerty = tree.root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'step-warning' && n.props.accessibilityRole === 'alert');
    expect(alerty).toHaveLength(1);
    const teksty = alerty[0].findAll((x) => typeof x.type === 'string' && x.props.testID === 'step-warning-text').map((x) => x.children.join(''));
    expect(teksty).toEqual(ZAKWAS);
    expect(alerty[0].findAll((x) => typeof x.type === 'string' && x.props.testID === 'step-warning-title').map((x) => x.children.join(''))).toEqual(['Bezpieczeństwo']);
    act(() => tree.unmount());
  });
});
