/**
 * p9b-2: tryb maszyny do chleba na ekranie receptury (F-72, D-138, karty/README.md wiersz D-138, O4 a): segment
 * „Piekarnik / Maszyna do chleba” w karcie „Ile pieczesz”, granice maszyny (BR-MASZ-002), kolejność (BR-MASZ-003),
 * program (BR-MASZ-004), godzina gotowości w Pro i blokada opóźnienia (BR-MASZ-005), bezpieczeństwo (BR-MASZ-006),
 * „Zapisz plan” = zaplanowany wypiek z trybem maszyny (D-242 Z6 a) [M3 p9b2].
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
import { zUprawnieniem, bezUprawnienia } from '../../tests/helpers/platnosci';
import { setLang } from '../lib/i18n';

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

describe('F-72 tryb maszyny na ekranie receptury', () => {
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
  });

  it('BR-MASZ-001: segment w karcie „Ile pieczesz” przy recepturze drożdżowej, domyślnie piekarnik; zakwas bez wersji drożdżowej: bez segmentu', async () => {
    let root = await otworz('country_loaf_72');
    expect(host(root, 'recipe-tryb')).toHaveLength(0);
    zamknij();
    root = await otworz('white_pan_loaf');
    const karta = host(root, 'karta-ile-pieczesz')[0];
    expect(karta.findAll((n) => n.props.testID === 'recipe-tryb')).not.toHaveLength(0);
    expect(tekst(host(root, 'recipe-tryb')[0])).toBe('Piekarnik Maszyna do chleba');
    expect(host(root, 'recipe-tryb-oven')[0].props.accessibilityState).toMatchObject({ checked: true });
    expect(host(root, 'karta-do-miski')).toHaveLength(1);
  });

  it('BR-MASZ-002 pierwsze użycie: prośba o granicę mąki, bez ilości przed jej wpisaniem (RD-37-W6); po zapisie granice zapamiętane, lista ilości', async () => {
    const root = await otworz('white_pan_loaf');
    await nacisnij(root, 'recipe-tryb-machine');
    expect(host(root, 'maszyna-dane')).toHaveLength(1);
    expect(tekst(host(root, 'maszyna-dane')[0])).toContain('Wpisz z instrukcji swojej maszyny największą ilość mąki');
    expect(host(root, 'karta-kolejnosc')).toHaveLength(0);
    expect(host(root, 'karta-do-miski')).toHaveLength(0);
    await wpisz(root, 'maszyna-maka-max', '620');
    await nacisnij(root, 'maszyna-uklad-plyny');
    await nacisnij(root, 'maszyna-dane-zapisz');
    const zapis = JSON.parse((await getAppSetting('maszyna')) ?? 'null') as Record<string, unknown>;
    expect(zapis).toMatchObject({ v: 1, makaMaxG: 620, ciastoMaxG: null, drozdzeSucheMaxG: null, uklad: 'plyny_najpierw' });
    expect(host(root, 'karta-kolejnosc')).toHaveLength(1);
  });

  it('BR-MASZ-002 W3 i BR-MASZ-003: ilość przycięta do granicy z dopiskiem; płyny najpierw, drożdże na końcu, zdanie o instrukcji', async () => {
    await setAppSetting('maszyna', '{"v":1,"makaMaxG":300,"ciastoMaxG":null,"drozdzeSucheMaxG":null,"uklad":"plyny_najpierw","czasProgramuMin":190}');
    const root = await otworz('white_pan_loaf');
    await nacisnij(root, 'recipe-tryb-machine');
    const karta = tekst(host(root, 'karta-kolejnosc')[0]);
    expect(karta.indexOf('Woda')).toBeLessThan(karta.indexOf('Mąka'));
    expect(karta.indexOf('Mąka')).toBeLessThan(karta.indexOf('Drożdże'));
    expect(karta).toContain('300 g');
    expect(karta).toContain('Kolejność wkładania składników podaje instrukcja Twojej maszyny.');
    expect(karta).toContain('drożdże na wierzch, tak by nie dotykały płynów');
    expect(host(root, 'maszyna-ograniczenie')).toHaveLength(1);
  });

  it('BR-MASZ-003 bez układu: prośba o wybór układu zamiast kolejności', async () => {
    await setAppSetting('maszyna', '{"v":1,"makaMaxG":620,"ciastoMaxG":null,"drozdzeSucheMaxG":null,"uklad":null,"czasProgramuMin":null}');
    const root = await otworz('white_pan_loaf');
    await nacisnij(root, 'recipe-tryb-machine');
    expect(host(root, 'karta-kolejnosc')).toHaveLength(0);
    expect(host(root, 'maszyna-uklad-plyny')).toHaveLength(1);
  });

  it('BR-MASZ-004: podpowiedź programu z dopiskiem „reguła Piekarza”; chałka (poza formą) → ciasto', async () => {
    await setAppSetting('maszyna', MASZYNA);
    let root = await otworz('white_pan_loaf');
    await nacisnij(root, 'recipe-tryb-machine');
    let program = tekst(host(root, 'karta-program')[0]);
    expect(program).toContain('podstawowy');
    expect(program).toContain('Podpowiedź programu to reguła Piekarza, nie zalecenie producenta');
    zamknij();
    root = await otworz('sweet_chalka');
    await nacisnij(root, 'recipe-tryb-machine');
    program = tekst(host(root, 'karta-program')[0]);
    expect(program).toContain('ciasto');
  });

  it('BR-MASZ-005: jajka w recepturze (chałka) → bez godziny gotowości, zdanie blokady z nazwą składnika; chleb bez nich → godzina gotowości i start programu', async () => {
    await setAppSetting('maszyna', MASZYNA);
    let root = await otworz('sweet_chalka');
    await nacisnij(root, 'recipe-tryb-machine');
    expect(host(root, 'maszyna-gotowe')).toHaveLength(0);
    const blokada = tekst(host(root, 'maszyna-opoznienie-blokada')[0]);
    expect(blokada).toContain('Opóźniony start jest wyłączony');
    expect(blokada).toContain('jajka');
    zamknij();
    root = await otworz('white_pan_loaf');
    await nacisnij(root, 'recipe-tryb-machine');
    expect(host(root, 'maszyna-gotowe')).toHaveLength(1);
    expect(host(root, 'maszyna-start')).toHaveLength(1);
  });

  it('BR-MASZ-005 bez Pro: ilości, kolejność i program działają, godzina gotowości pokazuje Pro', async () => {
    bezUprawnienia();
    await setAppSetting('maszyna', MASZYNA);
    const root = await otworz('white_pan_loaf');
    await nacisnij(root, 'recipe-tryb-machine');
    expect(host(root, 'karta-kolejnosc')).toHaveLength(1);
    expect(host(root, 'karta-program')).toHaveLength(1);
    expect(host(root, 'maszyna-gotowe')).toHaveLength(0);
    expect(host(root, 'blokada-plan-wstecz')).toHaveLength(1);
  });

  it('BR-MASZ-001 zakwas z wersją drożdżową: lista z wersji drożdżowej i zdanie o programach na zakwasie; bez przełącznika wersji', async () => {
    await setAppSetting('maszyna', MASZYNA);
    const root = await otworz('graham_bread_honey');
    await nacisnij(root, 'recipe-tryb-machine');
    expect(tekst(host(root, 'maszyna-zakwas')[0])).toContain('programy na zakwasie używają także drożdży piekarskich');
    expect(tekst(host(root, 'karta-kolejnosc')[0])).not.toContain('Zakwas');
    expect(host(root, 'recipe-version')).toHaveLength(0);
  });

  it('BR-MASZ-006: ostrzeżenie bezpieczeństwa z tekstem i rolą alert (nie tylko kolor)', async () => {
    await setAppSetting('maszyna', MASZYNA);
    const root = await otworz('white_pan_loaf');
    await nacisnij(root, 'recipe-tryb-machine');
    const o = host(root, 'maszyna-bezpieczenstwo')[0];
    expect(o.props.accessibilityRole).toBe('alert');
    expect(o.props.accessibilityLabel).toContain('Po pieczeniu formę wyjmuj w rękawicach kuchennych');
  });

  it('„Zapisz plan” (Z6 a): zaplanowany wypiek z trybem maszyny, jeden krok programu z istniejącej kategorii, start = gotowe − czas programu', async () => {
    await setAppSetting('maszyna', MASZYNA);
    const root = await otworz('white_pan_loaf');
    await nacisnij(root, 'recipe-tryb-machine');
    await nacisnij(root, 'maszyna-zapisz-plan');
    const plany = await loadPlannedBakes();
    expect(plany).toHaveLength(1);
    const [p] = plany;
    expect(p.bake?.tryb).toBe('maszyna');
    expect(p.recipeId).toBe('white_pan_loaf');
    expect(p.steps.map((s) => s.category)).toEqual(['bake']);
    expect(p.steps[0].durationMin).toBe(190);
    expect((p.steps[0].plannedEnd ?? 0) - (p.steps[0].plannedStart ?? 0)).toBe(190 * 60_000);
    expect(p.plannedStartAt).toBe(p.steps[0].plannedStart);
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('wybór trybu nie jest zapamiętany (Z5 a): po ponownym otwarciu piekarnik', async () => {
    await setAppSetting('maszyna', MASZYNA);
    let root = await otworz('white_pan_loaf');
    await nacisnij(root, 'recipe-tryb-machine');
    zamknij();
    root = await otworz('white_pan_loaf');
    expect(host(root, 'recipe-tryb-oven')[0].props.accessibilityState).toMatchObject({ checked: true });
    expect(host(root, 'karta-do-miski')).toHaveLength(1);
  });
});
