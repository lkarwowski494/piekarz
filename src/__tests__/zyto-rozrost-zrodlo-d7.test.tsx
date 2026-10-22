/**
 * Audyt niezależny D-7 (wariant a): w planie żytnim „Rozrost w formie” trwał 840 min (czas lodówki z planu pszennego),
 * a receptura mówi „ok. 3–4 h”, więc plan kazał zaczynać ok. 10 h za wcześnie. Czas rozrostu w formie pochodzi teraz
 * ze źródła szczebla 2: 240 min fermentacji uformowanych kęsów chleba razowego żytniego wyłącznie na zakwasie
 * (ZYT-ETA-007, Litwinek i in. 2022). Koniec rozrostu nadal wyznacza stan ciasta (ZYT-ETA-005); plan wsteczny liczy
 * start od tego czasu, okno snu działa jak dotąd [audyt-niezalezny D-7].
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn() }),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));
jest.mock('react-native-safe-area-context', () => {
  const R = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => R.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import { initDatabase, getActiveBake, setActiveBake, _resetMemStore, getStarters, deleteStarter } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { ustawRecepturePlanu } from '../lib/plan-receptury';
import { calculateDoughRecipe } from '../core/domain-rules';
import { ryeStepsEndingAt, stepsFromSchedule } from '../core/bake-steps';
import { calculateReverseSchedule } from '../scheduler/reverse-scheduler';
import { godzinaBezNocy, krokCzynnyWNocy } from '../lib/plan-bez-nocy';
import { oknoSnu } from '../lib/profile-snu';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { ustawGodzinePlanu } from '../../tests/helpers/plan-godzina';
import { setLang } from '../lib/i18n';

const ROZROST_MIN = 240; // ZYT-ETA-007

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
const button = (root: renderer.ReactTestInstance, label: string) =>
  root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).includes(label))[0];

describe('D-7: rozrost w formie planu żytniego ze źródła (ZYT-ETA-007)', () => {
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    await initDatabase();
  });
  afterEach(() => {
    ustawRecepturePlanu(null);
    jest.useRealTimers();
  });

  it('Harmonogram → Zacznij wypiek: „Rozrost w formie” 240 min, nie 840; start planu liczony od tego czasu', async () => {
    for (const s of await getStarters()) await deleteStarter(s.id);
    jest.useFakeTimers({ now: new Date(2026, 9, 21, 6, 0).getTime(), doNotFake: ['nextTick', 'setImmediate', 'queueMicrotask'] });
    const formula = {
      flours: [{ name: 'Mąka żytnia typ 2000', percentage: 100, type: 'zytnia_2000' }],
      waterPercentage: 78, saltPercentage: 1.8, starterPercentage: 30, starterHydration: 100, targetDoughWeightGrams: 1000,
    };
    ustawRecepturePlanu({ recipeName: 'Żytni', calculatedRecipe: calculateDoughRecipe(formula), recipeFormula: formula });
    let harm: renderer.ReactTestRenderer | null = null;
    await act(async () => { harm = renderer.create(<HarmonogramScreen />); });
    await act(async () => { for (let i = 0; i < 20; i++) await Promise.resolve(); });
    await ustawGodzinePlanu(harm!.root, 'Pojutrze', 23, 30);
    await act(async () => { button(harm!.root, 'Zacznij wypiek').props.onPress(); });
    act(() => harm!.unmount());

    const kroki = getActiveBake()!.steps!;
    const rozrost = kroki.find((s) => s.id === 'rye_proof')!;
    expect(rozrost.durationMin).toBe(ROZROST_MIN);
    expect(rozrost.plannedEnd! - rozrost.plannedStart!).toBe(ROZROST_MIN * 60_000);
    const gotowe = new Date(2026, 9, 23, 23, 30).getTime();
    expect(kroki[kroki.length - 1].plannedEnd).toBe(gotowe);
    const suma = kroki.reduce((s, k) => s + (k.durationMin ?? 0), 0);
    expect(kroki[0].plannedStart).toBe(gotowe - suma * 60_000);
    for (let i = 1; i < kroki.length; i++) expect(kroki[i].plannedStart).toBe(kroki[i - 1].plannedEnd);
  });

  it('czas rozrostu nie zależy od czasu lodówki planu pszennego (coldRetardHours)', () => {
    const cel = new Date(2026, 9, 23, 23, 30).getTime();
    for (const coldRetardHours of [0, 10, 14]) {
      const plan = stepsFromSchedule(calculateReverseSchedule(new Date(cel), { ambientTemperatureC: 23, coldRetardHours }));
      expect(ryeStepsEndingAt(plan, cel).find((s) => s.id === 'rye_proof')?.durationMin).toBe(ROZROST_MIN);
    }
  });

  it('okno snu: najbliższa godzina bez kroku czynnego w nocy liczy się z rozrostem 240 min', () => {
    const okno = oknoSnu('standard')!;
    const kroki = (celMs: number) =>
      ryeStepsEndingAt(stepsFromSchedule(calculateReverseSchedule(new Date(celMs), { ambientTemperatureC: 23 })), celMs);
    // Cel 07:00: formowanie (krok czynny) przed rozrostem 240 min i wypiekiem wypada w nocy
    const od = new Date(2026, 9, 23, 7, 0).getTime();
    expect(krokCzynnyWNocy(kroki(od), okno)).toBe(true);
    const bezNocy = godzinaBezNocy(od, kroki, okno);
    expect(bezNocy).not.toBeNull();
    const plan = kroki(bezNocy!);
    expect(krokCzynnyWNocy(plan, okno)).toBe(false);
    expect(plan.find((s) => s.id === 'rye_proof')?.durationMin).toBe(ROZROST_MIN);
  });
});
