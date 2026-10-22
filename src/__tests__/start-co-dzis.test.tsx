/**
 * Start „Co dziś robisz?” (BR-START-001, H-08, F-68; design-spec §6 Start, makieta docs/design/ekrany/start.html)
 * [M1-audytor-generalny-101]: pierwszy ekran po uruchomieniu to trzy czynności (Wybór czynności: ikona + nazwa
 * + zdanie), bez oferty po wyborze (D-047); trwający wypiek wraca jednym dotknięciem na bieżący krok (F-58);
 * bez Piekarz Pro Start jest tym samym wyborem (Basic, D-112; stan „tylko historia” F-67 odpadł z D-038), a dziennik
 * zostaje do przeglądania.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
const mockPush = jest.fn();
const mockNavigate = jest.fn();
const mockNaglowek: { title?: string } = {};
jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  // Nagłówek systemowy w teście: tytuł zapamiętany, przycisk z prawej renderowany w drzewie ekranu
  Stack.Screen = ({ options }: { options?: { title?: string; headerRight?: () => React.ReactNode } }) => {
    mockNaglowek.title = options?.title;
    return options?.headerRight ? React.createElement(React.Fragment, null, options.headerRight()) : null;
  };
  return {
    Stack,
    useRouter: () => ({ push: mockPush, navigate: mockNavigate, replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});

import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Iap from 'expo-iap';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import RecepturyScreen from '../../app/(tabs)/receptury/index';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import StolnicaScreen from '../../app/stolnica';
import { ustawRodzajReceptur } from '../lib/start-stan';
import { EN } from '../lib/i18n.en';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { PaywallModal } from '../components/PaywallModal';
import { initDatabase, _resetMemStore, deleteStarter, getStarters, saveBakeLog } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { planBakeSteps } from '../core/bake-steps';
import { _resetStanu } from '../lib/platnosci/stan';
import { setLang } from '../lib/i18n';

const mockIap = (Iap as unknown as {
  __mock: { reset: () => void; entitlements: Array<Record<string, unknown>> };
}).__mock;

// M3 D4b: „Dziś” czyta też dane kalendarza, więc więcej kolejek mikrozadań do ustalenia stanu (bez zmian asercji)
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 60; i++) await Promise.resolve();
  });
};
const teksty = (root: renderer.ReactTestInstance) =>
  root.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');
const paywallShown = (root: renderer.ReactTestInstance) =>
  root.findAllByType(PaywallModal).some((p) => p.props.visible === true);
const przyciski = (root: renderer.ReactTestInstance) =>
  root
    .findByProps({ testID: 'start-czynnosci' })
    .findAll((n) => typeof n.type !== 'string' && n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function');

/** Baza jak na telefonie po instalacji: bez zakwasów, receptur własnych i wpisów (seed pamięci testów usunięty). */
async function pustaBaza() {
  for (const s of await getStarters()) await deleteStarter(s.id);
}

async function renderStart() {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(
      <AppAccessProvider>
        <StartScreen />
      </AppAccessProvider>
    );
  });
  await flush();
  return tree;
}

function zDostepem() {
  mockIap.entitlements = [{ id: 't', transactionId: 't', productId: 'com.apps4brew.baker.pro.lifetime', purchaseState: 'purchased', transactionDate: 1 }];
}

describe('101: Start „Co dziś robisz?”', () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    _resetMemStore();
    mockIap.reset();
    _resetStanu();
    await initDatabase();
    await saveBakeSession(null);
  });
  afterEach(() => setLang('pl'));

  it('pierwsze uruchomienie: dokładnie 3 czynności z rolą button i etykietami PL (BR-START-001 Pierwsze uruchomienie)', async () => {
    await pustaBaza();
    const tree = await renderStart();
    const p = przyciski(tree.root);
    expect(p).toHaveLength(3);
    expect(p.map((n) => n.props.accessibilityLabel)).toEqual([
      'Zakładam zakwas',
      'Piekę na zakwasie',
      'Piekę na drożdżach albo pizzę',
    ]);
    // M3 D4b: kafle bez zdania (makieta roli 04 a2, D-105) — zdanie w podpowiedzi VoiceOver; tytuł na pasie
    expect(p[0].props.accessibilityHint).toBe('Od mąki i wody do pierwszego bochenka, dzień po dniu.');
    expect(teksty(tree.root)).toContain('Co dziś robisz?');
    expect(mockNaglowek.title).toBe('Co dziś robisz?');
    // Ustawienia z „Dziś” (D-051 2a)
    expect(tree.root.findAllByProps({ testID: 'open-settings-btn' }).length).toBeGreaterThan(0);
    act(() => tree.unmount());
  });

  it('pierwsze uruchomienie po angielsku: etykiety EN', async () => {
    await pustaBaza();
    setLang('en');
    const tree = await renderStart();
    expect(przyciski(tree.root).map((n) => n.props.accessibilityLabel)).toEqual([
      'Starting a sourdough starter',
      'Baking with sourdough',
      'Baking with yeast or making pizza',
    ]);
    expect(mockNaglowek.title).toBe('What are you doing today?');
    act(() => tree.unmount());
  });

  it('wybór czynności otwiera przepływ bez oferty (D-047) (BR-START-001 Wybór prowadzi do przepływu)', async () => {
    await pustaBaza();
    const tree = await renderStart();
    for (const btn of przyciski(tree.root)) {
      await act(async () => {
        btn.props.onPress();
      });
      await flush();
      expect(paywallShown(tree.root)).toBe(false);
    }
    const cele = [...mockPush.mock.calls, ...mockNavigate.mock.calls].map((c) => JSON.stringify(c[0]));
    expect(cele).toHaveLength(3);
    expect(cele[0]).toContain('/zakwasy');
    expect(cele[1]).toContain('/receptury');
    expect(cele[2]).toContain('/receptury');
    act(() => tree.unmount());
  });

  // Zmiana M3 D4b: w wariancie 3+1 (D-105) trwający wypiek to duża Spirala pod kaflami (150–220 pt), nie karta 92 pt
  it('trwa wypiek: duża Spirala i „Wróć do wypieku” jednym dotknięciem otwiera prowadzenie', async () => {
    zDostepem();
    const start = Date.now() - 60_000;
    const steps = planBakeSteps({ startAt: start, isHighRye: false });
    await saveBakeSession({
      version: 2,
      steps,
      stepIdx: 3,
      dutchOvenPhase: 'lid_on',
      timerEndsAt: null,
      pausedLeftSec: 600,
      recipeName: 'Chleb pszenny na zakwasie',
      startedAt: start,
      bake: null,
    });
    const tree = await renderStart();
    const spirala = tree.root.findByProps({ testID: 'brand-spiral' });
    expect(spirala.props.accessibilityRole).toBe('image');
    expect(spirala.props.accessibilityLabel).toContain(`krok 4 z ${steps.length}`);
    expect(spirala.props.style.width).toBeGreaterThanOrEqual(150);
    expect(teksty(tree.root)).toContain('Chleb pszenny na zakwasie');
    const wroc = tree.root.findByProps({ testID: 'resume-bake-btn' });
    expect(wroc.props.accessibilityRole).toBe('button');
    await act(async () => {
      wroc.props.onPress();
    });
    expect(mockPush).toHaveBeenCalledTimes(1);
    // D3a: prowadzenie tego wypieku (id w trasie; zapis bez danych wypieku ma stały id)
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/stolnica', params: { wypiek: 'sesja-1014' } });
    act(() => tree.unmount());
  });

  it('D3a: dwa trwające wypieki — oba na „Dziś” po kolei, każdy z „Wróć do: {nazwa}” do swojego prowadzenia', async () => {
    zDostepem();
    const start = Date.now() - 60_000;
    const steps = planBakeSteps({ startAt: start, isHighRye: false });
    const wypiek = (id: string, nazwa: string, stepIdx: number) => ({
      version: 2 as const, steps, stepIdx, dutchOvenPhase: 'lid_on' as const, timerEndsAt: null, pausedLeftSec: 600,
      recipeName: nazwa, startedAt: start, bake: { id, recipeName: nazwa, startedAt: start, currentStageId: steps[stepIdx].id },
    });
    await saveBakeSession(wypiek('bake_chleb', 'Chleb', 3));
    await saveBakeSession(wypiek('bake_pizza', 'Pizza', 1));
    const tree = await renderStart();
    expect(tree.root.findAllByProps({ testID: 'start-trwa-wypiek' }).filter((n) => typeof n.type === 'string')).toHaveLength(2);
    const przyciski = tree.root.findAllByProps({ testID: 'resume-bake-btn' }).filter((n) => typeof n.props.onPress === 'function' && typeof n.type !== 'string');
    expect(przyciski.map((p) => p.props.accessibilityLabel)).toEqual(['Wróć do: Chleb', 'Wróć do: Pizza']);
    await act(async () => {
      przyciski[1].props.onPress();
    });
    expect(mockPush).toHaveBeenCalledWith({ pathname: '/stolnica', params: { wypiek: 'bake_pizza' } });
    act(() => tree.unmount());
  });

  it('„Wróć do wypieku” prowadzi do prowadzenia, które otwiera się na bieżącym kroku (F-58)', async () => {
    zDostepem();
    const start = Date.now() - 60_000;
    const steps = planBakeSteps({ startAt: start, isHighRye: false });
    await saveBakeSession({ version: 2, steps, stepIdx: 3, dutchOvenPhase: 'lid_on', timerEndsAt: null, pausedLeftSec: 600, recipeName: 'Chleb pszenny na zakwasie', startedAt: start, bake: null });
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<AppAccessProvider><StolnicaScreen /></AppAccessProvider>);
    });
    await flush();
    expect(teksty(tree.root)).toContain(`Krok 4 z ${steps.length}`);
    act(() => tree.unmount());
  });

  it('Ustawienia otwierają się z „Dziś” (D-051 2a): kopia zapasowa', async () => {
    await pustaBaza();
    const tree = await renderStart();
    await act(async () => {
      tree.root.findAllByProps({ testID: 'open-settings-btn' }).find((n) => typeof n.props.onPress === 'function')!.props.onPress();
    });
    await flush();
    const txt = teksty(tree.root);
    expect(txt).toContain('Ustawienia');
    expect(txt).toContain('Kopia zapasowa');
    act(() => tree.unmount());
  });

  it('wybór „piekę na drożdżach albo pizzę” ustawia filtr receptur w zakładce Receptury', async () => {
    zDostepem();
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<AppAccessProvider><RecepturyScreen /></AppAccessProvider>);
    });
    await flush();
    await act(async () => {
      ustawRodzajReceptur('yeast');
    });
    // Filtr listy receptur (§11c 106): wybrany chip „Drożdżowe” [M1-audytor-generalny-106]
    const lista = tree.root.find((n) => n.props?.onFiltr !== undefined && n.props?.filtr !== undefined);
    expect(lista.props.filtr).toBe('yeast');
    act(() => tree.unmount());
  });

  it('po próbie bez zakupu: Dziennik pokazuje historię bez ekranu zakupu (BR-RECP-003 Przegląd historii bez zakupu, BR-ZAK-004 Po końcu próby)', async () => {
    await saveBakeLog({ id: 'bake_1', recipeName: 'Mój chleb', startedAt: 1, finishedAt: 2, ratingStars: 4 });
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<AppAccessProvider><DziennikScreen /></AppAccessProvider>);
    });
    await flush();
    expect(teksty(tree.root)).toContain('Mój chleb');
    expect(tree.root.findAllByProps({ testID: 'blokada-historia' })).toHaveLength(0);
    expect(paywallShown(tree.root)).toBe(false);
    act(() => tree.unmount());
  });

  it('nowe teksty Startu i zakładek mają wpis EN', () => {
    const klucze = [
      'Co dziś robisz?', 'Zakładam zakwas', 'Od mąki i wody do pierwszego bochenka, dzień po dniu.', 'Piekę na zakwasie',
      'Mam zakwas. Wybieram recepturę i godzinę, o której chleb ma być gotowy.', 'Piekę na drożdżach albo pizzę',
      'Chleb drożdżowy, zaczyn poolish albo biga, ciasto na pizzę.', 'wymaga Piekarz Pro',
      'Piekarz działa bez internetu i bez konta. Twoje receptury i zapiski zostają na tym telefonie.', 'Trwa wypiek',
      'zostało {czas}', 'zostało {czas}, do {godzina}', '{nazwa}: gotowe {dzien} o {godzina}', 'Co jeszcze dziś robisz?',
      'Dziś', 'Receptury', 'Zakwasy', 'Dziennik', 'Plan wypieku', 'Doktor Chleba', 'Doktor', 'Stolnica', 'Akademia',
    ];
    expect(klucze.filter((k) => !EN[k])).toEqual([]);
  });

  // Przepisane z kontraktu D-038 (po próbie stan „tylko historia” z kłódką na kaflach) na Basic/Pro [M3 P-a]: trzy
  // czynności są w Basic (D-112, D-113), więc bez Pro z własnymi danymi Start jest zwykłym wyborem bez kłódek
  it('bez Pro z własnymi danymi: trzy czynności bez kłódek i bez ekranu Pro (D-112)', async () => {
    await pustaBaza();
    await saveBakeLog({ id: 'bake_1', recipeName: 'Mój chleb', startedAt: 1, finishedAt: 2, ratingStars: 4 });
    const tree = await renderStart();
    expect(paywallShown(tree.root)).toBe(false);
    const txt = teksty(tree.root);
    expect(txt).not.toContain('Okres próbny');
    expect(txt).not.toContain('wymaga Piekarz Pro');
    expect(tree.root.findAllByProps({ testID: 'start-tylko-historia' })).toHaveLength(0);
    expect(przyciski(tree.root)).toHaveLength(3);
    act(() => tree.unmount());
  });
});
