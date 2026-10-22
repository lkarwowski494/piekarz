/**
 * M3 P-a-fix: poprawki po niezależnym przeglądzie P-a (audit/M3-2026-10-22/weryfikacja/pa-przeglad.md) — kontrakt
 * docs/monetyzacja.md, D-112, D-113, D-116:
 * - P0-1: Basic zakłada zakwas od nowa przy jednym zakwasie (D-113 „ponowne zakładanie po nieudanej próbie dozwolone”):
 *   jedyny zakwas da się usunąć (z potwierdzeniem), a gotowy zakwas „Załóż od nowa” (restartStarterSetup) bez ekranu Pro;
 *   „Dodaj zakwas” przy jednym nadal otwiera ekran Pro;
 * - P1-1 / W-04: zapis zmian własnej receptury przy 5 zapisanych (to samo id) bez ekranu Pro; nowa receptura — ekran Pro;
 * - P1-2: import pojedynczej receptury (plik, QR) przy 5 własnych = dodanie → ekran Pro, treść w arkuszu zostaje;
 * - P1-3: gotowość zakwasu (BR-ZAKW-003) poza zakładaniem w Pro; zapis „Podwoił się” w Basic;
 * - P2-1: plan Basic bez temperatury z kalkulatora (czas z temperatury to BR-HARMO-003, Pro);
 * - W-06: kopia 8 receptur i 3 zakwasy wnosi wszystko, karmienie trzeciego zakwasu bez ekranu Pro.
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
jest.mock('expo-router', () => {
  const React = require('react');
  const nawigacja = { push: (...a: unknown[]) => mockPush(...a), navigate: jest.fn(), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() };
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

import React from 'react';
import { Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import RecepturaScreen from '../../app/(tabs)/receptury/receptura';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { PaywallModal } from '../components/PaywallModal';
import { SaveRecipeModal } from '../components/calculator/SaveRecipeModal';
import { ImportZPlikuArkusz } from '../components/settings/ImportZPlikuArkusz';
import { ImportRecipeModal } from '../components/ImportRecipeModal';
import { initDatabase, _resetMemStore, deleteStarter, getStarters, saveRecipe, getRecipes, saveStarter, getActiveBake, setActiveBake } from '../data/sqlite-store';
import { addStarterEntry } from '../data/starter-entries-store';
import { nowyWpis } from '../components/zakwas/useStarterLog';
import { FRIDGE_WAKE_STEP_ID } from '../core/fridge-wake';
import { setPendingRecipeToLoad } from '../lib/recipe-navigation';
import { ustawRecepturePlanu } from '../lib/plan-receptury';
import { encodeRecipeToShareUrl } from '../lib/recipe-sharing';
import { calculateDoughRecipe } from '../core/domain-rules';
import { buildBackup } from '../lib/backup';
import { importujKopie, rozpoznajPlik } from '../lib/import-z-pliku';
import { _resetStanu } from '../lib/platnosci/stan';
import { mockIap, zUprawnieniem } from '../../tests/helpers/platnosci';
import { zacznijWypiekBezReceptury } from '../../tests/helpers/wypiek';
import type { StoredRecipe } from '../data/db';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import StolnicaScreen from '../../app/stolnica';
import DoktorZakwasuScreen from '../../app/(tabs)/zakwasy/doktor-zakwasu';
import { BackupAndDataSection } from '../components/settings/BackupAndDataSection';
import { ImportRecepturySection } from '../components/settings/ImportRecepturySection';
import { BreadAcademyModal } from '../components/BreadAcademyModal';
import { useAppAccess } from '../lib/app-access';
import { funkcjaLekcji } from '../lib/platnosci/dostep';
import { BASIC, BASIC_SZCZEGOLY, type Funkcja } from '../lib/platnosci/konfiguracja';
import { UstawieniaPlanu } from '../components/harmonogram/UstawieniaPlanu';
import RecepturyLista from '../../app/(tabs)/receptury/index';
import { saveBakeLog } from '../data/sqlite-store';

const H = 3_600_000;
const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 40; i++) await Promise.resolve();
  });
};
const host = (root: renderer.ReactTestInstance, testID: string) => root.findAll((n) => typeof n.type === 'string' && n.props.testID === testID);
const przycisk = (root: renderer.ReactTestInstance, testID: string) =>
  root.findAll((n) => typeof n.type !== 'string' && n.props.testID === testID && typeof n.props.onPress === 'function');
const ekranPro = (root: renderer.ReactTestInstance) => root.findAllByType(PaywallModal).some((p) => p.props.visible === true);
const nacisnij = async (root: renderer.ReactTestInstance, testID: string) => {
  const p = przycisk(root, testID);
  expect({ testID, jest: p.length > 0 }).toEqual({ testID, jest: true });
  await act(async () => p[p.length - 1].props.onPress());
  await flush();
};
type Przycisk = { text: string; onPress?: () => void };
let alertSpy: jest.SpyInstance;
/** Potwierdza ostatnie pytanie systemowe przyciskiem o tym tekście. */
const potwierdz = async (tekst: string) => {
  const [, , przyciski] = alertSpy.mock.calls[alertSpy.mock.calls.length - 1] as [string, string, Przycisk[]];
  const b = (przyciski ?? []).find((x) => x.text === tekst);
  expect({ tekst, jest: !!b }).toEqual({ tekst, jest: true });
  await act(async () => b?.onPress?.());
  await flush();
};

const formula = { flours: [{ name: 'Mąka pszenna chlebowa typ 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 900 };
const wlasna = (n: number): StoredRecipe => ({ id: `recipe_${n}`, name: `Moja ${n}`, isBuiltIn: false, createdAt: n, targetDDT: 25, formula });
const piecWlasnych = async () => {
  for (let n = 1; n <= 5; n++) await saveRecipe(wlasna(n));
};
const ileWlasnych = async () => (await getRecipes()).filter((r) => !r.isBuiltIn).length;

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
  setActiveBake(null);
  ustawRecepturePlanu(null);
  alertSpy = jest.spyOn(Alert, 'alert').mockImplementation(() => {});
  await initDatabase();
});
afterEach(() => {
  if (tree) act(() => tree?.unmount());
  tree = null;
  alertSpy.mockRestore();
});

describe('P0-1: zakładanie od nowa w Basic przy jednym zakwasie (D-113)', () => {
  it('jedyny zakwas da się usunąć z potwierdzeniem; potem pierwsze dokarmienie zakłada nowy bez ekranu Pro', async () => {
    expect(await getStarters()).toHaveLength(1);
    const root = await zamontuj(<ZakwasScreen />);
    await nacisnij(root, 'edit-profile-btn');
    await nacisnij(root, 'delete-starter-btn');
    await potwierdz('Usuń zakwas');
    expect(await getStarters()).toHaveLength(0);
    expect(ekranPro(root)).toBe(false);
    await nacisnij(root, 'zakladanie-pierwsze-dokarmienie-btn');
    expect(ekranPro(root)).toBe(false);
    expect(await getStarters()).toHaveLength(1);
  });

  it('gotowy zakwas: „Załóż od nowa” w profilu zaczyna zakładanie od dnia 1 bez ekranu Pro; „Dodaj zakwas” dalej Pro', async () => {
    const root = await zamontuj(<ZakwasScreen />);
    await nacisnij(root, 'edit-profile-btn');
    await nacisnij(root, 'restart-starter-setup-btn');
    await potwierdz('Zacznij od nowa');
    const [z] = await getStarters();
    expect(typeof z.setupStartedAt).toBe('number');
    expect(z.setupCompletedAt).toBeUndefined();
    expect(ekranPro(root)).toBe(false);
    await nacisnij(root, 'add-starter-btn');
    expect(ekranPro(root)).toBe(true);
  });

  it('pleśń na gotowym zakwasie (RD-21: wyrzuć): „Załóż zakwas od nowa” przy ostrzeżeniu, bez ekranu Pro', async () => {
    const root = await zamontuj(<ZakwasScreen />);
    await nacisnij(root, 'check-colored');
    await nacisnij(root, 'starter-safety-restart-btn');
    await potwierdz('Zacznij od nowa');
    const [z] = await getStarters();
    expect(z.setupCompletedAt).toBeUndefined();
    expect(typeof z.setupStartedAt).toBe('number');
    expect(ekranPro(root)).toBe(false);
  });
});

describe('P1-1 / W-04: zapisane receptury działają w całości przy limicie 5', () => {
  it('zapis zmian wczytanej własnej receptury przy 5 zapisanych: to samo id, bez ekranu Pro', async () => {
    await piecWlasnych();
    const root = await zamontuj(<RecepturaScreen />);
    await act(async () => setPendingRecipeToLoad({ id: 'recipe_3', name: 'Moja 3', targetDDT: 25, formula: { ...formula, waterPercentage: 75 } }));
    await flush();
    await nacisnij(root, 'save-custom-recipe-btn');
    expect(ekranPro(root)).toBe(false);
    await act(async () => root.findByType(SaveRecipeModal).props.onSave());
    await flush();
    expect(ekranPro(root)).toBe(false);
    expect(await ileWlasnych()).toBe(5);
    expect((await getRecipes()).find((r) => r.id === 'recipe_3')?.formula.waterPercentage).toBe(75);
  });

  it('nowa receptura (inna nazwa) przy 5 własnych: ekran Pro, nic nie zapisane', async () => {
    await piecWlasnych();
    const root = await zamontuj(<RecepturaScreen />);
    await act(async () => setPendingRecipeToLoad({ id: 'recipe_3', name: 'Moja 3', targetDDT: 25, formula }));
    await flush();
    await nacisnij(root, 'save-custom-recipe-btn');
    await act(async () => root.findByType(SaveRecipeModal).props.onRecipeNameChange('Moja szósta'));
    await act(async () => root.findByType(SaveRecipeModal).props.onSave());
    await flush();
    expect(ekranPro(root)).toBe(true);
    expect(await ileWlasnych()).toBe(5);
  });
});

describe('P1-2: import pojedynczej receptury liczy się do limitu 5 (kontrakt zwalnia tylko kopię)', () => {
  const plik = encodeRecipeToShareUrl({ ...wlasna(9), name: 'Z pliku' });

  it('arkusz „Importuj z pliku” przy 5 własnych: ekran Pro, receptura nie zapisana, treść w polu zostaje', async () => {
    await piecWlasnych();
    const root = await zamontuj(<ImportZPlikuArkusz onClose={() => undefined} onRecipeImported={() => undefined} />);
    const pole = root.findAll((n) => n.props.testID === 'import-json-input' && typeof n.props.onChangeText === 'function')[0];
    await act(async () => pole.props.onChangeText(plik));
    await flush();
    expect(host(root, 'import-preview-recipe').length).toBeGreaterThan(0);
    await nacisnij(root, 'confirm-import-btn');
    expect(ekranPro(root)).toBe(true);
    expect(await ileWlasnych()).toBe(5);
    expect(root.findAll((n) => n.props.testID === 'import-json-input' && typeof n.props.onChangeText === 'function')[0].props.value).toBe(plik);
  });

  it('import z kodu QR (ImportRecipeModal) przy 5 własnych: ekran Pro; przy 4: zapis', async () => {
    await piecWlasnych();
    const payload = encodeRecipeToShareUrl({ ...wlasna(9), name: 'Od sąsiada' });
    const onSuccess = jest.fn();
    const root = await zamontuj(<ImportRecipeModal visible={true} onClose={() => undefined} onImportSuccess={onSuccess} initialInput={payload} />);
    await nacisnij(root, 'confirm-import-btn');
    expect(ekranPro(root)).toBe(true);
    expect(onSuccess).not.toHaveBeenCalled();
    expect(await ileWlasnych()).toBe(5);
  });

  // Import zawsze nadaje nowe id (recipe-sharing.ts), więc każdy import receptury jest dodaniem
  it('przy 4 własnych import receptury zapisuje piątą bez ekranu Pro', async () => {
    for (let n = 1; n <= 4; n++) await saveRecipe(wlasna(n));
    const payload = encodeRecipeToShareUrl({ ...wlasna(9), name: 'Od sąsiada' });
    const onSuccess = jest.fn();
    const root = await zamontuj(<ImportRecipeModal visible={true} onClose={() => undefined} onImportSuccess={onSuccess} initialInput={payload} />);
    await nacisnij(root, 'confirm-import-btn');
    expect(ekranPro(root)).toBe(false);
    expect(onSuccess).toHaveBeenCalledTimes(1);
    expect(await ileWlasnych()).toBe(5);
  });
});

describe('P1-3: gotowość zakwasu (BR-ZAKW-003) poza zakładaniem w Pro', () => {
  const gotowyZakwas = async () => {
    for (const s of await getStarters()) await deleteStarter(s.id);
    const teraz = Date.now();
    await saveStarter({ id: 'z_got', name: 'Ania', flourType: 'Żytnia', hydration: 100, birthDate: teraz - 30 * 24 * H, storageState: 'ROOM_TEMP', lastFedAt: teraz - 5 * H });
    await addStarterEntry(nowyWpis('z_got', 'feeding', teraz - 5 * H));
    await addStarterEntry(nowyWpis('z_got', 'observation', teraz - H, ['doubled']));
  };

  it('bez Pro: bez „Gotowy do ciasta”, w miejscu stanu blokada Pro; „Podwoił się” zapisuje wpis bez ekranu Pro', async () => {
    await gotowyZakwas();
    const root = await zamontuj(<ZakwasScreen />);
    expect(host(root, 'zakwas-gotowy')).toHaveLength(0);
    expect(przycisk(root, 'blokada-gotowosc-zakwasu').length).toBeGreaterThan(0);
    await nacisnij(root, 'zakwas-podwoil-btn');
    expect(ekranPro(root)).toBe(false);
  });

  it('z Pro: „Gotowy do ciasta” widoczny', async () => {
    zUprawnieniem();
    await gotowyZakwas();
    const root = await zamontuj(<ZakwasScreen />);
    expect(host(root, 'zakwas-gotowy')).toHaveLength(1);
  });
});

describe('P2-1: plan Basic bez czasu z temperatury kuchni (BR-HARMO-003 w Pro)', () => {
  it('temperatura kuchni z kalkulatora nie trafia do wypieku zaczętego w Basic; kroki jak przy temperaturze modelu', async () => {
    for (const s of await getStarters()) await deleteStarter(s.id);
    const kroki = async (temperaturaKuchni?: { c: number; wybrana: boolean }) => {
      setActiveBake(null);
      ustawRecepturePlanu({ recipeName: 'Test', calculatedRecipe: calculateDoughRecipe(formula), recipeFormula: formula, ...(temperaturaKuchni ? { temperaturaKuchni } : {}) });
      const root = await zamontuj(<HarmonogramScreen />);
      await nacisnij(root, 'plan-start-bake-btn');
      act(() => tree?.unmount());
      tree = null;
      const b = getActiveBake();
      const kroki = b?.steps ?? [];
      return { temp: b?.ambientTempC, dlugosc: kroki.length ? (kroki[kroki.length - 1].plannedEnd ?? 0) - (kroki[0].plannedStart ?? 0) : null };
    };
    const model = await kroki();
    const ciepla = await kroki({ c: 30, wybrana: true });
    expect(ciepla.temp).toBeUndefined();
    expect(ciepla.dlugosc).toBe(model.dlugosc);
  });
});

/** Akademia z tym samym strażnikiem co app/doktor.tsx (wejście Akademii poza 1.0). */
function AkademiaZeStraznikiem() {
  const { chron } = useAppAccess();
  return <BreadAcademyModal visible={true} onClose={() => undefined} otworzLekcje={(poziom, otworz) => chron(funkcjaLekcji(poziom), otworz)()} />;
}

/**
 * Mapa miejsc użycia funkcji Basic (W-01 „Basic w całości”, P2-7 „Basic tylko rośnie”): dla każdej funkcji z BASIC
 * co najmniej jedna akcja na ekranie, która bez Pro działa bez ekranu Pro. Przepięcie takiej akcji na funkcję Pro pada tu.
 */
const MAPA_BASIC: Array<{ funkcja: Funkcja; ekran: () => React.ReactElement; akcja: string; przed?: () => Promise<void> }> = [
  { funkcja: 'historia', ekran: () => <DziennikScreen />, akcja: 'bake-again-btn-b_mapa', przed: async () => saveBakeLog({ id: 'b_mapa', recipeName: 'Wiejski', startedAt: 1, finishedAt: 2, ratingStars: 4 }) },
  { funkcja: 'dane', ekran: () => <BackupAndDataSection />, akcja: 'export-backup-btn' },
  { funkcja: 'import', ekran: () => <ImportRecepturySection />, akcja: 'import-file-btn' },
  { funkcja: 'kalkulator', ekran: () => <RecepturaScreen />, akcja: 'water-temp-btn' },
  { funkcja: 'kalkulator', ekran: () => <RecepturaScreen />, akcja: 'edit-ingredients-btn' },
  { funkcja: 'harmonogram', ekran: () => <HarmonogramScreen />, akcja: 'plan-start-bake-btn' },
  { funkcja: 'stolnica', ekran: () => <StolnicaScreen />, akcja: 'next-or-finish-step-btn', przed: async () => zacznijWypiekBezReceptury(Date.now(), { zaczetyZDostepem: false }) },
  { funkcja: 'zakwas', ekran: () => <ZakwasScreen />, akcja: 'zakwas-dokarm-btn' },
  { funkcja: 'zakwas', ekran: () => <ZakwasScreen />, akcja: 'zakwas-podwoil-btn' },
  { funkcja: 'doktor', ekran: () => <DoktorZakwasuScreen />, akcja: 'doktor-zakwasu-objaw-no_activity' },
  { funkcja: 'receptury', ekran: () => <RecepturaScreen />, akcja: 'save-custom-recipe-btn' },
  { funkcja: 'akademia', ekran: () => <AkademiaZeStraznikiem />, akcja: 'expand-lesson-btn-1' },
];

describe('W-01 / P2-7: każda funkcja Basic ma na ekranie akcję bez ekranu Pro', () => {
  it('mapa obejmuje całą listę BASIC', () => {
    expect([...new Set(MAPA_BASIC.map((m) => m.funkcja))].sort()).toEqual([...BASIC].sort());
  });

  it.each(MAPA_BASIC.map((m) => [m.funkcja, m.akcja, m] as const))('%s: %s bez Pro nie otwiera ekranu Pro', async (_f, _a, m) => {
    await m.przed?.();
    const root = await zamontuj(m.ekran());
    await nacisnij(root, m.akcja);
    expect(ekranPro(root)).toBe(false);
  });

  it('kontrola: dalszy poziom Akademii (Pro) otwiera ekran Pro', async () => {
    const root = await zamontuj(<AkademiaZeStraznikiem />);
    await nacisnij(root, 'expand-lesson-btn-2');
    expect(ekranPro(root)).toBe(true);
  });
});

/** Element leży w zablokowanej treści BlokadaFunkcji. */
const wBlokadzie = (n: renderer.ReactTestInstance | null): boolean => {
  for (let p = n; p; p = p.parent) if (typeof p.props?.testID === 'string' && /^blokada-.*-tresc$/.test(p.props.testID)) return true;
  return false;
};

describe('Szczegóły Basic rozstrzygnięte przez właściciela (D-116, „Wg rekomendacji”) — pilnowane na ekranie', () => {
  it('lista w konfiguracji = lista w pliku wydania 1.0', () => {
    expect([...BASIC_SZCZEGOLY].sort()).toEqual(['akademia-biblioteka-technik', 'dziennik-filtr-smaku', 'limit-receptur-przywroc-i-kopia-poza-limitem', 'plan-pierwsze-karmienie-budzace', 'plan-ustawienia-nocy-i-lodowki', 'zakwas-przelicznik-hydratacji', 'zakwas-wylewki']); // + P-b2 (D-117), test ekranowy: zakwas-narzedzia-basic-pb2.test.tsx
  });

  it('plan-pierwsze-karmienie-budzace: plan Basic z zakwasem z lodówki ma krok dokarmienia budzącego', async () => {
    const root = await zamontuj(<HarmonogramScreen />); // zakwas pokazowy w pamięci: lodówka
    await nacisnij(root, 'plan-start-bake-btn');
    expect(ekranPro(root)).toBe(false);
    expect((getActiveBake()?.steps ?? []).map((s) => s.id)).toContain(FRIDGE_WAKE_STEP_ID);
  });

  it('plan-ustawienia-nocy-i-lodowki: czas w lodówce zmienia się poza blokadą, bez ekranu Pro', async () => {
    const root = await zamontuj(<HarmonogramScreen />);
    const u = root.findByType(UstawieniaPlanu);
    expect(wBlokadzie(u)).toBe(false);
    await act(async () => u.props.onColdRetardHoursChange(10));
    expect(ekranPro(root)).toBe(false);
  });

  it('akademia-biblioteka-technik: zakładka technik bez ekranu Pro', async () => {
    const root = await zamontuj(<AkademiaZeStraznikiem />);
    await nacisnij(root, 'academy-tab-techniques');
    expect(ekranPro(root)).toBe(false);
  });

  it('dziennik-filtr-smaku: filtr poza blokadą, bez ekranu Pro', async () => {
    await saveBakeLog({ id: 'b_f', recipeName: 'Wiejski', startedAt: 1, finishedAt: 2, ratingStars: 4 });
    const root = await zamontuj(<DziennikScreen />);
    const f = przycisk(root, 'filter-taste-sour')[0];
    expect(wBlokadzie(f)).toBe(false);
    await nacisnij(root, 'filter-taste-sour');
    expect(ekranPro(root)).toBe(false);
  });

  it('limit-receptur-przywroc-i-kopia-poza-limitem: „Przywróć” usuniętej przy 5 własnych bez ekranu Pro (import kopii: W-06)', async () => {
    await piecWlasnych();
    const root = await zamontuj(<RecepturyLista />);
    const lista = root.findAll((n) => typeof n.props?.onUsunMoja === 'function')[0];
    await act(async () => lista.props.onUsunMoja(wlasna(5)));
    await flush();
    expect(await ileWlasnych()).toBe(4);
    await nacisnij(root, 'undo-restore-btn');
    expect(ekranPro(root)).toBe(false);
    expect(await ileWlasnych()).toBe(5);
  });
});

describe('W-09: wypiek zaczęty z Pro prowadzi się po wygaśnięciu do końca', () => {
  it('start z Pro, potem bez Pro: kolejne kroki bez kłódki i bez ekranu Pro', async () => {
    for (const s of await getStarters()) await deleteStarter(s.id);
    zUprawnieniem();
    const plan = await zamontuj(<HarmonogramScreen />);
    await nacisnij(plan, 'plan-start-bake-btn');
    expect(getActiveBake()).not.toBeNull();
    act(() => tree?.unmount());
    mockIap.reset();
    _resetStanu(); // Pro wygasło
    const stol = await zamontuj(<StolnicaScreen />);
    await nacisnij(stol, 'next-or-finish-step-btn');
    await nacisnij(stol, 'next-or-finish-step-btn');
    expect(ekranPro(stol)).toBe(false);
    expect(stol.findAll((n) => typeof n.props?.testID === 'string' && n.props.testID.startsWith('blokada-') && typeof n.props.onPress === 'function')).toEqual([]);
  });
});

describe('W-06: kopia 8 receptur i 3 zakwasy bez Pro', () => {
  it('import kopii wnosi wszystko; trzeci zakwas karmiony bez ekranu Pro; dodanie kolejnej receptury → ekran Pro', async () => {
    const kopia = buildBackup({
      bakes: [],
      starters: [1, 2, 3].map((n) => ({ id: `s${n}`, name: `Zakwas ${n}`, flourType: 'Żytnia', hydration: 100, birthDate: 1, storageState: 'ROOM_TEMP' as const, lastFedAt: Date.now() - 2 * H })),
      customRecipes: [1, 2, 3, 4, 5, 6, 7, 8].map(wlasna),
    });
    const p = rozpoznajPlik(JSON.stringify(kopia));
    if (p?.rodzaj !== 'kopia') throw new Error('kopia nierozpoznana');
    await importujKopie(p.kopia);
    expect(await ileWlasnych()).toBe(8);
    expect(await getStarters()).toHaveLength(3);
    const root = await zamontuj(<ZakwasScreen />);
    await nacisnij(root, 'select-starter-s3');
    await nacisnij(root, 'zakwas-dokarm-btn');
    expect(ekranPro(root)).toBe(false);
    expect((await getStarters()).find((s) => s.id === 's3')?.lastFedAt).toBeGreaterThan(Date.now() - H);
    act(() => tree?.unmount());
    const rec = await zamontuj(<RecepturaScreen />);
    await nacisnij(rec, 'save-custom-recipe-btn');
    expect(ekranPro(rec)).toBe(true);
  });
});
