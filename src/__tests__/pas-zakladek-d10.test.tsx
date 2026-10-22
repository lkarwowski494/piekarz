/**
 * M3 D10 (decyzja właściciela okiem: „D10: A, pas nocy na każdej zakładce”; makieta roli 04 `d10-A-pas-390`,
 * `d10-320`, `d10-ax5`): Receptury (tytuł i filtry rodzaju na pasie), karta receptury (tytuł, powrót „Receptury”
 * i „Więcej” na pasie), karta zakwasu (nazwa, spirala cyklu i czas od dokarmienia na pasie, „Doktor”), Dziennik
 * (tytuł, „Ostatni wypiek: …”, filtry smaku na pasie). Nagłówek stosu ukryty, pas do samej góry pod paskiem stanu,
 * pasek stanu jasny; filtry działają jak wcześniej; AX5: filtry zawijają, nic nie ucięte; VoiceOver: tytuł →
 * sterowanie → treść.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 34 }),
  };
});
const mockNawigacja = { push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() };
const mockEkrany = new Map<string, Record<string, unknown>>();
jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  Stack.Screen = ({ name, options }: { name?: string; options?: Record<string, unknown> | ((a: { route: { params: object } }) => Record<string, unknown>) }) => {
    mockEkrany.set(name ?? '?', typeof options === 'function' ? options({ route: { params: {} } }) : options ?? {});
    return null;
  };
  return {
    Stack,
    router: mockNawigacja,
    useRouter: () => mockNawigacja,
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { StatusBar, StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import RecepturyLista from '../../app/(tabs)/receptury/index';
import EkranReceptury from '../../app/(tabs)/receptury/receptura';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import RecepturyLayout from '../../app/(tabs)/receptury/_layout';
import ZakwasyLayout from '../../app/(tabs)/zakwasy/_layout';
import DziennikLayout from '../../app/(tabs)/dziennik/_layout';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, getStarters, deleteStarter, saveStarter, saveBakeLog, getBakeLogs, deleteBakeLog } from '../data/sqlite-store';
import { addStarterEntry } from '../data/starter-entries-store';
import { nowyWpis } from '../components/zakwas/useStarterLog';
import { filterMasterRecipes, MASTER_RECIPES } from '../recipes/presets';
import { nazwaReceptury } from '../lib/nazwa-receptury';
import { pokazMenuReceptury } from '../lib/menu-receptury';
import { ostatniWypiekMs, tekstOstatniegoWypieku } from '../lib/ostatni-wypiek';
import { appLocale, formatDate } from '../lib/format';
import { czasSlownie } from '../lib/spirala-etykieta';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { theme } from '../ui/theme';
import { kolory } from '../ui/tokeny';
import { kolorySpirali } from '../components/Spirala';

jest.setTimeout(30000);
const H = 3_600_000;

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const host = (root: renderer.ReactTestInstance, testID: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === testID);
const przycisk = (root: renderer.ReactTestInstance, testID: string) =>
  root.findAll((n) => typeof n.type !== 'string' && n.props.testID === testID && n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function');
const styl = (n: renderer.ReactTestInstance): Record<string, unknown> => (StyleSheet.flatten(n.props.style) ?? {}) as Record<string, unknown>;
const tekstNode = (n: renderer.ReactTestInstance) => [n.props.children].flat(Infinity).join('');
const teksty = (root: renderer.ReactTestInstance) => root.findAllByType(Text).map(tekstNode);

let tree: renderer.ReactTestRenderer | null = null;
async function render(el: React.ReactElement) {
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree!.root;
}

/** Pas obecny: tło `pas`, do samej góry (safe area 47 + odstęp), tytuł nagłówkiem na pasie. */
function sprawdzPas(root: renderer.ReactTestInstance, tytul: string) {
  const pasy = host(root, 'pas-zakladki');
  expect(pasy).toHaveLength(1);
  const pas = pasy[0];
  expect(styl(pas)).toEqual(expect.objectContaining({ backgroundColor: theme.colors.pas, paddingTop: 47 + 4 }));
  const naglowki = pas.findAll((n) => n.type === Text && n.props.accessibilityRole === 'header');
  expect(naglowki.map(tekstNode)).toEqual([tytul]);
  expect(StatusBar.setBarStyle).toHaveBeenCalledWith('light-content', true);
  return pas;
}
/** Kolejność odczytu (drzewo w kolejności VoiceOver): każdy element po poprzednim. */
function kolejnosc(root: renderer.ReactTestInstance, testy: ((n: renderer.ReactTestInstance) => boolean)[]) {
  const wszystkie = root.findAll(() => true);
  const pozycje = testy.map((t) => wszystkie.findIndex(t));
  expect(pozycje.every((p) => p >= 0)).toBe(true);
  expect([...pozycje].sort((a, b) => a - b)).toEqual(pozycje);
}
const naglowek = (n: renderer.ReactTestInstance) => n.type === Text && n.props.accessibilityRole === 'header';
const zId = (id: string) => (n: renderer.ReactTestInstance) => typeof n.type === 'string' && n.props.testID === id;

describe('D10 opcja A: pas nocy na każdej zakładce', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    jest.spyOn(StatusBar, 'setBarStyle').mockImplementation(() => undefined);
    mockEkrany.clear();
    Object.assign(mockOkno, { width: 390, fontScale: 1 });
    _resetMemStore();
    zUprawnieniem();
    await initDatabase();
    for (const s of await getStarters()) await deleteStarter(s.id);
    for (const b of await getBakeLogs()) await deleteBakeLog(b.id);
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
  });

  it('stosy zakładek: nagłówek natywny ukryty na liście receptur, karcie receptury, karcie zakwasu i w Dzienniku; plan i Doktor zakwasu z nagłówkiem', () => {
    for (const L of [RecepturyLayout, ZakwasyLayout, DziennikLayout]) {
      act(() => {
        tree = renderer.create(<L />);
      });
      act(() => tree?.unmount());
    }
    tree = null;
    expect(mockEkrany.get('index')?.headerShown).toBe(false);
    expect(mockEkrany.get('receptura')).toEqual(expect.objectContaining({ headerShown: false, headerBackTitle: 'Receptury' }));
    expect(mockEkrany.get('receptura')?.headerRight).toBeUndefined();
    expect(mockEkrany.get('harmonogram')?.headerShown).not.toBe(false);
    expect(mockEkrany.get('doktor-zakwasu')?.headerShown).not.toBe(false);
  });

  it('Receptury: tytuł i filtry rodzaju na pasie; filtr działa jak wcześniej; kolejność tytuł → filtry → lista', async () => {
    const root = await render(<RecepturyLista />);
    const pas = sprawdzPas(root, 'Receptury');
    expect(host(pas, 'category-filter-rye')).toHaveLength(1);
    expect(host(pas, 'category-filter-all')[0].props.accessibilityState).toEqual({ selected: true });
    kolejnosc(root, [naglowek, zId('category-filter-all'), zId('recipe-list')]);
    // Lista bez drugiego rzędu filtrów
    expect(host(host(root, 'recipe-list')[0], 'category-filter-rye')).toHaveLength(0);
    await act(async () => przycisk(root, 'category-filter-rye')[0].props.onPress());
    await flush();
    expect(host(pas, 'category-filter-rye')[0].props.accessibilityState).toEqual({ selected: true });
    const wiersze = host(root, 'recipe-list')[0].findAll((n) => typeof n.type === 'string' && /^recipe-row-/.test(String(n.props.testID)));
    expect(wiersze.map((w) => w.props.testID)).toEqual(filterMasterRecipes('rye').map((r) => `recipe-row-${r.id}`));
  });

  it('karta receptury: nazwa receptury na pasie, powrót „Receptury” i „Więcej” na pasie z etykietą, cel 44 pt', async () => {
    const root = await render(<EkranReceptury />);
    const pas = sprawdzPas(root, nazwaReceptury(MASTER_RECIPES[0].namePl));
    const wstecz = przycisk(pas, 'pas-wstecz-btn')[0];
    expect(wstecz.props.accessibilityLabel).toBe('Receptury');
    act(() => wstecz.props.onPress());
    expect(mockNawigacja.back).toHaveBeenCalledTimes(1);
    const wiecej = przycisk(pas, 'recipe-more-btn')[0];
    expect(wiecej.props.accessibilityLabel).toBe('Więcej działań: receptura');
    expect(wiecej.props.onPress).toBe(pokazMenuReceptury);
    for (const id of ['pas-wstecz-btn', 'recipe-more-btn']) expect(Number(styl(host(pas, id)[0]).minHeight)).toBeGreaterThanOrEqual(44);
    // Treść receptury pod pasem bez zmian: „Do miski” i 4 akcje
    kolejnosc(root, [naglowek, zId('recipe-actions')]);
    expect(teksty(root)).toContain('Ułóż plan');
  });

  it('karta zakwasu: nazwa, spirala cyklu i czas od dokarmienia na pasie; „Doktor” na pasie otwiera Doktora zakwasu', async () => {
    await saveStarter({ id: 'zyt', name: 'Zakwas żytni', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: Date.now() - 6 * H, feedingRatio: '1:1:1' });
    await addStarterEntry(nowyWpis('zyt', 'feeding', Date.now() - 6 * H));
    const root = await render(<ZakwasScreen />);
    const pas = sprawdzPas(root, 'Zakwas żytni');
    expect(host(pas, 'brand-spiral')).toHaveLength(1);
    const naPasie = teksty(pas).join(' | ');
    expect(naPasie).toContain(`${czasSlownie(360)} od dokarmienia`);
    expect(naPasie).toContain('na blacie, 1:1:1');
    const doktor = przycisk(pas, 'zakwas-doctor-shortcut-btn')[0];
    expect(doktor.props.accessibilityLabel).toBe('Doktor zakwasu');
    act(() => doktor.props.onPress());
    expect(mockNawigacja.push).toHaveBeenCalledWith('/zakwasy/doktor-zakwasu');
    // Karta pod pasem: „Podwoił objętość” i zapis dokarmienia bez zmian, bez drugiej spirali
    expect(host(root, 'brand-spiral')).toHaveLength(1);
    expect(host(root, 'zakwas-podwoil-btn')).toHaveLength(1);
    kolejnosc(root, [naglowek, zId('brand-spiral'), zId('zakwas-karta')]);
  });

  it('karta zakwasu bez zakwasu: tytuł „Zakwasy” na pasie, bez spirali', async () => {
    const root = await render(<ZakwasScreen />);
    const pas = sprawdzPas(root, 'Zakwasy');
    expect(host(pas, 'brand-spiral')).toHaveLength(0);
    expect(przycisk(pas, 'zakwas-doctor-shortcut-btn')).toHaveLength(1);
  });

  it('Dziennik: tytuł, „Ostatni wypiek: …” i filtry smaku na pasie; filtr działa jak wcześniej', async () => {
    const ostatni = Date.UTC(2026, 9, 19, 8);
    await saveBakeLog({ id: 'b1', recipeName: 'Focaccia', startedAt: Date.UTC(2026, 9, 12, 8), finishedAt: Date.UTC(2026, 9, 12, 14), tasteProfile: 'mild' });
    await saveBakeLog({ id: 'b2', recipeName: 'Wiejski', startedAt: ostatni, finishedAt: ostatni + 6 * H, tasteProfile: 'sour' });
    const root = await render(<DziennikScreen />);
    const pas = sprawdzPas(root, 'Dziennik');
    const data = formatDate(ostatni, appLocale(), { weekday: 'long', day: 'numeric', month: 'long' });
    expect(teksty(pas)).toContain(`Ostatni wypiek: ${data}`);
    expect(host(pas, 'filter-taste-sour')).toHaveLength(1);
    kolejnosc(root, [naglowek, zId('filter-taste-all'), zId('bake-log-card-b2')]);
    await act(async () => przycisk(root, 'filter-taste-sour')[0].props.onPress());
    await flush();
    expect(host(root, 'bake-log-card-b2')).toHaveLength(1);
    expect(host(root, 'bake-log-card-b1')).toHaveLength(0);
  });

  it('Dziennik pusty: tytuł na pasie, bez zdania o ostatnim wypieku i bez filtrów', async () => {
    const root = await render(<DziennikScreen />);
    const pas = sprawdzPas(root, 'Dziennik');
    expect(teksty(pas).join(' ')).not.toContain('Ostatni wypiek');
    expect(host(pas, 'pas-filtry')).toHaveLength(0);
  });

  it.each([320, 390])('AX5 przy %i pt: pas rośnie, filtry zawijają się, cel 44 pt, żaden tekst na pasie nie jest ucinany', async (szer) => {
    Object.assign(mockOkno, { width: szer, fontScale: 3.12 });
    await saveBakeLog({ id: 'b1', recipeName: 'Wiejski', startedAt: Date.UTC(2026, 9, 19, 8), finishedAt: Date.UTC(2026, 9, 19, 14) });
    for (const el of [<RecepturyLista key="r" />, <DziennikScreen key="d" />]) {
      const root = await render(el);
      const pas = host(root, 'pas-zakladki')[0];
      expect(styl(pas).height).toBeUndefined();
      const filtry = host(pas, 'pas-filtry')[0];
      expect(styl(filtry)).toEqual(expect.objectContaining({ flexDirection: 'row', flexWrap: 'wrap' }));
      const chipy = filtry.findAll((n) => typeof n.type === 'string' && n.props.accessibilityRole === 'button');
      expect(chipy.length).toBeGreaterThanOrEqual(5);
      for (const c of chipy) expect(Number(styl(c).minHeight)).toBeGreaterThanOrEqual(44);
      for (const tx of pas.findAllByType(Text)) {
        expect(tx.props.numberOfLines).toBeUndefined();
        expect(tx.props.adjustsFontSizeToFit).toBeUndefined();
      }
      act(() => tree?.unmount());
      tree = null;
    }
  });
});

describe('D10: Spirala cyklu zakwasu na pasie tylko z tokenów pasa (D-105)', () => {
  it('na pasie: zrobione ratanNaPasie, przed nami i noc naPasie2, postęp naPasie, środek znacznika pas; poza pasem paleta bez zmian', () => {
    const p = kolory.ciemny;
    expect(kolorySpirali(p, true)).toEqual({ ratan: p.ratanNaPasie, ratanSzary: p.naPasie2, nocDane: p.naPasie2, tusz: p.naPasie, tlo: p.pas });
    expect(kolorySpirali(p, false)).toEqual({ ratan: p.ratan, ratanSzary: p.ratanSzary, nocDane: p.nocDane, tusz: p.tusz, tlo: p.tlo });
  });
});

describe('D10: zdanie „Ostatni wypiek” z Dziennika (czysta funkcja)', () => {
  it('najpóźniejszy początek wypieku; pusty Dziennik = brak (null), bez zgadywanej daty', () => {
    expect(ostatniWypiekMs([])).toBeNull();
    expect(ostatniWypiekMs([{ startedAt: 5 }, { startedAt: 9 }, { startedAt: 7 }])).toBe(9);
  });
  it('tekst z datą w języku aplikacji; brak wypieku = brak zdania', () => {
    const ms = Date.UTC(2026, 9, 19, 8);
    expect(tekstOstatniegoWypieku(null)).toBeNull();
    expect(tekstOstatniegoWypieku(ms)).toBe(`Ostatni wypiek: ${formatDate(ms, appLocale(), { weekday: 'long', day: 'numeric', month: 'long' })}`);
  });
});
