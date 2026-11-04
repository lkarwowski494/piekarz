/**
 * M3 p7 (D-214, znalezisko 04-studio-projektowe-001, README §2 „czapka paska stanu”, D-139): każdy ekran, który
 * renderuje pas (`PasZakladki`, `PasDzis`, `PasZakwasu`), ma czapkę paska stanu poza przewijaną treścią — gdy pas
 * odjedzie przy przewijaniu, pod paskiem stanu zostaje kolor pasa, nie karty. Lista ekranów pochodzi z kodu (grep
 * po `app/` i `src/`), nie z pamięci: nowy ekran z pasem bez wpisu w tej tablicy przewraca test.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  selectionAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, edges: _e, ...p }: { children?: React.ReactNode; edges?: unknown }) => React.createElement('View', p, children),
    SafeAreaProvider: ({ children }: { children?: React.ReactNode }) => children,
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 34 }),
  };
});
const mockRouter = { push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn(), setParams: jest.fn() };
jest.mock('expo-router', () => {
  const React = require('react');
  const Stack = ({ children }: { children?: React.ReactNode }) => React.createElement(React.Fragment, null, children);
  Stack.Screen = () => null;
  return {
    Stack,
    router: mockRouter,
    useRouter: () => mockRouter,
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import fs from 'fs';
import path from 'path';
import React from 'react';
import { ScrollView, StatusBar, StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StartScreen from '../../app/(tabs)/(dzis)/index';
import RecepturyLista from '../../app/(tabs)/receptury/index';
import EkranReceptury from '../../app/(tabs)/receptury/receptura';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import DoctorScreen from '../../app/doktor';
import StolnicaScreen from '../../app/stolnica';
import { PaywallModal } from '../components/PaywallModal';
import { EkranZPasem } from '../components/nawigacja/EkranZPasem';
import { PasZakladki } from '../components/nawigacja/PasZakladki';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, setActiveBake } from '../data/sqlite-store';
import { saveBakeSession } from '../data/bake-session-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { calculateDoughRecipe } from '../core/domain-rules';
import { ustawRecepturePlanu } from '../lib/plan-receptury';
import { setLang } from '../lib/i18n';
import { theme } from '../ui/theme';
import type { SessionStep } from '../core/bake-steps';

jest.setTimeout(30000);
type Wezel = renderer.ReactTestInstance;
const ROOT = path.join(__dirname, '..', '..');
/** Komponenty samego pasa (nie ekrany): renderują `PasZakladki` w środku. */
const KOMPONENTY_PASA = ['src/components/nawigacja/PasZakladki.tsx', 'src/components/start/PasDzis.tsx', 'src/components/zakwas/PasZakwasu.tsx'];

function plikiZPasem(): string[] {
  const wynik: string[] = [];
  const idz = (kat: string) => {
    for (const w of fs.readdirSync(path.join(ROOT, kat), { withFileTypes: true })) {
      const rel = `${kat}/${w.name}`;
      if (w.isDirectory()) {
        if (w.name !== '__tests__') idz(rel);
      } else if (/\.tsx$/.test(w.name) && /<(PasZakladki|PasDzis|PasZakwasu)\b/.test(fs.readFileSync(path.join(ROOT, rel), 'utf8'))) {
        wynik.push(rel);
      }
    }
  };
  idz('app');
  idz('src');
  return wynik.filter((p) => !KOMPONENTY_PASA.includes(p)).sort();
}

const formula = { flours: [{ name: 'Mąka pszenna 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000 };
const teraz = Date.now();
const krok = (id: string, name: string, category: SessionStep['category'], od: number): SessionStep => ({
  id, name, category, durationMin: 30, isPassive: false, instructions: 'Wymieszaj mąkę z wodą.', plannedStart: teraz + od * 1_800_000, plannedEnd: teraz + (od + 1) * 1_800_000,
});

/** Ekran (plik z grep) → jak go zamontować. Plik komponentu ekranu stoi za trasą (ProwadzenieWypieku → app/stolnica). */
const EKRANY: Record<string, () => React.ReactElement> = {
  'app/(tabs)/(dzis)/index.tsx': () => <StartScreen />,
  'app/(tabs)/dziennik/index.tsx': () => <DziennikScreen />,
  'app/(tabs)/receptury/harmonogram.tsx': () => {
    ustawRecepturePlanu({ recipeId: 'r1', recipeName: 'Wiejski', calculatedRecipe: calculateDoughRecipe(formula), recipeFormula: formula });
    return <HarmonogramScreen />;
  },
  'app/(tabs)/receptury/index.tsx': () => <RecepturyLista />,
  'app/(tabs)/receptury/receptura.tsx': () => <EkranReceptury />,
  'app/(tabs)/zakwasy/index.tsx': () => <ZakwasScreen />,
  'app/doktor.tsx': () => <DoctorScreen />,
  'src/components/PaywallModal.tsx': () => <PaywallModal visible onClose={() => undefined} onSubscribe={() => undefined} onRestore={() => false} />,
  'src/components/stolnica/ProwadzenieWypieku.tsx': () => {
    setActiveBake({ id: 'bake_c', recipeName: 'Wiejski', startedAt: teraz, currentStageId: 'pm', steps: [krok('pm', 'Mieszanie i autoliza', 'mix', 0), krok('pp', 'Pieczenie', 'bake', 1)] });
    return <StolnicaScreen />;
  },
};

const host = (root: Wezel, id: string): Wezel[] => root.findAll((n) => typeof n.type === 'string' && n.props.testID === id);
const wPrzewijaniu = (n: Wezel): boolean => {
  for (let p: Wezel | null = n.parent; p; p = p.parent) if (p.type === ScrollView) return true;
  return false;
};

describe('M3 p7 (04-001): czapka paska stanu na każdym ekranie z pasem', () => {
  beforeEach(async () => {
    jest.spyOn(StatusBar, 'setBarStyle').mockImplementation(() => undefined);
    setLang('pl');
    _resetMemStore();
    zUprawnieniem();
    setActiveBake(null);
    await initDatabase();
    await saveBakeSession(null);
  });
  afterEach(() => {
    jest.restoreAllMocks();
    ustawRecepturePlanu(null);
  });

  it('lista ekranów z pasem z kodu = lista ekranów sprawdzanych niżej', () => {
    expect(plikiZPasem()).toEqual(Object.keys(EKRANY).sort());
  });

  it.each(Object.keys(EKRANY))('%s: czapka w kolorze pasa, poza przewijaną treścią', async (plik) => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(<AppAccessProvider>{EKRANY[plik]()}</AppAccessProvider>);
    });
    await act(async () => {
      for (let i = 0; i < 40; i++) await Promise.resolve();
    });
    expect(host(tree.root, 'pas-zakladki').length + host(tree.root, 'pas-dzis').length).toBeGreaterThan(0);
    const czapki = host(tree.root, 'czapka-paska');
    expect([plik, czapki.length]).toEqual([plik, 1]);
    expect(StyleSheet.flatten(czapki[0].props.style).backgroundColor).toBe(theme.colors.pas);
    expect(wPrzewijaniu(czapki[0])).toBe(false);
    act(() => tree.unmount());
  });

  it('EkranZPasem: mały tytuł w czapce dopiero, gdy pas schowa się pod paskiem stanu', async () => {
    let tree!: renderer.ReactTestRenderer;
    await act(async () => {
      tree = renderer.create(
        <EkranZPasem gora={47} tytul="Receptury" pas={(onLayout) => <PasZakladki gora={47} tytul="Receptury" onLayout={onLayout} />} />
      );
    });
    const przewin = (y: number) => act(() => tree.root.findByType(ScrollView).props.onScroll({ nativeEvent: { contentOffset: { x: 0, y } } }));
    act(() => host(tree.root, 'pas-zakladki')[0].props.onLayout({ nativeEvent: { layout: { x: 0, y: 0, width: 390, height: 147 } } }));
    expect(host(tree.root, 'czapka-paska-tytul')).toHaveLength(0);
    przewin(100);
    expect(host(tree.root, 'czapka-paska-tytul')).toHaveLength(0);
    przewin(101);
    expect(host(tree.root, 'czapka-paska-tytul')).toHaveLength(1);
    przewin(0);
    expect(host(tree.root, 'czapka-paska-tytul')).toHaveLength(0);
    act(() => tree.unmount());
  });
});
