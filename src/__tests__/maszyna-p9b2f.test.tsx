/**
 * p9b2f: poprawki trybu maszyny po 06m i przeglądzie p9b-2 — P9B2F-1 (MAS-085: przy programie „ciasto” bez „Gotowe o”),
 * P9B2F-2 (MAS-086/OP-65: „Ustaw opóźniony start na {czas}” = czas od teraz do gotowości), P9B2F-3 („Zapisz plan”
 * liczy od chwili stuknięcia), P9B2F-4 (domyślne „Gotowe o” przelicza się po zmianie czasu programu) [M3 p9b2f].
 * Zegar: tylko Date (fake timers bez timerów), żeby baza i act() działały normalnie.
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
const mockPush = jest.fn();
const mockNavigate = jest.fn();
jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const Stack = ({ children }: { children: React.ReactNode }) => ReactMod.createElement(ReactMod.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    useRouter: () => ({ push: mockPush, navigate: mockNavigate, setParams: jest.fn(), replace: jest.fn(), back: jest.fn() }),
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
import { initDatabase, _resetMemStore, setActiveBake } from '../data/sqlite-store';
import { getAppSetting, setAppSetting } from '../data/settings-store';
import { loadPlannedBakes } from '../data/bake-sessions-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { clearPendingRecipeToLoad, setPendingRecipeToLoad } from '../lib/recipe-navigation';
import { ustawRecepturePlanu } from '../lib/plan-receptury';
import { CATALOG_RECIPES } from '../recipes/katalog';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { setLang } from '../lib/i18n';
import { formatTime } from '../lib/format';
import { czasTrwania } from '../lib/czas-trwania';
import { startProgramu } from '../core/maszyna';

jest.setTimeout(30000);

const MASZYNA = '{"v":1,"makaMaxG":620,"ciastoMaxG":1000,"drozdzeSucheMaxG":10,"uklad":"plyny_najpierw","czasProgramuMin":190}';
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
  await act(async () => {
    root.findAll((n) => n.props.testID === id && typeof n.props.onPress === 'function')[0].props.onPress();
  });
  await settle();
};
const wpisz = async (root: renderer.ReactTestInstance, id: string, v: string) => {
  const pole = host(root, id)[0];
  await act(async () => {
    pole.props.onFocus?.();
    pole.props.onChangeText(v);
  });
  await act(async () => {
    host(root, id)[0].props.onBlur?.({});
  });
  await settle();
};


const T0 = new Date(2026, 10, 4, 10, 0, 0).getTime();
const MIN = 60_000;
const TYLKO_DATE = ['hrtime', 'nextTick', 'performance', 'queueMicrotask', 'requestAnimationFrame', 'cancelAnimationFrame', 'requestIdleCallback', 'cancelIdleCallback', 'setImmediate', 'clearImmediate', 'setInterval', 'clearInterval', 'setTimeout', 'clearTimeout'] as const;
const MASZYNA_BEZ_CZASU = '{"v":1,"makaMaxG":620,"ciastoMaxG":1000,"drozdzeSucheMaxG":10,"uklad":"plyny_najpierw","czasProgramuMin":null}';

describe('p9b2f: tryb maszyny, poprawki po 06m i przeglądzie', () => {
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
    jest.useFakeTimers({ now: T0, doNotFake: [...TYLKO_DATE] });
    useTempDbDir();
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    clearPendingRecipeToLoad();
    ustawRecepturePlanu(null);
    mockPush.mockClear();
    mockNavigate.mockClear();
    await initDatabase();
  });
  afterEach(() => {
    zamknij();
    ustawRecepturePlanu(null);
    jest.useRealTimers();
  });

  it('P9B2F-1 (MAS-085): program „ciasto” bez składników psujących (ciabatta) → bez „Gotowe o”, zdanie o braku opóźnienia, start teraz', async () => {
    await setAppSetting('maszyna', MASZYNA);
    const root = await otworz('ciabatta_con_biga');
    await nacisnij(root, 'recipe-tryb-machine');
    expect(tekst(host(root, 'karta-program')[0])).toContain('ciasto');
    expect(host(root, 'maszyna-gotowe').length).toBe(0);
    expect(host(root, 'maszyna-opoznienie-blokada').length).toBe(0);
    const zdanie = tekst(host(root, 'maszyna-opoznienie-ciasto')[0]);
    expect(zdanie).toContain('Według czterech z pięciu przeczytanych instrukcji opóźniony start nie działa albo nie jest zalecany w programie samego ciasta');
    const start = tekst(host(root, 'maszyna-start')[0]);
    expect(start).toContain(`Program rusza o ${formatTime(T0)}.`);
    expect(start).not.toContain('Ustaw opóźniony start');
  });

  it('P9B2F-1: program inny niż „ciasto” (chleb) zachowuje „Gotowe o”; zdania o ciaście tam nie ma', async () => {
    await setAppSetting('maszyna', MASZYNA);
    const root = await otworz('white_pan_loaf');
    await nacisnij(root, 'recipe-tryb-machine');
    expect(host(root, 'maszyna-gotowe').length).toBe(1);
    expect(host(root, 'maszyna-opoznienie-ciasto').length).toBe(0);
  });

  it('P9B2F-2 (MAS-086, OP-65): wektor — gotowość jutro 7:00, program 3 h 10 min, teraz 22:00 → start 3:50, w maszynie wpisujesz 9 h (czas od teraz do gotowości)', () => {
    const teraz = new Date(2026, 10, 4, 22, 0, 0).getTime();
    const gotowe = new Date(2026, 10, 5, 7, 0, 0).getTime();
    const w = startProgramu(gotowe, 190, teraz);
    expect(w).toEqual({ ok: true, startMs: new Date(2026, 10, 5, 3, 50, 0).getTime(), doGotowosciMin: 540 });
    expect(czasTrwania(540).tekst).toBe(czasTrwania(9 * 60).tekst);
  });

  it('P9B2F-2: ekran — „Ustaw opóźniony start na {czas do gotowości}.” (teraz 10:00, program 190 min → gotowe 13:30 → 3 h 30 min), bez „Od teraz do gotowości”', async () => {
    await setAppSetting('maszyna', MASZYNA);
    const root = await otworz('white_pan_loaf');
    await nacisnij(root, 'recipe-tryb-machine');
    const start = tekst(host(root, 'maszyna-start')[0]);
    expect(start).toContain(`Ustaw opóźniony start na ${czasTrwania(210).tekst}.`);
    expect(start).toContain(`Program rusza o ${formatTime(T0 + 20 * MIN)}.`);
    expect(start).not.toContain('Od teraz do gotowości');
  });

  it('P9B2F-3: „Zapisz plan” bez opóźnienia (chałka) liczy start z chwili stuknięcia, nie z ostatniego renderu', async () => {
    await setAppSetting('maszyna', MASZYNA);
    const root = await otworz('sweet_chalka');
    await nacisnij(root, 'recipe-tryb-machine');
    jest.setSystemTime(T0 + 30 * MIN);
    await nacisnij(root, 'maszyna-zapisz-plan');
    const [p] = await loadPlannedBakes();
    expect(p.plannedStartAt).toBe(T0 + 30 * MIN);
    expect((p.steps[0].plannedEnd ?? 0) - (p.steps[0].plannedStart ?? 0)).toBe(190 * MIN);
  });

  it('P9B2F-3: gotowość wybrana na ekranie, ale start wypadł już w przeszłość → plan nie zapisuje się, ekran pokazuje „Program nie zdąży”', async () => {
    await setAppSetting('maszyna', MASZYNA);
    const root = await otworz('white_pan_loaf');
    await nacisnij(root, 'recipe-tryb-machine');
    jest.setSystemTime(T0 + 30 * MIN); // gotowe 13:30 − 190 min = start 10:20, a jest 10:30
    await nacisnij(root, 'maszyna-zapisz-plan');
    expect((await loadPlannedBakes()).length).toBe(0);
    expect(mockNavigate).not.toHaveBeenCalled();
    expect(host(root, 'maszyna-za-wczesnie').length).toBe(1);
  });

  it('P9B2F-4: domyślne „Gotowe o” przelicza się po wpisaniu czasu programu, dopóki użytkownik go nie zmienił', async () => {
    await setAppSetting('maszyna', MASZYNA_BEZ_CZASU);
    const root = await otworz('white_pan_loaf');
    await nacisnij(root, 'recipe-tryb-machine');
    const o = (h: number, m: number) => `Dziś ${formatTime(new Date(2026, 10, 4, h, m, 0).getTime())}`;
    await wpisz(root, 'maszyna-czas', '250');
    expect(tekst(host(root, 'maszyna-gotowe')[0])).toContain(o(14, 30)); // 10:00 + 250 min = 14:10 → w górę do 14:30
    await wpisz(root, 'maszyna-czas', '190');
    expect(tekst(host(root, 'maszyna-gotowe')[0])).toContain(o(13, 30));
    // Użytkownik zmienia „Gotowe o” (+30 min): od teraz nie przeliczamy
    const plus = root.findAll((n) => n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function' && tekst(n).includes('+30'))[0];
    await act(async () => plus.props.onPress());
    expect(tekst(host(root, 'maszyna-gotowe')[0])).toContain(o(14, 0));
    await wpisz(root, 'maszyna-czas', '300');
    expect(tekst(host(root, 'maszyna-gotowe')[0])).toContain(o(14, 0));
  });
});
