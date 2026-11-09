/**
 * M1-audytor-generalny-005 (04-studio-projektowe-001, opcja A z reauditu 2026-11-09; decyzja M2 D-318 do weta D-289):
 * na pasie prowadzenia tylko tytuł kroku, czas i „potem …”; Spirala z nazwą receptury i „Gotowe …” w karcie pod kartą
 * kroku. Przy 393×852 pt (domyślny tekst, pl i en) dół ostrzeżenia bezpieczeństwa nad górą „Zrobione”; przy dwóch
 * wypiekach przełącznik nie zasłania karty kroku. 320×568 pt: niewykonalne w opcji A (sama karta z ostrzeżeniem i pasek
 * kciuka są wyższe niż okno pod najmniejszym pasem) — otwarte, rachunek w raporcie roli 08 (fix-2026-11-09, wynik-p4).
 * Układ to rachunek z tokenów i stylów (tests/helpers/uklad-ekranu.ts), nie pomiar: zrzut z symulatora daje E2E iOS
 * (.maestro/e2e/03-prowadzenie-widok-skupiony.yaml, `step-warning`).
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
const mockWciecia = { top: 0, left: 0, right: 0, bottom: 0 };
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => mockWciecia,
  };
});
let mockParams: Record<string, string> = {};
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => mockParams,
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
    Stack: Object.assign(({ children }: { children: React.ReactNode }) => children, { Screen: () => null }),
  };
});

import fs from 'fs';
import path from 'path';
import React from 'react';
import { Dimensions } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { planBakeSteps } from '../core/bake-steps';
import { ostrzezeniaKroku } from '../core/ostrzezenia-kroku';
import { saveBakeSession, type BakeSession } from '../data/bake-session-store';
import { setLang } from '../lib/i18n';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { ramka, ukladEkranu } from '../../tests/helpers/uklad-ekranu';

jest.setTimeout(30000);

/** iPhone 16 (393×852 pt): pasek stanu 59 pt, wskaźnik Home 34 pt. */
const EKRAN = { szer: 393, wys: 852, gora: 59, dol: 34 } as const;

const now = 1_800_000_000_000;
const kroki = planBakeSteps({ startAt: now - 60_000, isHighRye: false });
const wypiek = (id: string, nazwa: string, stepIdx: number): BakeSession => ({
  version: 2,
  steps: kroki,
  stepIdx,
  dutchOvenPhase: 'lid_on',
  timerEndsAt: now + 30 * 60_000,
  pausedLeftSec: null,
  recipeName: nazwa,
  startedAt: now - 60_000,
  bake: { id, recipeName: nazwa, startedAt: now - 60_000, currentStageId: kroki[stepIdx].id, zaczetyZDostepem: true },
});

async function render(): Promise<renderer.ReactTestRenderer> {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<StolnicaScreen />);
  });
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
  return tree!;
}

const DOMYSLNE = Dimensions.get('window');

describe('005: karta kroku i ostrzeżenie w pierwszym ekranie prowadzenia', () => {
  beforeEach(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    setLang('pl');
    mockParams = { wypiek: 'bake_chleb' };
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    await initDatabase();
    await saveBakeSession(null);
    // Pierwszy krok planu (dokarmienie zakwasu) ma ostrzeżenie „Surowy zakwas” — ten sam krok co w E2E 03
    expect(ostrzezeniaKroku(kroki, 0).length).toBeGreaterThan(0);
    await saveBakeSession(wypiek('bake_chleb', 'Wiejski chleb codzienny na zakwasie', 0));
  });
  afterEach(() => {
    jest.restoreAllMocks();
    act(() => {
      Dimensions.set({ window: DOMYSLNE, screen: DOMYSLNE });
    });
  });

  const ustaw = () => {
    act(() => {
      Dimensions.set({ window: { width: EKRAN.szer, height: EKRAN.wys, scale: 3, fontScale: 1 }, screen: { width: EKRAN.szer, height: EKRAN.wys, scale: 3, fontScale: 1 } });
    });
    Object.assign(mockWciecia, { top: EKRAN.gora, bottom: EKRAN.dol });
  };

  for (const jezyk of ['pl', 'en'] as const) {
    it(`393×852, ${jezyk}: dół ostrzeżenia nad górą „Zrobione”, Spirala pod kartą kroku, nie na pasie`, async () => {
      setLang(jezyk);
      ustaw();
      const tree = await render();
      const ramki = ukladEkranu(tree.root, EKRAN.szer, EKRAN.wys, EKRAN.dol);
      const ostrz = ramka(tree.root, ramki, 'step-warning');
      const zrobione = ramka(tree.root, ramki, 'next-or-finish-step-btn');
      const karta = ramka(tree.root, ramki, 'karta-kroku');
      const spirala = ramka(tree.root, ramki, 'brand-spiral');
      const pas = tree.root.findAll((n) => n.props?.testID === 'pas-zakladki' && typeof n.type === 'string')[0];
      const naPasie = ['step-title', 'step-time', 'step-next', 'brand-spiral', 'stolnica-nazwa-wypieku', 'plan-ready'].filter(
        (id) => pas.findAll((n) => n.props?.testID === id).length > 0
      );
      act(() => tree.unmount());
      // Dół ostrzeżenia (pt od góry ekranu) nie niżej niż góra „Zrobione”
      expect(Math.round(ostrz.y + ostrz.h)).toBeLessThanOrEqual(Math.floor(zrobione.y));
      expect(naPasie).toEqual(['step-title', 'step-time', 'step-next']);
      expect(spirala.y).toBeGreaterThan(karta.y + karta.h);
    });
  }

  it('393×852, dwa wypieki: przełącznik nad paskiem kciuka nie zasłania karty kroku', async () => {
    ustaw();
    await saveBakeSession(wypiek('bake_pizza', 'Pizza', 1));
    const tree = await render();
    expect(tree.root.findAll((n) => n.props?.testID === 'przelacznik-wypiekow').length).toBeGreaterThan(0);
    const ramki = ukladEkranu(tree.root, EKRAN.szer, EKRAN.wys, EKRAN.dol);
    const karta = ramka(tree.root, ramki, 'karta-kroku');
    const przelacznik = ramka(tree.root, ramki, 'przelacznik-wypiekow');
    act(() => tree.unmount());
    expect(Math.round(karta.y + karta.h)).toBeLessThanOrEqual(Math.floor(przelacznik.y));
  });

  it('E2E 03: assertVisible na ostrzeżeniu kroku (step-warning), nie tylko na całej karcie, bez przewijania', () => {
    const flow = fs.readFileSync(path.join(__dirname, '..', '..', '.maestro', 'e2e', '03-prowadzenie-widok-skupiony.yaml'), 'utf8');
    const po = flow.slice(flow.indexOf('id: "step-title"'));
    expect(po).toMatch(/assertVisible:\s*\n\s*id: "step-warning"/);
    expect(po).not.toMatch(/scrollUntilVisible/);
  });
});
