/**
 * M1-audytor-generalny-096 (DEC-06 b, D-044, F-38; design-spec §7): w trybie „uncje, °F” żaden ekran z temperaturą
 * albo masą, arkusz, okno ani eksport tekstowy nie pokazuje °C ani gramów bez przeliczenia.
 * Render każdego ekranu z temperaturą/masą w trybie imperialnym → w drzewie brak „°C” i liczby z „g”/„kg”.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import * as Clipboard from 'expo-clipboard';
import CalculatorScreen from '../../app/(tabs)/receptury/receptura';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import StolnicaScreen from '../../app/stolnica';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import DoktorScreen from '../../app/doktor';
import DzisScreen from '../../app/(tabs)/(dzis)/index';
import { SettingsModal } from '../components/SettingsModal';
import { DiscardRecipesModal } from '../components/DiscardRecipesModal';
import { StarterConverterModal } from '../components/StarterConverterModal';
import { ShareRecipeQrModal } from '../components/ShareRecipeQrModal';
import { AccordionDdtSection } from '../components/calculator/accordion/AccordionDdtSection';
import { DoMiskiScaleCard } from '../components/calculator/DoMiskiScaleCard';
import { initDatabase, setActiveBake, getActiveBake, getStarters, saveStarter, saveBakeLog, deleteStarter, _resetMemStore, setAppSetting } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { setUnitSystem, _resetUnitSystemForTests } from '../lib/unit-converter';
import { copyScheduleToClipboard } from '../lib/schedule-formatter';
import { copyFeedingToClipboard } from '../lib/feeding-formatter';
import { calculateReverseSchedule } from '../scheduler/reverse-scheduler';
import { MASTER_RECIPES } from '../recipes/presets';
import { setLang } from '../lib/i18n';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

jest.setTimeout(30000);
jest.mock('../lib/wejscia-pozniej', () => ({ wejscieWidoczne: () => true }));
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-router', () => ({
  Stack: { Screen: ({ options }: { options?: { headerRight?: () => React.ReactElement } }) => (options?.headerRight ? options.headerRight() : null) },
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
  useLocalSearchParams: () => ({}),
  useFocusEffect: (cb: () => void) => require('react').useEffect(cb, []),
}));
jest.mock('react-native-safe-area-context', () => {
  const R = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => R.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

/** Liczba z gramami albo kilogramami (nie „5 godzin”), °C w każdej postaci. */
const METRYCZNE = /°C|\d\s?k?g(?![A-Za-z])/;

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join(' ');
  if (n && typeof n === 'object' && 'children' in n) return textOf((n as { children: unknown }).children);
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};
/** Fragmenty z jednostką metryczną (z kontekstem do raportu). */
const metryczne = (text: string): string[] => {
  const out: string[] = [];
  const re = new RegExp(METRYCZNE.source, 'g');
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) out.push(text.slice(Math.max(0, m.index - 30), m.index + 6));
  return out;
};

async function render(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(el);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree!;
}
const press = async (tree: renderer.ReactTestRenderer, testID: string) => {
  const el = tree.root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function')[0];
  await act(async () => {
    el.props.onPress();
  });
};

const recipe = {
  targetDoughWeightGrams: 1000, baseFlourWeightGrams: 520, flours: [{ name: 'Bread flour', percentage: 100, weightGrams: 520 }],
  waterGrams: 390, saltGrams: 10, starterGrams: 80, starterFlourGrams: 40, starterWaterGrams: 40, yeastGrams: 0,
  totalFlourGrams: 560, totalWaterGrams: 430, overallHydrationPercent: 76.8, sumCheckGrams: 1000, isHighRye: false,
};

describe.each(['en', 'pl'] as const)('096: tryb „uncje, °F” bez °C i gramów (%s)', (jezyk) => {
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    _resetUnitSystemForTests();
    setActiveBake(null);
    setLang('pl');
    await initDatabase();
    await saveBakeSession(null);
    await setAppSetting('unit_system', 'imperial');
    setUnitSystem('imperial');
    setLang(jezyk);
  });
  afterEach(() => {
    setLang('pl');
    _resetUnitSystemForTests();
  });

  it('Receptury: liczby, Do miski, Mieszanka mąk i zaczyny, arkusz Temperatura wody (BR-UST-001 Uncje i °F do wyświetlania)', async () => {
    const tree = await render(<CalculatorScreen />);
    // Mieszanka mąk i zaczyny: arkusz „Składniki” zamiast akordeonu (§11c 106) [M1-audytor-generalny-106]
    await press(tree, 'edit-ingredients-btn');
    await press(tree, 'water-temp-btn');
    expect(metryczne(textOf(tree.toJSON()))).toEqual([]);
    act(() => tree.unmount());
  });

  it('Plan wypieku: kuchnia 68–79 °F, oś czasu i podpowiedzi', async () => {
    const tree = await render(<HarmonogramScreen />);
    const text = textOf(tree.toJSON());
    expect(metryczne(text)).toEqual([]);
    expect(text).toMatch(/68\s?°F/);
    expect(text).toMatch(/79\s?°F/);
    act(() => tree.unmount());
  });

  it('Zakwasy: karta zakwasu z blatu i z lodówki, dokarmienie, okna', async () => {
    const [first] = await getStarters();
    await saveStarter({ ...first, storageState: 'ROOM_TEMP', lastFedAt: Date.now() - 2 * 3600_000 });
    let tree = await render(<ZakwasScreen />);
    expect(metryczne(textOf(tree.toJSON()))).toEqual([]);
    act(() => tree.unmount());
    await saveStarter({ ...first, storageState: 'FRIDGE' });
    tree = await render(<ZakwasScreen />);
    expect(metryczne(textOf(tree.toJSON()))).toEqual([]);
    act(() => tree.unmount());
  });

  it('Prowadzenie: krok, Plan wypieku ze składnikami', async () => {
    setActiveBake({ id: 'bake_imp', recipeName: 'Wheat 75%', startedAt: Date.now(), currentStageId: 'step_1', ambientTempC: 22, calculatedRecipe: recipe });
    const tree = await render(<StolnicaScreen />);
    const plan = tree.root.findAll((n) => typeof n.props?.onPress === 'function' && /Plan/.test(textOf(n.props.children)))[0];
    if (plan) await act(async () => plan.props.onPress());
    expect(metryczne(textOf(tree.toJSON()))).toEqual([]);
    act(() => tree.unmount());
  });

  it('Dziennik: wpis z temperaturą kuchni i DDT; Doktor; Dziś', async () => {
    await saveBakeLog({ id: 'log1', recipeName: 'Wheat', startedAt: Date.now() - 86400_000, finishedAt: Date.now() - 80000_000, ambientTemp: 22, actualDDT: 25, ratingStars: 4 });
    for (const el of [<DziennikScreen key="d" />, <DoktorScreen key="k" />, <DzisScreen key="s" />]) {
      const tree = await render(el);
      expect(metryczne(textOf(tree.toJSON()))).toEqual([]);
      act(() => tree.unmount());
    }
  });

  it('Ustawienia: jeden wybór „gramy, °C” / „uncje, °F”; poza etykietą wyboru bez °C i gramów', async () => {
    const tree = await render(<SettingsModal visible onClose={() => {}} />);
    const metric = tree.root.findAll((n) => n.props?.testID === 'unit-metric')[0];
    const etykieta = textOf(metric.props.children);
    expect(textOf(tree.root.findAll((n) => n.props?.testID === 'unit-imperial')[0].props.children)).toMatch(/°F/);
    expect(metryczne(textOf(tree.toJSON()).split(etykieta).join(' '))).toEqual([]);
    act(() => tree.unmount());
  });

  it('Okna: przepisy z odrzutem, przelicznik zakwasu, kod QR receptury', async () => {
    for (const el of [
      <DiscardRecipesModal key="d" visible onClose={() => {}} />,
      <StarterConverterModal key="c" visible onClose={() => {}} currentStarterHydration={100} currentStarterName="Rye" />,
      <ShareRecipeQrModal key="q" visible onClose={() => {}} recipe={MASTER_RECIPES[0]} />,
    ]) {
      const tree = await render(el);
      expect(metryczne(textOf(tree.toJSON()))).toEqual([]);
      act(() => tree.unmount());
    }
  });

  it('Wejście w °F i oz zapisuje °C i gramy: DDT o 1 °F, mąka o 2 oz, kuchnia z chipu °F (BR-UST-001: zapis w gramach i °C)', async () => {
    const ddt = jest.fn();
    let tree = await render(<AccordionDdtSection targetDdt={25} onTargetDdtChange={ddt} waterTempTarget={20} />);
    expect(textOf(tree.toJSON())).toContain('77°F');
    await press(tree, 'ddt-plus-btn');
    const c = ddt.mock.calls[0][0] as number;
    expect(c).toBeCloseTo(25.56, 2);
    act(() => tree.unmount());

    const maka = jest.fn();
    tree = await render(
      <DoMiskiScaleCard calculations={recipe} saltPercent={2} recipeName="Wheat" loavesCount={1} onLoavesChange={() => {}} calcMode="flour" flourGrams={500} onFlourGramsChange={maka} />
    );
    const plus = tree.root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children).startsWith('+'))[0];
    await act(async () => plus.props.onPress());
    expect(maka).toHaveBeenCalledWith(557);
    act(() => tree.unmount());

    tree = await render(<HarmonogramScreen />);
    const chip = tree.root.findAll((n) => typeof n.props?.onPress === 'function' && textOf(n.props.children) === '72°F')[0];
    await act(async () => chip.props.onPress());
    await press(tree, 'plan-start-bake-btn');
    expect(getActiveBake()?.ambientTempC).toBe(22);
    act(() => tree.unmount());
  });

  it('Eksport tekstowy: harmonogram i dokarmienie w schowku w °F i oz', async () => {
    const spy = jest.spyOn(Clipboard, 'setStringAsync').mockResolvedValue(true);
    spy.mockClear();
    const schedule = calculateReverseSchedule(new Date(2026, 9, 22, 10, 0), { ambientTemperatureC: 23, coldRetardHours: 14 });
    await copyScheduleToClipboard(schedule, { ambientTempC: 23, coldRetardHours: 14 });
    const [first] = await getStarters();
    await copyFeedingToClipboard(first, { starterGrams: 50, flourGrams: 50, waterGrams: 50, targetYieldGrams: 150 } as Parameters<typeof copyFeedingToClipboard>[1], [1, 1, 1]);
    const teksty = spy.mock.calls.map((c) => String(c[0]));
    expect(teksty).toHaveLength(2);
    for (const s of teksty) expect(metryczne(s)).toEqual([]);
    spy.mockRestore();
  });
});

afterAll(async () => {
  for (const s of await getStarters()) await deleteStarter(s.id);
});
