/**
 * Ekran Pro, oznaczenie „Pro” i Ustawienia zakupów [M3 P-b, D-117]: ujawnienia 1–5 kontraktu (docs/monetyzacja.md
 * „Ujawnienia dla roli 04”) z ceną z atrapy sklepu (displayPrice), bez zakazanych wzorców; P1-4 przeglądu P-a: ekran Pro
 * nie obiecuje funkcji Basic; P2-4: funkcja Pro widoczna z oznaczeniem „Pro” tekstem (VoiceOver „{funkcja}, Pro”), bez
 * kłódki, stuknięcie otwiera ekran Pro (BR-ZAK-005 Funkcja Pro); Ustawienia: wejście do ekranu Pro, „Przywróć zakupy”,
 * „Zarządzaj subskrypcją”, „Zrealizuj kod” (kontrakt „Reguły dostępu”).
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 34 }),
  };
});
jest.mock('expo-router', () => {
  const React = require('react');
  const nawigacja = { push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() };
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
import { ActionSheetIOS, Alert, Linking, Modal, Text, View } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Iap from 'expo-iap';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import RecepturaScreen from '../../app/(tabs)/receptury/receptura';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { PaywallModal } from '../components/PaywallModal';
import { SettingsModal } from '../components/SettingsModal';
import { initDatabase, _resetMemStore, saveBakeLog } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { deleteBakeSession, loadPlannedBakes, savePlannedBake, type PlannedBake } from '../data/bake-sessions-store';
import { planBakeSteps } from '../core/bake-steps';
import { localDateKey } from '../core/dzien-lokalny';
import { _resetStanu } from '../lib/platnosci/stan';
import { ustawEkranZakupu } from '../lib/platnosci/ekran';
import { PRODUKTY } from '../lib/platnosci/konfiguracja';
import { ustawDzienGotowe } from '../lib/plan-receptury';
import { APPLE_EULA_URL, PRIVACY_URL } from '../lib/links';
import { setLang, t } from '../lib/i18n';
import { mockIap, zUprawnieniem } from '../../tests/helpers/platnosci';

const H = 3_600_000;
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const tekstWezla = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(tekstWezla).join('');
  if (n && typeof n === 'object' && 'props' in n) return tekstWezla((n as { props: { children?: unknown } }).props.children);
  return '';
};
const teksty = (root: renderer.ReactTestInstance) => root.findAllByType(Text).map(tekstWezla);
const caly = (root: renderer.ReactTestInstance) => teksty(root).join(' | ');
const ekranPro = (root: renderer.ReactTestInstance) => root.findAllByType(PaywallModal).some((p) => p.props.visible === true);
const przyciski = (root: renderer.ReactTestInstance, testID: string) =>
  root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
const jeden = (root: renderer.ReactTestInstance, testID: string) => {
  const p = przyciski(root, testID);
  expect({ testID, jest: p.length > 0 }).toEqual({ testID, jest: true });
  return p[p.length - 1];
};
const nacisnij = async (root: renderer.ReactTestInstance, testID: string) => {
  const p = jeden(root, testID);
  await act(async () => p.props.onPress());
  await flush();
};
const host = (root: renderer.ReactTestInstance, testID: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === testID);
/** Oznaczenie „Pro” tekstem (nie samym kolorem) w węźle. */
const maOznaczenie = (n: renderer.ReactTestInstance) => n.findAll((x) => x.props?.testID === 'oznaczenie-pro').length > 0 && teksty(n).includes(t('Pro'));

// Teksty ekranu Pro (klucze PL; przekład: czeka-na-przeklad, przebieg a5)
const OPIS = 'Basic zostaje bezpłatny na zawsze. Pro dodaje planowanie, opiekę nad zakwasem, więcej zakwasów i receptur.';
const OBSZARY = [
  'Planowanie: plan wstecz od godziny „gotowe” z ochroną snu i czasem fermentacji z temperatury, wypieki na kolejne dni, dwa wypieki naraz, widok miesiąca i plan w kalendarzu telefonu.',
  'Zakwas: przypomnienia o dokarmianiu, proporcje dokarmiania, gotowość zakwasu do ciasta, stały dzień karmienia w lodówce i kolejne zakwasy.',
  'Liczenie: zaczyn poolish, biga, stare ciasto albo levain w recepturze.',
  'Receptury i Dziennik: więcej własnych receptur, porównanie i statystyki wypieków.',
];
const DOZYWOTNI = 'Jedna opłata, bez odnawiania.';
const ODNAWIANIE = 'Subskrypcja odnawia się sama, dopóki jej nie anulujesz: w Ustawieniach stuknij swoje imię i nazwisko, potem Subskrypcje.';
/** P1-4: funkcje Basic (kontrakt „Basic i Pro według funkcji”) nie są obietnicą ekranu Pro. */
const FUNKCJE_BASIC = ['Liczenie receptur', 'prowadzenie z powiadomieniami', 'zakwasy i dziennik', 'Bez reklam', 'kalkulator', 'prowadzenie wypieku', 'założenie zakwasu', 'Doktor', 'eksport', 'historia'];
/** Zakazane wzorce kontraktu (odliczanie, pilność, „najpopularniejszy”, oszczędność, ocena, „No subscriptions”, próba). */
const ZAKAZANE_PL = [/odlicz/i, /tylko dziś/i, /ostatni/i, /najpopularniejsz/i, /oszczęd/i, /\d\s?%/, /zwraca się/i, /oceń/i, /No subscriptions/i, /free trial/i, /próbn/i, /próby/i, /Odblokuj/i, /Nie, dziękuję/i, /żałuj/i];
const ZAKAZANE_EN = [/countdown/i, /today only/i, /last chance/i, /most popular/i, /save \d/i, /\d\s?%/, /pays for itself/i, /rate us/i, /no subscriptions/i, /free trial/i, /trial/i, /unlock/i];

function produkty() {
  mockIap.products = [
    { id: PRODUKTY.monthly, displayPrice: '4,99 zł', type: 'subs', subscriptionGroupIdIOS: 'g1', subscriptionOffers: [] },
    { id: PRODUKTY.yearly, displayPrice: '29,99 zł', type: 'subs', subscriptionGroupIdIOS: 'g1', subscriptionOffers: [] },
    { id: PRODUKTY.lifetime, displayPrice: '79,99 zł', type: 'in-app' },
  ];
}

let tree: renderer.ReactTestRenderer | null = null;
async function zamontuj(el: React.ReactElement) {
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree!.root;
}
async function ekranZakupu(onClose: () => void = () => undefined) {
  await act(async () => {
    tree = renderer.create(<PaywallModal visible={true} onClose={onClose} onSubscribe={() => undefined} onRestore={() => false} />);
  });
  await flush();
  return tree!.root;
}

let alertSpy: jest.SpyInstance;
beforeEach(async () => {
  jest.clearAllMocks();
  _resetMemStore();
  mockIap.reset(); // bez Pro
  _resetStanu();
  ustawEkranZakupu(false);
  ustawDzienGotowe(null);
  setLang('pl');
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

describe('ekran Pro: ujawnienia 1–5 kontraktu z ceną ze sklepu (BR-ZAK-003, BR-ZAK-005 Funkcja Pro)', () => {
  it('1: nazwa planu, okres i cena z displayPrice; krótki opis bez liczb', async () => {
    produkty();
    const root = await ekranZakupu();
    for (const n of ['Roczny', 'Miesięczny', 'Dożywotni']) expect(teksty(root)).toContain(t(n));
    expect(caly(root)).toContain(t('{cena} rocznie', { cena: '29,99 zł' }));
    expect(caly(root)).toContain(t('{cena} miesięcznie', { cena: '4,99 zł' }));
    expect(caly(root)).toContain(t('{cena} jednorazowo', { cena: '79,99 zł' }));
    const opis = tekstWezla(root.findAll((n) => n.props?.testID === 'pro-opis' && n.type === Text)[0]);
    expect(opis).toBe(t(OPIS));
    expect(opis).not.toMatch(/\d/);
  });

  it('1 (PRZ-28, 320 pt): opcje z cenami stoją przed „Co daje Pro” i przed ujawnieniami; cena przed paskiem kciuka', async () => {
    produkty();
    const root = await ekranZakupu();
    const kolejnosc = root.findAll((n) => typeof n.type === 'string' && typeof n.props?.testID === 'string').map((n) => n.props.testID as string);
    const poz = (id: string) => kolejnosc.indexOf(id);
    expect(poz('pro-opis')).toBeGreaterThanOrEqual(0);
    expect(poz('plan-yearly-btn')).toBeGreaterThan(poz('pro-opis'));
    expect(poz('pro-obszary')).toBeGreaterThan(poz('plan-lifetime-btn'));
    expect(poz('subscription-terms')).toBeGreaterThan(poz('pro-obszary'));
  });

  it('2: odnawianie i jak anulować, „Przywróć zakupy”, Warunki (EULA Apple) i Polityka prywatności', async () => {
    produkty();
    const otworz = jest.spyOn(Linking, 'openURL').mockResolvedValue(true);
    const root = await ekranZakupu();
    expect(caly(root)).toContain(t(ODNAWIANIE));
    expect(przyciski(root, 'restore-purchases-btn').length).toBeGreaterThan(0);
    await nacisnij(root, 'terms-of-use-btn');
    await nacisnij(root, 'privacy-policy-btn');
    expect(otworz.mock.calls.map((c) => c[0])).toEqual([APPLE_EULA_URL, PRIVACY_URL]);
    otworz.mockRestore();
  });

  it('3 (P1-4): co daje Pro wobec Basic jednym zdaniem na obszar; bez funkcji Basic jako Pro', async () => {
    produkty();
    const root = await ekranZakupu();
    const obszary = root.findAll((n) => n.props?.testID === 'pro-obszary' && typeof n.type === 'string')[0];
    expect(obszary).toBeDefined();
    expect(teksty(obszary)).toEqual([t('Co daje Pro'), ...OBSZARY.map((z) => t(z))]);
    const wszystko = caly(root);
    for (const f of FUNKCJE_BASIC) expect({ f, jest: wszystko.includes(f) }).toEqual({ f, jest: false });
  });

  it('4: dożywotni — jedna opłata, bez odnawiania, w opcji planu i w etykiecie VoiceOver', async () => {
    produkty();
    const root = await ekranZakupu();
    const opcja = jeden(root, 'plan-lifetime-btn');
    expect(teksty(opcja)).toContain(t(DOZYWOTNI));
    expect(opcja.props.accessibilityLabel).toContain(t(DOZYWOTNI));
    expect(teksty(jeden(root, 'plan-yearly-btn'))).not.toContain(t(DOZYWOTNI));
  });

  it('5: widoczne „Zamknij” i neutralna odmowa bez pytania; bez sieci: zakup i przywracanie wymagają połączenia z App Store', async () => {
    produkty();
    const zamknij = jest.fn();
    const root = await ekranZakupu(zamknij);
    expect(caly(root)).toContain(t('Zakup wymaga połączenia z App Store.'));
    await nacisnij(root, 'close-modal');
    expect(zamknij).toHaveBeenCalledTimes(1);
    expect(alertSpy).not.toHaveBeenCalled();
    act(() => tree?.unmount());
    mockIap.failProducts = true;
    const bez = await ekranZakupu();
    expect(tekstWezla(bez.findAll((n) => n.props?.testID === 'offer-no-connection' && n.type === Text)[0])).toContain(t('Nie ma połączenia z App Store, więc zakup i przywrócenie zakupów teraz się nie udadzą. Reszta aplikacji działa jak dotąd. Sprawdź internet i spróbuj ponownie.'));
  });

  it.each([['pl', ZAKAZANE_PL], ['en', ZAKAZANE_EN]] as const)('zakazane wzorce (%s): brak fraz z listy na ekranie Pro', async (jezyk, lista) => {
    setLang(jezyk);
    produkty();
    const root = await ekranZakupu();
    const wszystko = caly(root);
    for (const wzor of lista) expect({ wzor: String(wzor), jest: wzor.test(wszystko) }).toEqual({ wzor: String(wzor), jest: false });
  });

  it('subskrybent: ekran Pro (z Ustawień) mówi, że Pro jest aktywne, i ma „Zarządzaj subskrypcją” (showManageSubscriptionsIOS); bez zakupu', async () => {
    zUprawnieniem();
    produkty();
    const root = await zamontuj(<View />);
    act(() => ustawEkranZakupu(true));
    await flush();
    expect(ekranPro(root)).toBe(true);
    expect(teksty(root)).toContain(t('Piekarz Pro jest aktywny.'));
    expect(przyciski(root, 'plan-yearly-btn')).toHaveLength(0);
    expect(przyciski(root, 'subscribe-submit-btn')).toHaveLength(0);
    await nacisnij(root, 'pro-manage-btn');
    expect(Iap.deepLinkToSubscriptions).toHaveBeenCalledTimes(1);
  });

  it('dożywotni: ekran Pro aktywny bez „Zarządzaj subskrypcją”', async () => {
    mockIap.reset();
    mockIap.entitlements = [{ id: 'tx_l', transactionId: 'tx_l', productId: PRODUKTY.lifetime, purchaseState: 'purchased', transactionDate: 1 }];
    _resetStanu();
    const root = await zamontuj(<View />);
    act(() => ustawEkranZakupu(true));
    await flush();
    expect(teksty(root)).toContain(t('Piekarz Pro jest aktywny.'));
    expect(przyciski(root, 'pro-manage-btn')).toHaveLength(0);
  });
});

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

describe('oznaczenie „Pro” zamiast kłódki (P2-4; BR-ZAK-005 Funkcja Pro, BR-ZAK-004 Po końcu Pro)', () => {
  /** Blokada funkcji Pro: wiersz z nazwą i „Pro”, etykieta „{funkcja}, Pro”, bez kłódki i „Odblokuj”; stuknięcie → ekran Pro. */
  async function sprawdzBlokade(root: renderer.ReactTestInstance, funkcja: string, nazwa: string, podglad: boolean) {
    const wiersz = jeden(root, `blokada-${funkcja}`);
    expect(wiersz.props.accessibilityLabel).toBe(t('{funkcja}, Pro', { funkcja: t(nazwa) }));
    expect(maOznaczenie(wiersz)).toBe(true);
    expect(teksty(wiersz)).toContain(t(nazwa));
    expect(wiersz.findAll((n) => n.props?.nazwa === 'zamek')).toHaveLength(0);
    expect(caly(root)).not.toContain(t('Odblokuj pełny dostęp'));
    expect(host(root, `blokada-${funkcja}-tresc`).length > 0).toBe(podglad);
    await act(async () => wiersz.props.onPress());
    await flush();
    expect(ekranPro(root)).toBe(true);
    act(() => ustawEkranZakupu(false));
  }

  it('Zakwasy: gotowość i proporcje bez treści Pro, z nazwą i „Pro”; „Dodaj nowy zakwas” przy jednym zakwasie z „Pro”', async () => {
    const root = await zamontuj(<ZakwasScreen />);
    await sprawdzBlokade(root, 'proporcje-zakwasu', 'Proporcje dokarmiania', false);
    await sprawdzBlokade(root, 'gotowosc-zakwasu', 'Gotowość zakwasu do ciasta', false);
    const dodaj = jeden(root, 'add-starter-btn');
    expect(maOznaczenie(dodaj)).toBe(true);
    expect(dodaj.props.accessibilityLabel).toBe(t('{funkcja}, Pro', { funkcja: t('Dodaj nowy zakwas') }));
  });

  it('Plan wypieku: „gotowe o…” z nazwą i „Pro”, plan od teraz widoczny; „Dodaj do kalendarza” z „Pro”', async () => {
    const root = await zamontuj(<HarmonogramScreen />);
    await sprawdzBlokade(root, 'plan-wstecz', 'Plan wstecz od godziny „gotowe”', true);
    const kal = jeden(root, 'plan-kalendarz-btn');
    expect(maOznaczenie(kal)).toBe(true);
    expect(kal.props.accessibilityLabel).toBe(t('{funkcja}, Pro', { funkcja: t('Dodaj do kalendarza') }));
  });

  it('Dziennik: porównanie i statystyki bez treści, z nazwą i „Pro”; wpisy w Basic', async () => {
    await saveBakeLog({ id: 'bake_pb', recipeName: 'Chleb z historii', startedAt: 1, finishedAt: 2, ratingStars: 4 });
    const root = await zamontuj(<DziennikScreen />);
    expect(caly(root)).toContain('Chleb z historii');
    await sprawdzBlokade(root, 'porownanie', 'Porównanie i statystyki', false);
  });

  it('Dziś: „Miesiąc” i „Zaplanuj wypiek na ten dzień” z „Pro”; z Pro bez oznaczenia', async () => {
    const root = await zamontuj(<StartScreen />);
    const miesiac = jeden(root, 'kalendarz-tryb-miesiac');
    expect(maOznaczenie(miesiac)).toBe(true);
    expect(miesiac.props.accessibilityLabel).toBe(t('{funkcja}, Pro', { funkcja: t('Miesiąc') }));
    expect(root.findAll((n) => n.props.testID === 'kalendarz-tryb-tydzien')).toHaveLength(0);
    await nacisnij(root, `pasek-dzien-${localDateKey(Date.now() + 24 * H)}`);
    const skrot = jeden(root, 'arkusz-zaplanuj-btn');
    expect(maOznaczenie(skrot)).toBe(true);
    expect(skrot.props.accessibilityLabel).toBe(t('{funkcja}, Pro', { funkcja: t('Zaplanuj wypiek na ten dzień') }));
    act(() => tree?.unmount());

    zUprawnieniem();
    const zPro = await zamontuj(<StartScreen />);
    expect(maOznaczenie(jeden(zPro, 'kalendarz-tryb-miesiac'))).toBe(false);
  });

  it('„Prowadź oba” (dwa wypieki naraz, Pro) w pytaniu przy starcie ma „Pro” w tekście', async () => {
    await saveBakeSession(wypiek('bake_chleb', 'Chleb'));
    await savePlannedBake(plan('plan_teraz', 'Pizza', Date.now() - H));
    const root = await zamontuj(<StartScreen />);
    await nacisnij(root, 'plan-wiersz-plan_teraz');
    await nacisnij(root, 'plan-zacznij-btn');
    const [, , pytanie] = alertSpy.mock.calls[alertSpy.mock.calls.length - 1] as [string, string, { text: string }[]];
    expect(pytanie[0].text).toBe(t('{funkcja}, Pro', { funkcja: t('Prowadź oba') }));
  });

  it('Składniki: zaczyn poolish, biga, stare ciasto, levain z „Pro” w menu; ciasto bezpośrednie bez', async () => {
    const menu = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation(() => {});
    const root = await zamontuj(<RecepturaScreen />);
    await nacisnij(root, 'edit-ingredients-btn');
    const wiersz = jeden(root, 'preferment-type-btn');
    expect(maOznaczenie(wiersz)).toBe(true);
    await nacisnij(root, 'preferment-type-btn');
    const opcje = (menu.mock.calls[menu.mock.calls.length - 1][0] as { options: string[] }).options;
    expect(opcje.filter((o) => o.endsWith(', Pro'))).toHaveLength(4);
    expect(opcje[0].endsWith(', Pro')).toBe(false);
    menu.mockRestore();
  });
});

describe('Ustawienia: wejście do ekranu Pro, przywracanie, zarządzanie, „Zrealizuj kod” (kontrakt „Reguły dostępu”)', () => {
  it('„Piekarz Pro” zamyka Ustawienia i po ich zamknięciu otwiera ekran Pro', async () => {
    const zamknij = jest.fn();
    const root = await zamontuj(<SettingsModal visible={true} onClose={zamknij} />);
    expect(przyciski(root, 'settings-restore-purchases-btn').length).toBeGreaterThan(0);
    expect(przyciski(root, 'settings-manage-subscriptions-btn').length).toBeGreaterThan(0);
    await nacisnij(root, 'settings-pro-btn');
    expect(zamknij).toHaveBeenCalledTimes(1);
    const ustawienia = root.findAllByType(Modal).find((m) => m.props.presentationStyle === 'pageSheet');
    await act(async () => ustawienia?.props.onDismiss?.());
    await flush();
    expect(ekranPro(root)).toBe(true);
  });

  it('04-studio-projektowe-006: zsunięcie arkusza Ustawień (onRequestClose) zamyka je jak „Zamknij”, bez ekranu Pro', async () => {
    const zamknij = jest.fn();
    const root = await zamontuj(<SettingsModal visible={true} onClose={zamknij} />);
    const ustawienia = root.findAllByType(Modal).find((m) => m.props.presentationStyle === 'pageSheet');
    await act(async () => ustawienia?.props.onRequestClose?.());
    expect(zamknij).toHaveBeenCalledTimes(1);
    await act(async () => ustawienia?.props.onDismiss?.());
    await flush();
    expect(ekranPro(root)).toBe(false);
  });

  it('„Zrealizuj kod” otwiera systemowy arkusz realizacji kodu; błąd: komunikat o połączeniu z App Store', async () => {
    const root = await zamontuj(<SettingsModal visible={true} onClose={() => undefined} />);
    await nacisnij(root, 'settings-redeem-btn');
    expect(Iap.openRedeemOfferCode).toHaveBeenCalledTimes(1);
    expect(alertSpy).not.toHaveBeenCalled();
    (Iap.openRedeemOfferCode as jest.Mock).mockRejectedValueOnce(new Error('offline'));
    await nacisnij(root, 'settings-redeem-btn');
    expect(alertSpy).toHaveBeenCalledWith(t('Zrealizuj kod'), t('Nie udało się otworzyć realizacji kodu. Realizacja kodu wymaga połączenia z App Store: sprawdź internet i spróbuj ponownie.'));
  });

  it('przypomnienia o karmieniu w Basic: informacja, że przypomnienia gotowego zakwasu są w Pro; z Pro bez niej', async () => {
    const info = 'Przypomnienia o dokarmianiu gotowego zakwasu są w Piekarz Pro. W czasie zakładania zakwasu przychodzą bez Pro.';
    const root = await zamontuj(<SettingsModal visible={true} onClose={() => undefined} />);
    expect(teksty(root)).toContain(t(info));
    act(() => tree?.unmount());
    zUprawnieniem();
    const zPro = await zamontuj(<SettingsModal visible={true} onClose={() => undefined} />);
    expect(teksty(zPro)).not.toContain(t(info));
  });
});
