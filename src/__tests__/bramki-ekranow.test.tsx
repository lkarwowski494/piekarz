/**
 * Jeden strażnik na każdym ekranie [M1-audytor-generalny-027; 02-monetyzacja-010, 02-monetyzacja-011, 02-monetyzacja-012,
 * 01-odkrywanie-009]. Przepisane z kontraktu D-038 („bez zakupu tylko historia i dane”) na kontrakt Basic/Pro
 * (docs/monetyzacja.md, D-112, D-113, D-116) [M3 P-a]: bez Piekarz Pro działa Basic (liczenie, plan bez „gotowe o…”,
 * prowadzenie wypieku, pierwszy zakwas z kartą i zapisem karmień, Doktor, dziennik, dane); funkcje Pro (lista
 * w konfiguracji) są widoczne i otwierają ekran Pro. Z Pro — nic nie jest zamknięte.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
jest.mock('../lib/pdf-sheet-generator', () => ({
  exportStarterLabelAsPdf: jest.fn().mockResolvedValue('file:///mock/label.pdf'),
  printStarterLabelDirectly: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../lib/confirm', () => ({
  ...jest.requireActual('../lib/confirm'),
  confirmDeleteRecipe: (_n: string, ok: () => void) => ok(),
  confirmDeleteStarter: (_n: string, ok: () => void) => ok(),
  confirmResetStarter: (ok: () => void) => ok(),
  confirmDeleteBakeLog: (ok: () => void) => ok(),
  confirmDiscardBake: (ok: () => void) => ok(),
}));
// Wejścia do Doktora zakwasu (nagłówek Zakwasów: `router`, karta cyklu: `useRouter`) zapisują trasę w jednym miejscu
// [M1-audytor-generalny-027; 02-monetyzacja-503]
const mockNawigacja = { push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn() };
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    get router() {
      return mockNawigacja;
    },
    useRouter: () => mockNawigacja,
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
    Stack: Object.assign(({ children }: { children: React.ReactNode }) => React.createElement(React.Fragment, null, children), {
      Screen: ({ options }: { options?: { headerRight?: (p: object) => React.ReactNode } }) =>
        options && options.headerRight ? React.createElement(React.Fragment, null, options.headerRight({})) : null,
    }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
// Ekran receptury (push z listy receptur, design-spec 11c 106) [M1-audytor-generalny-106]
import CalculatorScreen from '../../app/(tabs)/receptury/receptura';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import StolnicaScreen from '../../app/stolnica';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import { zacznijWypiekBezReceptury } from '../../tests/helpers/wypiek';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import DoctorScreen from '../../app/doktor';
import DoktorZakwasuScreen from '../../app/(tabs)/zakwasy/doktor-zakwasu';
import { evaluateSourdoughSafety } from '../core/sourdough-physics';
import { PaywallModal } from '../components/PaywallModal';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { BlokadaFunkcji } from '../components/BlokadaFunkcji';
import { ImportRecepturySection } from '../components/settings/ImportRecepturySection';
import { biezaceMenuReceptury } from '../lib/menu-receptury';
import { initDatabase, _resetMemStore, saveBakeLog, getBakeLogs, getStarters, deleteStarter } from '../data/sqlite-store';
import { BASIC, Funkcja } from '../lib/platnosci/konfiguracja';
import { dozwolona } from '../lib/platnosci/dostep';
import { t } from '../lib/i18n';
import { zUprawnieniem, bezUprawnienia } from '../../tests/helpers/platnosci';

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};
const paywallShown = (root: renderer.ReactTestInstance) => root.findAllByType(PaywallModal).some((p) => p.props.visible === true);
const locks = (root: renderer.ReactTestInstance) =>
  root.findAll((n) => typeof n.props?.testID === 'string' && n.props.testID.startsWith('blokada-') && typeof n.props.onPress === 'function');

// Ekran zakupu jest jeden dla aplikacji i renderuje go AppAccessProvider z app/_layout.tsx [M1-audytor-generalny-025].
async function render(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider>{el}</AppAccessProvider>);
  });
  await flush();
  return tree!;
}

async function press(tree: renderer.ReactTestRenderer, testID: string): Promise<void> {
  // Ostatni element z testID: przycisk poza zablokowanym obszarem (np. „start-bake-btn” jest też w karcie kalkulatora).
  const all = tree.root.findAll((n) => n.props?.testID === testID && typeof n.props.onPress === 'function');
  await act(async () => {
    all[all.length - 1].props.onPress();
  });
  await flush();
}

describe('The Basic list is one configuration (027, D-112, D-113)', () => {
  // Import kopii i receptury z pliku działa zawsze (D-039) [M1-audytor-generalny-026]
  it('Basic: learning, basic tools, journal and data; Pro functions need the App Store entitlement', () => {
    expect([...BASIC]).toEqual(['historia', 'dane', 'import', 'kalkulator', 'harmonogram', 'stolnica', 'zakwas', 'doktor', 'receptury', 'akademia']);
    for (const f of BASIC) expect({ f, bez: dozwolona(f, false) }).toEqual({ f, bez: true });
    const pro: Funkcja[] = ['plan-wstecz', 'plany-przyszle', 'dwa-wypieki', 'zaczyn', 'porownanie', 'druk', 'qr-wysylanie', 'spizarnia', 'akademia-dalej', 'kolejny-zakwas'];
    for (const f of pro) expect({ f, bez: dozwolona(f, false), z: dozwolona(f, true) }).toEqual({ f, bez: false, z: true });
    expect(dozwolona('spizarnia', false, ['spizarnia'])).toBe(true);
  });
});

describe('Without Pro the Basic part works and Pro functions open the Pro screen (027, D-112, D-113)', () => {
  beforeEach(async () => {
    _resetMemStore();
    bezUprawnienia();
    await initDatabase();
  });

  it('Kalkulator: calculating, "Ułóż plan", water temperature and ingredients work without the Pro screen; import, export and copy stay free (BR-ZAK-005 Pierwsze użycie kalkulatora, Historia i eksport)', async () => {
    const tree = await render(<CalculatorScreen />);
    expect(locks(tree.root)).toEqual([]);
    // Drukuj (F-50) i QR (F-08) poza 1.0, wejścia ukryte (D-043) [M1-audytor-generalny-072, -049]
    for (const ukryte of ['print-menu-btn', 'share-recipe-qr-btn', 'open-scan-qr-btn']) {
      expect(tree.root.findAll((n) => n.props?.testID === ukryte)).toEqual([]);
    }
    // Spiżarnia mąk (F-30) PÓŹNIEJ, wejście ukryte (D-043) [M1-audytor-generalny-097]
    expect(tree.root.findAll((n) => n.props?.testID === 'open-flour-inventory-btn').map((n) => String(n.props.testID))).toEqual([]);
    // Przelicznik objętości (F-45) PÓŹNIEJ, wejście ukryte [M1-audytor-generalny-098]
    expect(tree.root.findAll((n) => n.props?.testID === 'open-volume-converter-btn').map((n) => String(n.props.testID))).toEqual([]);
    // 4 akcje receptury (057) w Basic; zapis pierwszej własnej receptury poniżej limitu 5 (szósta: basic-pro-pa.test.tsx)
    for (const id of ['save-custom-recipe-btn', 'start-bake-btn', 'water-temp-btn', 'edit-ingredients-btn']) {
      await press(tree, id);
      expect({ id, paywall: paywallShown(tree.root) }).toEqual({ id, paywall: false });
    }
    // Kopiowanie i plik receptury z menu „Więcej” (057) bez ekranu zakupu
    for (const id of ['copy-recipe-btn', 'export-recipe-json-btn']) {
      await act(async () => {
        biezaceMenuReceptury().find((p) => p.id === id)!.akcja();
      });
      await flush();
      expect({ id, paywall: paywallShown(tree.root) }).toEqual({ id, paywall: false });
    }
    // Import receptury tylko w Ustawieniach (F-33, 057), bez ekranu zakupu (D-039)
    expect(tree.root.findAll((n) => n.props?.testID === 'import-recipe-json-btn' || n.props?.testID === 'open-import-recipe-btn').map((n) => String(n.props.testID))).toEqual([]);
    act(() => tree.unmount());
    const ustawienia = await render(<ImportRecepturySection />);
    await press(ustawienia, 'import-file-btn');
    expect(paywallShown(ustawienia.root)).toBe(false);
    act(() => ustawienia.unmount());
  });

  // Etykieta PDF przeniesiona do „Drukuj” w Kalkulatorze, Pro (BR-DRUK-001) [M1-audytor-generalny-032]
  // Kontrola bezpieczeństwa (RD-21) jest poza blokadą: src/__tests__/karta-bezpieczenstwa-bez-zakupu-e1.test.tsx [audyt-niezalezny E-1]
  it('Zakwas: the first starter is added without the Pro screen; readiness and feeding ratios are Pro; no print entry here (BR-ZAKW-005, BR-ZAKW-002, -003)', async () => {
    // Zakwas pokazowy w pamięci (lodówka): jeden zakwas, więc drugi to Pro (W-05)
    const tree = await render(<ZakwasScreen />);
    const zamki = locks(tree.root).map((n) => n.props.testID);
    expect(zamki).not.toContain('blokada-zakwas');
    expect(zamki).toEqual(expect.arrayContaining(['blokada-gotowosc-zakwasu', 'blokada-staly-dzien', 'blokada-proporcje-zakwasu']));
    await press(tree, 'blokada-proporcje-zakwasu');
    expect(paywallShown(tree.root)).toBe(true);
    await act(async () => {
      tree.root.findByType(PaywallModal).props.onClose();
    });
    await press(tree, 'add-starter-btn');
    expect(paywallShown(tree.root)).toBe(true);
    await act(async () => {
      tree.root.findByType(PaywallModal).props.onClose();
    });
    expect(tree.root.findAllByProps({ testID: 'print-starter-label-btn' })).toHaveLength(0);
    act(() => tree.unmount());
    for (const s of await getStarters()) await deleteStarter(s.id);
    const pusty = await render(<ZakwasScreen />);
    await press(pusty, 'add-starter-btn');
    expect(paywallShown(pusty.root)).toBe(false);
    act(() => pusty.unmount());
  });

  // Stolnica bez wypieku przekierowuje na Dziś, historia jest w Dzienniku [M1-audytor-generalny-117]
  // Prowadzenie wypieku to Basic (BR-ETAP-001…006): bez kłódki także wypiek zaczęty bez Pro (D-112)
  it('Stolnica: no bake means nothing to lock; history is readable and deletable in Dziennik; a running bake started without Pro has no lock (BR-RECP-003)', async () => {
    await saveBakeLog({ id: 'bake_h1', recipeName: 'Chleb z historii', startedAt: 1, finishedAt: 2, ratingStars: 4 });
    const pusta = await render(<StolnicaScreen />);
    expect(locks(pusta.root)).toEqual([]);
    act(() => pusta.unmount());
    const tree = await render(<DziennikScreen />);
    expect(tree.root.findAllByProps({ testID: 'bake-log-card-bake_h1' }).length).toBeGreaterThan(0);
    await press(tree, 'delete-bake-log-bake_h1');
    expect(paywallShown(tree.root)).toBe(false);
    expect((await getBakeLogs()).some((b) => b.id === 'bake_h1')).toBe(false);
    act(() => tree.unmount());
    await zacznijWypiekBezReceptury(Date.now(), { zaczetyZDostepem: false });
    const trwa = await render(<StolnicaScreen />);
    expect(locks(trwa.root)).toEqual([]);
    expect(paywallShown(trwa.root)).toBe(false);
    act(() => trwa.unmount());
  });

  // Plan w Basic: start bez „gotowe o…” (PR-02 „start wypieku bez planu”); plan wstecz za ekranem Pro (BR-HARMO-001…003)
  it('Harmonogram: "ready at…" opens the Pro screen, the start works in Basic and "Zaplanuj" is not offered', async () => {
    const tree = await render(<HarmonogramScreen />);
    expect(locks(tree.root).map((n) => n.props.testID)).toEqual(['blokada-plan-wstecz']);
    // Zmienione w M3 P-b (D-117): kłódka „Odblokuj pełny dostęp” zastąpiona oznaczeniem „Pro” z nazwą funkcji (P2-4)
    expect(locks(tree.root)[0].props.accessibilityLabel).toBe(t('{funkcja}, Pro', { funkcja: t('Plan wstecz od godziny „gotowe”') }));
    expect(tree.root.findAllByProps({ testID: 'plan-zaplanuj-btn' })).toHaveLength(0);
    await press(tree, 'blokada-plan-wstecz');
    expect(paywallShown(tree.root)).toBe(true);
    act(() => tree.unmount());
  });

  // 100: Akademia nie ma wejścia w 1.0 (wejścia-później 'akademia'); Doktor w Basic (BR-DIAG-001, -003…005)
  it('Doktor: diagnosis works without the Pro screen; the academy has no entry in 1.0', async () => {
    const tree = await render(<DoctorScreen />);
    expect(locks(tree.root)).toEqual([]);
    expect(tree.root.findAllByProps({ testID: 'open-academy-btn' })).toHaveLength(0);
    act(() => tree.unmount());
  });

  // Kontrakt docs/monetyzacja.md (Basic: BR-DIAG-002, ostrzeżenie RD-21) [M1-audytor-generalny-027; 02-monetyzacja-503].
  // Oba wejścia prowadzą na ekran; diagnoza i ostrzeżenie o plamach w Basic.
  it('Doktor zakwasu: the Zakwasy header and "Coś mnie niepokoi" open it; every symptom gives advice without the Pro screen, the spots and mould warning (RD-21) too (BR-DIAG-002)', async () => {
    const trasa = () => [mockNawigacja.push.mock.calls[mockNawigacja.push.mock.calls.length - 1]?.[0]].map((a: unknown) => (typeof a === 'string' ? a : (a as { pathname?: string } | undefined)?.pathname));
    mockNawigacja.push.mockClear();
    // M3 D10: skrót „Doktor” na pasie karty zakwasu (dawniej w natywnym nagłówku stosu)
    const naglowek = await render(<ZakwasScreen />);
    await press(naglowek, 'zakwas-doctor-shortcut-btn');
    expect({ trasa: trasa(), paywall: paywallShown(naglowek.root) }).toEqual({ trasa: ['/zakwasy/doktor-zakwasu'], paywall: false });
    act(() => naglowek.unmount());
    mockNawigacja.push.mockClear();
    const karta = await render(<ZakwasScreen />);
    await press(karta, 'zakwas-niepokoi-btn');
    expect({ trasa: trasa(), paywall: paywallShown(karta.root) }).toEqual({ trasa: ['/zakwasy/doktor-zakwasu'], paywall: false });
    act(() => karta.unmount());

    const tree = await render(<DoktorZakwasuScreen />);
    expect(locks(tree.root)).toEqual([]);
    for (const s of ['no_activity', 'no_doubling', 'long_unfed']) {
      await press(tree, `doktor-zakwasu-objaw-${s}`);
      const porada = tree.root.findAll((n) => typeof n.props?.testID === 'string' && /^doktor-zakwasu-(first_day|no_doubling|long_unfed)$/.test(n.props.testID));
      expect({ s, paywall: paywallShown(tree.root), porada: porada.length > 0 }).toEqual({ s, paywall: false, porada: true });
      await press(tree, `doktor-zakwasu-objaw-${s}`); // drugie dotknięcie zwija objaw
    }
    // Wiersz plam nigdy w obszarze blokady
    const wBlokadzie = tree.root.findAllByType(BlokadaFunkcji).some((b) => b.findAll((n) => n.props?.testID === 'doktor-zakwasu-objaw-mold_signs').length > 0);
    expect(wBlokadzie).toBe(false);
    await press(tree, 'doktor-zakwasu-objaw-mold_signs');
    expect(paywallShown(tree.root)).toBe(false);
    expect(tree.root.findAll((n) => n.props?.testID === 'doktor-zakwasu-wyrzuc' && n.props.accessibilityRole === 'alert').length).toBeGreaterThan(0);
    const d = evaluateSourdoughSafety({ hasColoredSpots: true });
    const teksty = tree.root.findAll((n) => typeof n.props?.children === 'string').map((n) => n.props.children as string).join(' | ');
    expect(teksty).toContain(t(d.actionPl));
    act(() => tree.unmount());
  });
});

describe('With Pro (subscription or lifetime) nothing is locked (027) (BR-RECP-001 Bez ukrywania receptur, BR-ZAK-001)', () => {
  beforeEach(async () => {
    _resetMemStore();
    zUprawnieniem();
    await initDatabase();
  });

  it.each([
    ['Kalkulator', <CalculatorScreen key="k" />],
    ['Zakwas', <ZakwasScreen key="z" />],
    ['Stolnica', <StolnicaScreen key="s" />],
    ['Harmonogram', <HarmonogramScreen key="h" />],
    ['Doktor', <DoctorScreen key="d" />],
    ['Doktor zakwasu', <DoktorZakwasuScreen key="dz" />],
  ])('%s has no lock', async (_name, el) => {
    const tree = await render(el);
    expect(locks(tree.root)).toEqual([]);
    expect(paywallShown(tree.root)).toBe(false);
    act(() => tree.unmount());
  });

  it('BlokadaFunkcji renders the children as they are when unlocked', async () => {
    const tree = await render(
      <BlokadaFunkcji funkcja="kalkulator" odblokowane={true} onZablokowane={() => undefined}>
        <PaywallModal visible={false} onClose={() => undefined} onSubscribe={() => undefined} />
      </BlokadaFunkcji>
    );
    expect(locks(tree.root)).toEqual([]);
    act(() => tree.unmount());
  });
});
