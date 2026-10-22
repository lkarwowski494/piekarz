/**
 * Ekran „Dziś” 3+1 z kalendarzem 1.0 (M3 D4b; D-105, D-106; makiety roli 04 a2 `a2-03` w31 i `dwa-tory-v2`):
 * pas w kolorze nocy do samej góry (tytuł, data, pasek tygodnia, „Następne”, zaległe z „Zrobione”/„Pomiń”), trzy kafle
 * obok siebie, trwający wypiek jako duża spirala, dwa wypieki = jedna spirala z dwoma torami i legenda kartami.
 * Przypadki: pierwsze uruchomienie, jeden wypiek, dwa wypieki, zaległe karmienie, zaległy krok, arkusz dnia, „+N”,
 * AX5, 320 pt, VoiceOver. BR-KAL-001…007.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 34 }),
  };
});
const mockPush = jest.fn();
const mockNaglowek: { opcje?: Record<string, unknown> } = {};
jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  Stack.Screen = ({ options }: { options?: Record<string, unknown> }) => {
    mockNaglowek.opcje = options;
    return null;
  };
  return {
    Stack,
    useRouter: () => ({ push: mockPush, navigate: mockPush, replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { StatusBar, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Iap from 'expo-iap';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, deleteStarter, getStarters, saveStarter, getAppSetting, setAppSetting, saveBakeLog } from '../data/sqlite-store';
import { KLUCZ_HISTORII_DOSTEPU } from '../lib/platnosci/konfiguracja';
import { saveBakeSession } from '../data/bake-session-store';
import { loadActiveBakeSessionsZWersja } from '../data/bake-sessions-store';
import { KLUCZ_POMINIEC } from '../data/pominiecia-store';
import { planBakeSteps } from '../core/bake-steps';
import { localDateKey } from '../core/dzien-lokalny';
import { _resetStanu } from '../lib/platnosci/stan';
import { setLang } from '../lib/i18n';
import { EN } from '../lib/i18n.en';
import { theme } from '../ui/theme';

const mockIap = (Iap as unknown as { __mock: { reset: () => void; entitlements: Array<Record<string, unknown>> } }).__mock;
const H = 3_600_000;
// Zegar ustawiony na 12:00 (tylko Date; timery i mikrozadania prawdziwe), żeby wynik nie zależał od godziny przebiegu:
// zaległe karmienie sprzed 13 h między 0:00 a 1:00 wypada „z wczoraj” i etykieta ma wtedy datę [M3; wzorzec jak w zakwas-104-ekrany.test.tsx]
const ustawZegar = (godz: number, min: number) => {
  const now = new Date(2026, 9, 21, godz, min, 0, 0).getTime();
  jest.useFakeTimers({
    now,
    doNotFake: ['nextTick', 'setImmediate', 'clearImmediate', 'queueMicrotask', 'setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'hrtime', 'performance'],
  });
  return now;
};

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const host = (root: renderer.ReactTestInstance, testID: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === testID);
const przycisk = (root: renderer.ReactTestInstance, testID: string) =>
  root.findAll((n) => typeof n.type !== 'string' && n.props.testID === testID && typeof n.props.onPress === 'function');
const teksty = (root: renderer.ReactTestInstance) => root.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');
const styl = (n: renderer.ReactTestInstance): Record<string, unknown> => Object.assign({}, ...[n.props.style].flat(Infinity).filter(Boolean));

async function pustaBaza() {
  for (const s of await getStarters()) await deleteStarter(s.id);
}
function zDostepem() {
  mockIap.entitlements = [{ id: 't', transactionId: 't', productId: 'com.apps4brew.baker.pro.lifetime', purchaseState: 'purchased', transactionDate: 1 }];
}
const wypiek = (id: string, nazwa: string, stepIdx: number, timerEndsAt: number | null = null) => {
  const start = Date.now() - 2 * H;
  const steps = planBakeSteps({ startAt: start, isHighRye: false });
  return {
    version: 2 as const, steps, stepIdx, dutchOvenPhase: 'lid_on' as const, timerEndsAt, pausedLeftSec: timerEndsAt === null ? 600 : null,
    recipeName: nazwa, startedAt: start, bake: { id, recipeName: nazwa, startedAt: start, currentStageId: steps[stepIdx].id },
  };
};
/** Zakwas na blacie dokarmiony 13 h temu: termin minął godzinę temu (zaległe, RD-32). */
async function zakwasZalegly() {
  await saveStarter({ id: 'zyt', name: 'Żytni', flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: Date.now() - 13 * H });
}

let tree: renderer.ReactTestRenderer | null = null;
async function renderStart() {
  await act(async () => {
    tree = renderer.create(<AppAccessProvider><StartScreen /></AppAccessProvider>);
  });
  await flush();
  return tree!.root;
}

describe('D4b: „Dziś” 3+1 z kalendarzem 1.0', () => {
  beforeEach(async () => {
    ustawZegar(12, 0);
    jest.clearAllMocks();
    _resetMemStore();
    mockIap.reset();
    _resetStanu();
    Object.assign(mockOkno, { width: 390, fontScale: 1 });
    await initDatabase();
    await saveBakeSession(null);
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    setLang('pl');
    jest.useRealTimers();
  });

  it('BR-KAL-005 Pierwsze uruchomienie: pas z adnotacją (D-105), bez „Następne”, trzy kafle obok siebie, pusta spirala', async () => {
    await pustaBaza();
    const root = await renderStart();
    // Nagłówek stosu ukryty: pas jest treścią ekranu do samej góry, pod paskiem stanu (safe area 47)
    expect(mockNaglowek.opcje?.headerShown).toBe(false);
    const pas = host(root, 'pas-dzis')[0];
    expect(styl(pas)).toEqual(expect.objectContaining({ backgroundColor: theme.colors.pas, paddingTop: 47 + 4 }));
    const txt = teksty(root);
    expect(txt).toContain('Co dziś robisz?');
    expect(txt).toContain('Nic nie mamy w planach');
    expect(txt).toContain('Kalendarz jest pusty. Zapełni się, gdy założysz zakwas albo zaplanujesz wypiek.');
    expect(txt).toContain('Tu pojawi się plan wypieku i tydzień z karmieniami, gdy coś zaczniesz.');
    expect(host(root, 'linia-nastepne')).toHaveLength(0);
    const kafle = host(root, 'start-czynnosci')[0];
    expect(styl(kafle).flexDirection).toBe('row');
    const k = przycisk(root, 'start-zakladam-zakwas').concat(przycisk(root, 'start-pieke-na-zakwasie'), przycisk(root, 'start-pieke-na-drozdzach'));
    expect(k.map((n) => n.props.accessibilityLabel)).toEqual(['Zakładam zakwas', 'Piekę na zakwasie', 'Piekę na drożdżach albo pizzę']);
    expect(k[0].props.accessibilityHint).toBe('Od mąki i wody do pierwszego bochenka, dzień po dniu.');
    // Pasek: 7 dni, dziś w ramce, ustawienia z pasa
    const dni = root.findAll((n) => typeof n.type !== 'string' && typeof n.props.testID === 'string' && n.props.testID.startsWith('pasek-dzien-') && typeof n.props.onPress === 'function');
    expect(dni).toHaveLength(7);
    expect(dni.filter((d) => d.props.accessibilityState?.selected)).toHaveLength(1);
    expect(host(root, 'open-settings-btn')).toHaveLength(1);
  });

  it('BR-KAL-001 Etykieta dla czytnika ekranu: dzień czyta pełną datę, „dziś” i „Nic w planach”', async () => {
    await pustaBaza();
    const root = await renderStart();
    const dzis = przycisk(root, `pasek-dzien-${localDateKey(Date.now())}`)[0];
    expect(dzis.props.accessibilityLabel).toMatch(/, dziś\. Nic w planach$/);
    expect(dzis.props.accessibilityRole).toBe('button');
  });

  it('jeden wypiek: duża spirala pod kaflami, krok i „Wróć do wypieku” do Stolnicy tego wypieku; bez karty „Trwa wypiek”', async () => {
    zDostepem();
    await saveBakeSession(wypiek('bake_chleb', 'Chleb', 3));
    const root = await renderStart();
    const spirala = root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'brand-spiral' && n.props.accessibilityRole === 'image')[0];
    expect(styl(spirala)).toEqual(expect.objectContaining({ width: 220, height: 220 }));
    expect(teksty(root)).not.toContain('Trwa wypiek');
    const wroc = przycisk(root, 'resume-bake-btn');
    expect(wroc.map((w) => w.props.accessibilityLabel)).toEqual(['Wróć do wypieku']);
    await act(async () => wroc[0].props.onPress());
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/stolnica', params: { wypiek: 'bake_chleb' } });
    // Pasek ma znacznik wypieku dziś, linia „Następne” jest
    expect(host(root, 'linia-nastepne')).toHaveLength(1);
  });

  it('BR-KAL-016 Jedna spirala z dwoma torami: dwa tory, legenda kartami POD spiralą z „Wróć do: {receptura}” (44 pt)', async () => {
    zDostepem();
    await saveBakeSession(wypiek('bake_chleb', 'Chleb', 3));
    await saveBakeSession(wypiek('bake_pizza', 'Pizza', 1));
    const root = await renderStart();
    const obrazy = root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'brand-spiral' && n.props.accessibilityRole === 'image');
    expect(obrazy).toHaveLength(1);
    expect(obrazy[0].props.accessibilityLabel).toMatch(/^Tor 1, Chleb: .*\. Tor 2, Pizza: /);
    expect(root.findAll((n) => typeof n.props.testID === 'string' && n.props.testID.startsWith('brand-spiral-tor-2-odcinek-')).length).toBeGreaterThan(0);
    const karty = host(root, 'start-trwa-wypiek');
    expect(karty).toHaveLength(2);
    const wroc = przycisk(root, 'resume-bake-btn');
    expect(wroc.map((w) => w.props.accessibilityLabel)).toEqual(['Wróć do: Chleb', 'Wróć do: Pizza']);
    for (const w of wroc) expect(Number(styl(w).minHeight)).toBeGreaterThanOrEqual(44);
    const txt = teksty(root);
    expect(txt).toMatch(/Chleb: \S/);
    expect(txt).toMatch(/Pizza: \S/);
    // Legenda pod spiralą: karta po obrazie w drzewie
    const kolejnosc = root.findAll((n) => typeof n.type === 'string' && (n.props.testID === 'brand-spiral' || n.props.testID === 'start-trwa-wypiek')).map((n) => n.props.testID);
    expect(kolejnosc[0]).toBe('brand-spiral');
    await act(async () => wroc[1].props.onPress());
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/stolnica', params: { wypiek: 'bake_pizza' } });
  });

  it('Stuknięcie w spiralę jednego wypieku otwiera jego Stolnicę; przycisk, etykieta VoiceOver z recepturą i krokiem, cel ≥ 44 pt (decyzja M1 2026-10-23, wariant a)', async () => {
    zDostepem();
    await saveBakeSession(wypiek('bake_chleb', 'Chleb', 3));
    const root = await renderStart();
    const spirala = przycisk(root, 'spirala-otworz');
    expect(spirala).toHaveLength(1);
    expect(spirala[0].props.accessibilityRole).toBe('button');
    expect(spirala[0].props.accessibilityLabel).toMatch(/^Chleb: .+\. Otwórz prowadzenie wypieku$/);
    expect(Number(styl(spirala[0]).minHeight)).toBeGreaterThanOrEqual(44);
    expect(przycisk(root, 'resume-bake-btn')).toHaveLength(1);
    await act(async () => spirala[0].props.onPress());
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/stolnica', params: { wypiek: 'bake_chleb' } });
  });

  it('Dwa wypieki: stuknięcie w kartę legendy otwiera Stolnicę tego wypieku; spirala dwóch torów nie zgaduje toru (nie jest przyciskiem)', async () => {
    zDostepem();
    await saveBakeSession(wypiek('bake_chleb', 'Chleb', 3));
    await saveBakeSession(wypiek('bake_pizza', 'Pizza', 1));
    const root = await renderStart();
    expect(przycisk(root, 'spirala-otworz')).toHaveLength(0);
    const karty = przycisk(root, 'karta-otworz');
    expect(karty.map((k) => k.props.accessibilityRole)).toEqual(['button', 'button']);
    expect(karty[0].props.accessibilityLabel).toMatch(/^Chleb: .+\. Otwórz prowadzenie wypieku$/);
    expect(karty[1].props.accessibilityLabel).toMatch(/^Pizza: .+\. Otwórz prowadzenie wypieku$/);
    for (const k of karty) expect(Number(styl(k).minHeight)).toBeGreaterThanOrEqual(44);
    expect(przycisk(root, 'resume-bake-btn')).toHaveLength(2);
    await act(async () => karty[1].props.onPress());
    expect(mockPush).toHaveBeenLastCalledWith({ pathname: '/stolnica', params: { wypiek: 'bake_pizza' } });
    await act(async () => karty[0].props.onPress());
    expect(mockPush).toHaveBeenLastCalledWith({ pathname: '/stolnica', params: { wypiek: 'bake_chleb' } });
  });

  it('BR-KAL-007 Decyzja o zaległym bez zmiany schematu: „Pomiń” zapisuje decyzję w app_settings, zaległe znika', async () => {
    zDostepem();
    await pustaBaza();
    await zakwasZalegly();
    const root = await renderStart();
    const pomin = root.findAll((n) => typeof n.type !== 'string' && typeof n.props.testID === 'string' && n.props.testID.startsWith('zalegle-pomin-') && typeof n.props.onPress === 'function')[0];
    expect(pomin.props.accessibilityLabel).toMatch(/^Pomiń karmienie zakwasu Żytni z \d\d:\d\d$/);
    await act(async () => pomin.props.onPress());
    await flush();
    expect(String(await getAppSetting(KLUCZ_POMINIEC))).toContain('karmienie:zyt');
    expect(teksty(root)).not.toContain('Zaległe:');
    expect(teksty(root)).toMatch(/Następne: .*karmienie zakwasu Żytni/);
  });

  it('BR-KAL-003 Pomiń krok wypieku: wypiek przechodzi do następnego kroku; „Zrobione” otwiera Stolnicę tego wypieku', async () => {
    zDostepem();
    await pustaBaza();
    await saveBakeSession(wypiek('bake_chleb', 'Chleb', 1, Date.now() - 60_000));
    const root = await renderStart();
    const zrob = root.findAll((n) => typeof n.type !== 'string' && typeof n.props.testID === 'string' && n.props.testID.startsWith('zalegle-zrobione-wypiek:bake_chleb') && typeof n.props.onPress === 'function');
    expect(zrob).toHaveLength(1);
    await act(async () => zrob[0].props.onPress());
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/stolnica', params: { wypiek: 'bake_chleb' } });
    const pomin = przycisk(root, zrob[0].props.testID.replace('zrobione', 'pomin'))[0];
    await act(async () => pomin.props.onPress());
    await flush();
    const [w] = await loadActiveBakeSessionsZWersja();
    expect(w.sesja.stepIdx).toBe(2);
  });

  it('BR-KAL-004 Arkusz dnia: dzień pusty „Tego dnia nic nie zaplanowano.”; dziś z zaległym na górze; „+N” — najbliższe dni', async () => {
    zDostepem();
    await pustaBaza();
    await zakwasZalegly();
    await saveStarter({ id: 'a', name: 'A', flourType: 'x', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: Date.now() - 6 * H });
    await saveStarter({ id: 'b', name: 'B', flourType: 'x', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: Date.now() - 5 * H });
    await saveStarter({ id: 'c', name: 'C', flourType: 'x', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: Date.now() - 4 * H });
    await saveStarter({ id: 'd', name: 'D', flourType: 'x', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: Date.now() - 3 * H });
    const root = await renderStart();
    // Dzień tygodnia co najmniej 2 dni od dziś (zdarzenia zakwasów są w pobliżu dziś)
    const dni = root.findAll((n) => typeof n.type !== 'string' && typeof n.props.testID === 'string' && n.props.testID.startsWith('pasek-dzien-') && typeof n.props.onPress === 'function');
    const i = dni.findIndex((d) => d.props.testID === `pasek-dzien-${localDateKey(Date.now())}`);
    const inny = i <= 4 ? dni[6] : dni[0];
    await act(async () => inny.props.onPress());
    expect(teksty(root)).toContain('Tego dnia nic nie zaplanowano.');
    await act(async () => przycisk(root, 'close-modal')[0].props.onPress());
    await act(async () => przycisk(root, `pasek-dzien-${localDateKey(Date.now())}`)[0].props.onPress());
    const zalegleWArkuszu = root.findAll((n) => typeof n.type === 'string' && typeof n.props.testID === 'string' && n.props.testID.startsWith('zalegle-zakwas:zyt'));
    expect(zalegleWArkuszu.length).toBeGreaterThanOrEqual(2); // na pasie i w arkuszu
    await act(async () => przycisk(root, 'close-modal')[0].props.onPress());
    const plus = przycisk(root, 'linia-nastepne-plus')[0];
    // Zaległe + 4 źródła przyszłe, limit 3: w linii 2 przyszłe, reszta pod „+2” (RD-32)
    expect(plus.props.accessibilityLabel).toBe('Pokaż jeszcze 2 w arkuszu dnia');
    await act(async () => plus.props.onPress());
    expect(teksty(root)).toContain('Najbliższe dni');
  });

  it('VoiceOver: zdanie „Następne” czyta pełną listę, „+N” osobną akcją', async () => {
    zDostepem();
    await pustaBaza();
    for (const [id, h] of [['a', 6], ['b', 5], ['c', 4], ['d', 3]] as const) {
      await saveStarter({ id, name: id.toUpperCase(), flourType: 'x', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: Date.now() - h * H });
    }
    const root = await renderStart();
    const zdanie = host(root, 'linia-nastepne-zdanie')[0];
    expect(zdanie.props.accessibilityLabel.match(/karmienie zakwasu/g)).toHaveLength(4);
    expect(zdanie.props.children.match(/karmienie zakwasu/g)).toHaveLength(3);
  });

  it('AX5: lista dni zamiast 7 kolumn („Pokaż cały tydzień”), kafle pod sobą, przy dwóch wypiekach karty bez spirali', async () => {
    zDostepem();
    Object.assign(mockOkno, { fontScale: 3.1 });
    await saveBakeSession(wypiek('bake_chleb', 'Chleb', 3));
    await saveBakeSession(wypiek('bake_pizza', 'Pizza', 1));
    const root = await renderStart();
    const dni = () => root.findAll((n) => typeof n.type !== 'string' && typeof n.props.testID === 'string' && n.props.testID.startsWith('pasek-dzien-') && typeof n.props.onPress === 'function');
    expect(dni()).toHaveLength(1);
    await act(async () => przycisk(root, 'pasek-caly-tydzien')[0].props.onPress());
    expect(dni()).toHaveLength(7);
    expect(przycisk(root, 'pasek-caly-tydzien')).toHaveLength(0);
    expect(styl(host(root, 'start-czynnosci')[0]).flexDirection).toBe('column');
    expect(root.findAll((n) => typeof n.type === 'string' && n.props.testID === 'brand-spiral')).toHaveLength(0);
    expect(host(root, 'start-trwa-wypiek')).toHaveLength(2);
  });

  it('320 pt: dni od krawędzi do krawędzi (bez marginesu), każdy dzień cały przycisk ≥ 44 pt; kafle bez ucinania tekstu', async () => {
    await pustaBaza();
    Object.assign(mockOkno, { width: 320 });
    const root = await renderStart();
    const rzad = host(root, 'pasek-tygodnia')[0];
    expect(styl(rzad).marginHorizontal).toBe(-16); // pas ma 16 pt marginesu: 320 / 7 ≈ 45,7 pt na dzień
    const dzien = przycisk(root, `pasek-dzien-${localDateKey(Date.now())}`)[0];
    expect(styl(dzien)).toEqual(expect.objectContaining({ flex: 1, minHeight: 44 }));
    for (const n of root.findAll((x) => typeof x.type === 'string' && typeof x.props.testID === 'string' && x.props.testID.startsWith('start-pieke'))) {
      expect(n.findAll((x) => x.props.numberOfLines !== undefined)).toHaveLength(0);
    }
  });

  it('BR-KAL-002 Przejścia z arkusza dnia: krok wypieku → Stolnica tego wypieku, karmienie → karta zakwasu, wpis → Dziennik (BR-KAL-004 Dzień ze zdarzeniami)', async () => {
    zDostepem();
    await pustaBaza();
    await saveBakeSession(wypiek('bake_chleb', 'Chleb', 3));
    await saveStarter({ id: 'zyt', name: 'Żytni', flourType: 'x', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: Date.now() - 60_000 });
    await saveBakeLog({ id: 'wpis-1', recipeName: 'Wiejski', startedAt: Date.now() - 2 * H, finishedAt: Date.now() - 90_000, ratingStars: 4 });
    const root = await renderStart();
    await act(async () => przycisk(root, `pasek-dzien-${localDateKey(Date.now())}`)[0].props.onPress());
    const wiersze = root.findAll((n) => typeof n.type !== 'string' && typeof n.props.testID === 'string' && n.props.testID.startsWith('arkusz-zdarzenie-') && typeof n.props.onPress === 'function');
    // Kolejność godzin w arkuszu
    const godziny = wiersze.map((w) => String(w.props.accessibilityLabel).slice(0, 5));
    expect([...godziny].sort()).toEqual(godziny);
    const wiersz = (p: string) => wiersze.find((w) => w.props.testID.startsWith(`arkusz-zdarzenie-${p}`));
    expect(wiersz('dziennik:wpis-1')?.props.accessibilityLabel).toContain('Wiejski: ocena 4 z 5');
    await act(async () => wiersz('wypiek:bake_chleb')?.props.onPress());
    expect(mockPush).toHaveBeenLastCalledWith({ pathname: '/stolnica', params: { wypiek: 'bake_chleb' } });
    await act(async () => przycisk(root, `pasek-dzien-${localDateKey(Date.now())}`)[0].props.onPress());
    const karmienie = root.findAll((n) => typeof n.type !== 'string' && typeof n.props.testID === 'string' && n.props.testID.startsWith('arkusz-zdarzenie-wpis:') && typeof n.props.onPress === 'function')[0];
    await act(async () => karmienie.props.onPress());
    expect(mockPush).toHaveBeenLastCalledWith('/zakwasy');
    await act(async () => przycisk(root, `pasek-dzien-${localDateKey(Date.now())}`)[0].props.onPress());
    await act(async () => przycisk(root, 'arkusz-zdarzenie-dziennik:wpis-1')[0].props.onPress());
    expect(mockPush).toHaveBeenLastCalledWith('/dziennik');
  });

  it('BR-KAL-006 Przeszłość zawsze i bez terminów karmienia: po próbie wpis Dziennika na pasku bez kłódek, bez „Następne” karmienia', async () => {
    await pustaBaza();
    await setAppSetting(KLUCZ_HISTORII_DOSTEPU, 'proba');
    await saveBakeLog({ id: 'wpis-1', recipeName: 'Wiejski', startedAt: Date.now() - 3 * H, finishedAt: Date.now() - 2 * H, ratingStars: 4 });
    await saveStarter({ id: 'zyt', name: 'Żytni', flourType: 'x', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP', lastFedAt: Date.now() - 20 * H });
    const root = await renderStart();
    const pas = host(root, 'pas-dzis')[0];
    expect(pas.findAll((n) => n.props.testID === 'glif-dziennik').length).toBeGreaterThan(0);
    expect(pas.findAll((n) => n.props.testID === 'glif-karmienie').length).toBeGreaterThan(0);
    const naPasie = pas.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');
    expect(naPasie).not.toContain('wymaga Piekarz Pro');
    expect(naPasie).not.toContain('Zaległe:');
    expect(naPasie).not.toContain('Następne:');
    // Kłódki zostają tylko na kaflach (stan „tylko historia”)
    expect(teksty(root)).toContain('wymaga Piekarz Pro');
  });

  it('BR-KAL-001 Północ: aplikacja otwarta przez północ — po minucie wyróżniony jest nowy dzień', async () => {
    jest.useRealTimers(); // ten przypadek ma własny zegar (spy na Date.now)
    await pustaBaza();
    const polnoc = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() + 1).getTime();
    let teraz = polnoc - 30_000;
    const spy = jest.spyOn(Date, 'now').mockImplementation(() => teraz);
    // Zegar ścienny z Date.now (spy wyżej); fałszywe tylko zegary odliczające (setInterval co minutę)
    jest.useFakeTimers({ doNotFake: ['Date', 'nextTick', 'setImmediate', 'queueMicrotask'] });
    try {
      const root = await renderStart();
      const wybrany = () => root.findAll((n) => typeof n.type !== 'string' && typeof n.props.testID === 'string' && n.props.testID.startsWith('pasek-dzien-') && n.props.accessibilityState?.selected === true && typeof n.props.onPress === 'function').map((n) => n.props.testID);
      expect(wybrany()).toEqual([`pasek-dzien-${localDateKey(polnoc - 30_000)}`]);
      teraz = polnoc + 30_000;
      const zegary = jest.getTimerCount();
      await act(async () => {
        jest.advanceTimersByTime(60_000);
      });
      expect(zegary).toBeGreaterThan(0);
      expect(wybrany()).toEqual([`pasek-dzien-${localDateKey(polnoc + 30_000)}`]);
    } finally {
      jest.useRealTimers();
      spy.mockRestore();
    }
  });

  it('pasek stanu jasny na pasie przy wejściu na „Dziś”', async () => {
    const spy = jest.spyOn(StatusBar, 'setBarStyle');
    await pustaBaza();
    await renderStart();
    expect(spy).toHaveBeenCalledWith('light-content', true);
    spy.mockRestore();
  });

  it('nowe teksty „Dziś” mają wpis EN', () => {
    const klucze = [
      'Nic nie mamy w planach', 'Kalendarz jest pusty. Zapełni się, gdy założysz zakwas albo zaplanujesz wypiek.',
      'Tu pojawi się plan wypieku i tydzień z karmieniami, gdy coś zaczniesz.', 'Ten tydzień', 'Pokaż cały tydzień',
      'Tego dnia nic nie zaplanowano.', 'Najbliższe dni', 'Zapisano dokarmienie zakwasu {zakwas}.', '{wypiek}: {krok}',
      'Tor {n}, {receptura}: {krok}, {czas}', 'Tor {n}, {receptura}: {krok}', 'Ten wypiek jest już zakończony albo przerwany.',
      'Gotowe {dzien} o {godzina}.',
    ];
    expect(klucze.filter((k) => typeof EN[k] !== 'string')).toEqual([]);
  });
});
