/**
 * M1-audytor-generalny-005, reaudyt pętla 2 (KO-015, właściciel 2026-11-10): ostrzeżenie bezpieczeństwa kroku nad
 * kartą „Co zrobić”, w pierwszym ekranie prowadzenia. Dla każdego kroku z ostrzeżeniem w każdym planie wbudowanych
 * receptur (zakwas, żyto, wersja drożdżowa; krok w garnku w obu fazach pokrywki), w 35 językach, przy 393×852 i 320×568:
 * dolna krawędź całego pola ostrzeżenia (tytuł i wszystkie zdania) nie niżej niż dolna krawędź okna przewijania, czyli
 * góra paska kciuka. Układ to rachunek z tokenów i stylów (tests/helpers/uklad-ekranu.ts), nie pomiar z urządzenia.
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
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({ wypiek: 'bake_005' }),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
    Stack: Object.assign(({ children }: { children: React.ReactNode }) => children, { Screen: () => null }),
  };
});

import React from 'react';
import { Dimensions } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { isDutchOvenStep, type SessionStep } from '../core/bake-steps';
import type { DutchOvenBakePhase } from '../core/baking-phases';
import { calculateDoughRecipe } from '../core/domain-rules';
import { ostrzezeniaKroku } from '../core/ostrzezenia-kroku';
import { saveBakeSession, stepsForBake, type BakeSession } from '../data/bake-session-store';
import { ACTIVE_LANGS, setLang } from '../lib/i18n';
import { powodBezPlanu } from '../lib/plan-receptury';
import { CATALOG_RECIPES } from '../recipes/katalog';
import { krokiDrozdzowe } from '../recipes/yeast-stages';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { ramka, ukladEkranu, type Ramka } from '../../tests/helpers/uklad-ekranu';

jest.setTimeout(600_000);

type Ekran = { nazwa: string; szer: number; wys: number; gora: number; dol: number };
/** iPhone 16 (393×852 pt): pasek stanu 59 pt, wskaźnik Home 34 pt; iPhone SE 1. gen. (320×568 pt): 20 pt, bez wskaźnika. */
const EKRANY: readonly Ekran[] = [
  { nazwa: '393×852', szer: 393, wys: 852, gora: 59, dol: 34 },
  { nazwa: '320×568', szer: 320, wys: 568, gora: 20, dol: 0 },
];

const now = 1_800_000_000_000;
const start = now - 60_000;

/** Plany prowadzenia wbudowanych receptur: zakwasowe (z planem), wersje drożdżowe z planem, plan bez receptury (garnek, żyto). */
function planyWbudowane(): { nazwa: string; kroki: SessionStep[] }[] {
  const bake = (recipeId: string | undefined, isHighRye: boolean) =>
    stepsForBake({ id: 'p', recipeId, recipeName: 'p', startedAt: start, isHighRye } as Parameters<typeof stepsForBake>[0]);
  const plany = [
    { nazwa: 'bez receptury (garnek)', kroki: bake(undefined, false) },
    { nazwa: 'bez receptury (żyto)', kroki: bake(undefined, true) },
  ];
  for (const r of CATALOG_RECIPES) {
    if (powodBezPlanu(r.formula, { recipeId: r.id }) === null) {
      plany.push({ nazwa: r.id, kroki: bake(r.id, calculateDoughRecipe(r.formula).isHighRye) });
    }
    const drozdze = krokiDrozdzowe(r.id, start);
    if (drozdze) plany.push({ nazwa: `${r.id} (drożdże)`, kroki: drozdze });
  }
  return plany;
}

interface Przypadek { opis: string; kroki: SessionStep[]; idx: number; faza: DutchOvenBakePhase }

/**
 * Kroki z ostrzeżeniem (krok w garnku w obu fazach); bez powtórzeń tej samej treści ekranu: nazwa, instrukcja,
 * ostrzeżenia, następny krok i „Krok n z m” (z nich składa się wszystko nad ostrzeżeniem i karta pod nim).
 */
function przypadki(): Przypadek[] {
  const wynik = new Map<string, Przypadek>();
  for (const { nazwa, kroki } of planyWbudowane()) {
    kroki.forEach((k, idx) => {
      const fazy: DutchOvenBakePhase[] = isDutchOvenStep(k) ? ['lid_on', 'lid_off'] : ['lid_on'];
      for (const faza of fazy) {
        const ostrz = ostrzezeniaKroku(kroki, idx, isDutchOvenStep(k) ? faza : undefined);
        if (ostrz.length === 0) continue;
        const klucz = JSON.stringify([k.name, k.instructions, k.durationMin, ostrz.map((w) => w.text), kroki[idx + 1]?.name ?? null, idx, kroki.length, faza]);
        if (!wynik.has(klucz)) wynik.set(klucz, { opis: `${nazwa} #${idx + 1} ${k.id}${isDutchOvenStep(k) ? ` ${faza}` : ''}`, kroki, idx, faza });
      }
    });
  }
  return [...wynik.values()];
}

const PRZYPADKI = przypadki();

const sesja = (p: Przypadek): BakeSession => ({
  version: 2,
  steps: p.kroki,
  stepIdx: p.idx,
  dutchOvenPhase: p.faza,
  timerEndsAt: now + 30 * 60_000,
  pausedLeftSec: null,
  recipeName: 'Chleb',
  startedAt: start,
  bake: { id: 'bake_005', recipeName: 'Chleb', startedAt: start, currentStageId: p.kroki[p.idx].id, zaczetyZDostepem: true },
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

/** Dolna krawędź okna przewijania (góra paska kciuka), pt od góry ekranu. */
function oknoDol(tree: renderer.ReactTestRenderer, ramki: Map<unknown, Ramka>): number {
  const scroll = tree.root.findAll((n) => String(n.type) === 'RCTScrollView')[0];
  const r = ramki.get(scroll);
  if (!r) throw new Error('brak okna przewijania');
  return r.y + r.h;
}

const DOMYSLNE = Dimensions.get('window');

describe('005: ostrzeżenie kroku nad kartą „Co zrobić”, w pierwszym ekranie — wszystkie kroki, receptury i języki', () => {
  beforeAll(async () => {
    zUprawnieniem();
    useTempDbDir();
    _resetMemStore();
    setActiveBake(null);
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    await initDatabase();
  });
  afterAll(() => {
    jest.restoreAllMocks();
    setLang('pl');
    act(() => {
      Dimensions.set({ window: DOMYSLNE, screen: DOMYSLNE });
    });
  });

  it('zbiór przypadków obejmuje krok pieczenia w garnku (Gorące naczynie), żyto i wersję drożdżową', () => {
    const opisy = PRZYPADKI.map((p) => p.opis);
    expect(opisy.some((o) => /\bbake lid_on$/.test(o))).toBe(true);
    expect(opisy.some((o) => o.includes('(żyto)'))).toBe(true);
    expect(opisy.some((o) => o.includes('(drożdże)'))).toBe(true);
    expect(PRZYPADKI.length).toBeGreaterThan(10);
  });

  for (const e of EKRANY) {
    for (const jezyk of ACTIVE_LANGS) {
      it(`${e.nazwa}, ${jezyk}: dół całego ostrzeżenia nad paskiem kciuka na każdym kroku z ostrzeżeniem`, async () => {
        setLang(jezyk);
        act(() => {
          Dimensions.set({ window: { width: e.szer, height: e.wys, scale: 3, fontScale: 1 }, screen: { width: e.szer, height: e.wys, scale: 3, fontScale: 1 } });
        });
        Object.assign(mockWciecia, { top: e.gora, bottom: e.dol });
        const ponizej: string[] = [];
        for (const p of PRZYPADKI) {
          await saveBakeSession(sesja(p));
          const tree = await render();
          const ramki = ukladEkranu(tree.root, e.szer, e.wys, e.dol);
          const ostrz = ramka(tree.root, ramki, 'step-warning');
          const dol = oknoDol(tree, ramki);
          act(() => tree.unmount());
          const brak = Math.round(ostrz.y + ostrz.h) - Math.floor(dol);
          if (brak > 0) ponizej.push(`${p.opis}: ${brak} pt pod paskiem kciuka`);
        }
        expect(ponizej).toEqual([]);
      });
    }
  }
});
