/**
 * Basic/Pro na ekranach (kontrakt docs/monetyzacja.md, D-112, D-113, D-116) [M3 P-a]: wektory dostępu W-01, W-04,
 * W-05, W-07, W-08 i W-10 na ekranach; strażniki funkcji Pro z przebudowy M3 (kalendarz D4–D8: miesiąc, skrót
 * „Zaplanuj wypiek na ten dzień”, dwa wypieki naraz, plik .ics; plan D5: „gotowe o…”, „Zaplanuj”); zaplanowany wcześniej
 * wypiek da się zacząć w Basic. Ekran Pro tylko po stuknięciu funkcji Pro: nigdy przy starcie.
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
const mockNavigate = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  // Wywołania przez funkcję: fabryka atrapy działa przed inicjalizacją mockPush/mockNavigate
  const nawigacja = {
    push: (...a: unknown[]) => mockPush(...a),
    navigate: (...a: unknown[]) => mockNavigate(...a),
    replace: jest.fn(),
    back: jest.fn(),
    setParams: jest.fn(),
  };
  const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    get router() {
      return nawigacja;
    },
    useRouter: () => nawigacja,
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { Alert, Modal, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import RecepturaScreen from '../../app/(tabs)/receptury/receptura';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { PaywallModal } from '../components/PaywallModal';
import { BreadAcademyModal } from '../components/BreadAcademyModal';
import { ArkuszDnia } from '../components/kalendarz/ArkuszDnia';
import { ArkuszPlanu } from '../components/start/ArkuszPlanu';
import { initDatabase, _resetMemStore, deleteStarter, getStarters, saveRecipe, getRecipes } from '../data/sqlite-store';
import { getAppSetting, setAppSetting } from '../data/settings-store';
import { saveBakeSession } from '../data/bake-session-store';
import { deleteBakeSession, loadActiveBakeSessions, loadPlannedBakes, savePlannedBake, type PlannedBake } from '../data/bake-sessions-store';
import { planBakeSteps } from '../core/bake-steps';
import { localDateKey } from '../core/dzien-lokalny';
import { _resetStanu } from '../lib/platnosci/stan';
import { KLUCZ_PAMIECI, PRODUKTY } from '../lib/platnosci/konfiguracja';
import { zapisPamieci } from '../lib/platnosci/dostep';
import { KLUCZ_KONCA_PRO, KLUCZ_UPRZEDZENIA } from '../lib/platnosci/uprzedzenie';
import { ustawDzienGotowe } from '../lib/plan-receptury';
import { setLang } from '../lib/i18n';
import { mockIap } from '../../tests/helpers/platnosci';

const H = 3_600_000;
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const host = (root: renderer.ReactTestInstance, testID: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === testID);
const przycisk = (root: renderer.ReactTestInstance, testID: string) =>
  root.findAll((n) => typeof n.type !== 'string' && n.props.testID === testID && typeof n.props.onPress === 'function');
const teksty = (root: renderer.ReactTestInstance) => root.findAllByType(Text).map((n) => [n.props.children].flat().join('')).join(' | ');
const ekranPro = (root: renderer.ReactTestInstance) => root.findAllByType(PaywallModal).some((p) => p.props.visible === true);
/** Arkusz (pageSheet) zniknął z ekranu: onDismiss jego Modal (iOS). */
const poZniknieciu = async (root: renderer.ReactTestInstance, typ: React.ElementType) => {
  await act(async () => root.findByType(typ).findByType(Modal).props.onDismiss?.());
  await flush();
};
const nacisnij = async (root: renderer.ReactTestInstance, testID: string) => {
  const p = przycisk(root, testID);
  expect({ testID, jest: p.length > 0 }).toEqual({ testID, jest: true });
  await act(async () => p[p.length - 1].props.onPress());
  await flush();
};

function plan(id: string, nazwa: string, start: number): PlannedBake {
  const steps = planBakeSteps({ startAt: start, isHighRye: false });
  return { version: 1, id, recipeName: nazwa, plannedStartAt: start, steps, bake: { id, recipeName: nazwa, startedAt: start, currentStageId: steps[0].id, steps } };
}
const wypiek = (id: string, nazwa: string) => {
  const start = Date.now() - 2 * H;
  const steps = planBakeSteps({ startAt: start, isHighRye: false });
  return {
    version: 2 as const, steps, stepIdx: 3, dutchOvenPhase: 'lid_on' as const, timerEndsAt: null, pausedLeftSec: 600,
    recipeName: nazwa, startedAt: start, bake: { id, recipeName: nazwa, startedAt: start, currentStageId: steps[3].id },
  };
};

type Przycisk = { text: string; onPress?: () => void };
let alertSpy: jest.SpyInstance;
const ostatniAlert = () => {
  const [tytul, , przyciski] = alertSpy.mock.calls[alertSpy.mock.calls.length - 1] as [string, string | undefined, Przycisk[]];
  return { tytul, przyciski: przyciski ?? [] };
};

let tree: renderer.ReactTestRenderer | null = null;
async function zamontuj(el: React.ReactElement) {
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree!.root;
}

beforeEach(async () => {
  jest.clearAllMocks();
  _resetMemStore();
  mockIap.reset(); // bez Pro
  _resetStanu();
  ustawDzienGotowe(null);
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await initDatabase();
  await saveBakeSession(null);
  for (const p of await loadPlannedBakes()) await deleteBakeSession(p.id);
});
afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
  alertSpy.mockRestore();
  setLang('pl');
});

describe('Dziś w Basic (W-01, kalendarz D4–D8)', () => {
  it('W-01 nowy użytkownik: przy starcie bez ekranu Pro; kafle bez kłódek i bez stanu „tylko historia”', async () => {
    for (const s of await getStarters()) await deleteStarter(s.id);
    const root = await zamontuj(<StartScreen />);
    expect(ekranPro(root)).toBe(false);
    expect(host(root, 'start-tylko-historia')).toHaveLength(0);
    expect(root.findAll((n) => n.props?.zablokowane === true)).toHaveLength(0);
  });

  it('BR-KAL-013 widok miesiąca (Pro): „Miesiąc” otwiera ekran Pro, tydzień zostaje', async () => {
    const root = await zamontuj(<StartScreen />);
    await nacisnij(root, 'kalendarz-tryb-miesiac');
    expect(ekranPro(root)).toBe(true);
    expect(host(root, 'pasek-tygodnia').length).toBeGreaterThan(0);
  });

  it('BR-KAL-015 skrót „Zaplanuj wypiek na ten dzień” (Pro): ekran Pro zamiast Receptur', async () => {
    const root = await zamontuj(<StartScreen />);
    const jutro = localDateKey(Date.now() + 24 * H);
    await nacisnij(root, `pasek-dzien-${jutro}`);
    await nacisnij(root, 'arkusz-zaplanuj-btn');
    // Ekran Pro po zniknięciu arkusza dnia, nie nad nim (D-117) [04-studio-projektowe-005]
    await poZniknieciu(root, ArkuszDnia);
    expect(ekranPro(root)).toBe(true);
    expect(mockNavigate).not.toHaveBeenCalledWith('/receptury');
  });

  it('zaplanowany wcześniej wypiek da się zacząć w Basic (start w Basic, kontrakt „Wygaśnięcie Pro”)', async () => {
    await savePlannedBake(plan('plan_teraz', 'Chleb', Date.now() - H));
    const root = await zamontuj(<StartScreen />);
    await nacisnij(root, 'plan-zobacz-plan_teraz');
    await nacisnij(root, 'plan-zacznij-btn');
    expect(ekranPro(root)).toBe(false);
    expect((await loadActiveBakeSessions()).map((s) => s.bake?.id)).toEqual(['plan_teraz']);
  });

  it('BR-KAL-016 dwa wypieki naraz (Pro): przy trwającym „Prowadź oba” otwiera ekran Pro, „Wróć do” działa', async () => {
    await saveBakeSession(wypiek('bake_chleb', 'Chleb'));
    await savePlannedBake(plan('plan_teraz', 'Pizza', Date.now() - H));
    const root = await zamontuj(<StartScreen />);
    await nacisnij(root, 'plan-wiersz-plan_teraz');
    await nacisnij(root, 'plan-zacznij-btn');
    const a = ostatniAlert();
    expect(a.tytul).toBe('Trwa już inny wypiek');
    await act(async () => a.przyciski[0].onPress?.());
    await flush();
    // Ekran Pro po zniknięciu arkusza planu, nie nad nim (D-117) [04-studio-projektowe-005]
    await poZniknieciu(root, ArkuszPlanu);
    expect(ekranPro(root)).toBe(true);
    expect((await loadActiveBakeSessions()).map((s) => s.bake?.id)).toEqual(['bake_chleb']);
  });
});

describe('uprzedzenie o końcu Pro na „Dziś” (W-07, W-08; D-113)', () => {
  it('W-08 subskrypcja bez odnowienia kończy się za 30 h: jedno uprzedzenie z „przypomnienia o dokarmianiu wyłączą się”, przy następnym uruchomieniu już nie', async () => {
    const koniec = Date.now() + 30 * H;
    mockIap.entitlements = [{ id: 't', transactionId: 't', productId: PRODUKTY.yearly, purchaseState: 'purchased', transactionDate: 1, expirationDateIOS: koniec, renewalInfoIOS: { willAutoRenew: false } }];
    const root = await zamontuj(<StartScreen />);
    expect(host(root, 'start-uprzedzenie-konca-pro')).toHaveLength(1);
    expect(teksty(root)).toContain('przypomnienia o dokarmianiu wyłączą się');
    expect(teksty(root)).not.toMatch(/\d+ (godz|h)\b|ostatni/i); // bez odliczania i „ostatniej szansy”
    expect(Number(await getAppSetting(KLUCZ_UPRZEDZENIA))).toBe(koniec);
    act(() => tree?.unmount());
    _resetStanu();
    const drugi = await zamontuj(<StartScreen />);
    expect(host(drugi, 'start-uprzedzenie-konca-pro')).toHaveLength(0);
  });

  it('W-07 Pro wygasło (pamięć yearly, sklep pusto): komunikat wygaśnięcia raz, zamknięcie go chowa', async () => {
    await setAppSetting(KLUCZ_PAMIECI, zapisPamieci({ produkty: [PRODUKTY.yearly], wygasa: Date.now() - 1 }));
    const root = await zamontuj(<StartScreen />);
    expect(host(root, 'start-koniec-pro')).toHaveLength(1);
    expect(teksty(root)).toContain('Przypomnienia o dokarmianiu wyłączyły się');
    expect(ekranPro(root)).toBe(false);
    await nacisnij(root, 'koniec-pro-close-btn');
    expect(host(root, 'start-koniec-pro')).toHaveLength(0);
    expect(await getAppSetting(KLUCZ_KONCA_PRO)).toBe('');
    act(() => tree?.unmount());
    _resetStanu();
    const drugi = await zamontuj(<StartScreen />);
    expect(host(drugi, 'start-koniec-pro')).toHaveLength(0);
  });
});

describe('plan wypieku w Basic (BR-HARMO-001…004, BR-KAL-009, BR-KAL-011)', () => {
  it('„gotowe o…” za ekranem Pro, bez „Zaplanuj”; „Zacznij wypiek” prowadzi na Stolnicę bez ekranu Pro', async () => {
    for (const s of await getStarters()) await deleteStarter(s.id);
    const root = await zamontuj(<HarmonogramScreen />);
    expect(host(root, 'blokada-plan-wstecz-tresc')).toHaveLength(1);
    expect(przycisk(root, 'plan-zaplanuj-btn')).toHaveLength(0);
    await nacisnij(root, 'plan-start-bake-btn');
    expect(ekranPro(root)).toBe(false);
    expect(mockPush).toHaveBeenCalledWith(expect.objectContaining({ pathname: '/stolnica' }));
  });

  it('BR-KAL-011 „Dodaj do kalendarza” (Pro): ekran Pro zamiast arkusza udostępniania', async () => {
    const root = await zamontuj(<HarmonogramScreen />);
    await nacisnij(root, 'plan-kalendarz-btn');
    expect(ekranPro(root)).toBe(true);
  });
});

describe('Akademia: dalsze poziomy przez strażnika (BR-NAUK-001)', () => {
  it('rozwinięcie lekcji idzie przez strażnika z poziomem; zwinięcie bez strażnika', async () => {
    const straznik = jest.fn((_poziom: number, otworz: () => void) => otworz());
    const root = await zamontuj(<BreadAcademyModal visible={true} onClose={() => undefined} otworzLekcje={straznik} />);
    await nacisnij(root, 'expand-lesson-btn-2');
    expect(straznik).toHaveBeenCalledTimes(1);
    expect(straznik.mock.calls[0][0]).toBe(2);
    await nacisnij(root, 'expand-lesson-btn-2');
    expect(straznik).toHaveBeenCalledTimes(1);
  });
});

describe('limity Basic na ekranach (W-04, W-05, W-10)', () => {
  const wlasna = (n: number) => ({
    id: `recipe_${n}`, name: `Moja ${n}`, isBuiltIn: false, createdAt: n, targetDDT: 25,
    formula: { flours: [{ name: 'Mąka pszenna chlebowa typ 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 900 },
  });

  it('W-04 szósta receptura: przy 5 własnych „Zapisz jako moją” otwiera ekran Pro; przy 4 okno zapisu', async () => {
    for (let n = 1; n <= 4; n++) await saveRecipe(wlasna(n));
    const root = await zamontuj(<RecepturaScreen />);
    await nacisnij(root, 'save-custom-recipe-btn');
    expect(ekranPro(root)).toBe(false);
    act(() => tree?.unmount());
    await saveRecipe(wlasna(5));
    expect((await getRecipes()).filter((r) => !r.isBuiltIn)).toHaveLength(5);
    const piec = await zamontuj(<RecepturaScreen />);
    await nacisnij(piec, 'save-custom-recipe-btn');
    expect(ekranPro(piec)).toBe(true);
  });

  it('W-05 drugi zakwas: przy jednym „Dodaj zakwas” otwiera ekran Pro', async () => {
    expect(await getStarters()).toHaveLength(1);
    const root = await zamontuj(<ZakwasScreen />);
    await nacisnij(root, 'add-starter-btn');
    expect(ekranPro(root)).toBe(true);
  });

  it('W-10 zakładanie pierwszego zakwasu w Basic: pierwsze dokarmienie tworzy zakwas bez ekranu Pro', async () => {
    for (const s of await getStarters()) await deleteStarter(s.id);
    const root = await zamontuj(<ZakwasScreen />);
    await nacisnij(root, 'zakladanie-pierwsze-dokarmienie-btn');
    expect(ekranPro(root)).toBe(false);
    expect(await getStarters()).toHaveLength(1);
  });
});
