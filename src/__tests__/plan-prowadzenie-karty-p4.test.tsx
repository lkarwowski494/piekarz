/**
 * M3 p4 (D-160, D-183, D-190): Plan i Prowadzenie na systemie kart (docs/design/karty/README.md §1–§4, §7a; makieta
 * docs/design/karty/wypiek.html #plan, #prowadzenie). Struktura, nie wygląd:
 * plan — „Kiedy chleb ma być gotowy?”, temperatura, sen i oś czasu w kartach z ikonami, na tle żaden goły nagłówek;
 * prowadzenie — instrukcja kroku i składniki w kartach z ikonami, ostrzeżenie bez zmian (pole Ostrzezenie poza kartą);
 * duży tekst (AX5 przy 320 pt) — flexBasis zależny od fontScale, w kartach bez maxFontSizeMultiplier poza tokenem AX5
 * cyfr czasu (typografia.style.czas.ax5). Zachowanie (plan wstecz, sen, start, kroki) pilnują istniejące testy.
 * Pas (O3) nie jest tu sprawdzany: wymaga zmiany istniejących testów nagłówka (D-191).
 */
jest.mock('expo-sqlite', () => require('../data/__tests__/helpers/node-sqlite-adapter').createExpoSqliteMock());
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  impactAsync: jest.fn(),
  NotificationFeedbackType: { Success: 'success' },
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import HarmonogramScreen from '../../app/(tabs)/receptury/harmonogram';
import StolnicaScreen from '../../app/stolnica';
import { initDatabase, setActiveBake } from '../data/sqlite-store';
import { useTempDbDir } from '../data/__tests__/helpers/node-sqlite-adapter';
import { saveBakeSession } from '../data/bake-session-store';
import { calculateDoughRecipe } from '../core/domain-rules';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import type { SessionStep } from '../core/bake-steps';
import { theme } from '../ui/theme';
import { promienie, typografia } from '../ui/tokeny';
import { setLang } from '../lib/i18n';
import { zapiszProfilSnu, _resetGodzinySnu } from '../lib/godziny-snu';

jest.setTimeout(30000);

type Wezel = renderer.ReactTestInstance;
const ROZMIAR_TYTULU_KARTY = typografia.style.tytul2.pt - 2;
const LIMIT_CZASU = typografia.style.czas.ax5 / typografia.style.czas.pt;

const tekst = (n: Wezel): string => n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');
const poId = (root: Wezel, id: string): Wezel[] => root.findAll((n) => n.props?.testID === id && typeof n.type === 'string');
const jeden = (root: Wezel, id: string): Wezel => {
  const w = poId(root, id);
  expect(w.length).toBeGreaterThan(0);
  return w[0];
};
const jestNaglowkiemKarty = (n: Wezel) => {
  const s = StyleSheet.flatten(n.props.style) ?? {};
  return n.props.accessibilityRole === 'header' && s.fontSize === ROZMIAR_TYTULU_KARTY && s.fontFamily === theme.typography.krojTytulow;
};
const naglowki = (root: Wezel) => root.findAllByType(Text).filter((n) => n.props.accessibilityRole === 'header');
const naglowkiKart = (root: Wezel): string[] => naglowki(root).filter(jestNaglowkiemKarty).map(tekst);
/** Karta = widok z wyglądem karty (promień `karta`, obwódka `kartaLinia`; src/ui/karty/Karta.tsx `wygladKarty`). */
const czyKarta = (p: Wezel) => {
  if (typeof p.type !== 'string') return false;
  const s = StyleSheet.flatten(p.props.style) ?? {};
  return s.borderRadius === promienie.karta && s.borderColor === theme.colors.kartaLinia;
};
/** Karta z nagłówkiem zaczynającym się od `tytul`: najbliższy przodek z wyglądem karty. */
const kartaZ = (root: Wezel, tytul: string): Wezel => {
  const n = naglowki(root).filter(jestNaglowkiemKarty).find((x) => tekst(x).startsWith(tytul));
  if (!n) throw new Error(`brak nagłówka karty „${tytul}”; są: ${naglowkiKart(root).join(' | ')}`);
  let p: Wezel | null = n.parent;
  while (p && !czyKarta(p)) p = p.parent;
  if (!p) throw new Error(`nagłówek „${tytul}” poza kartą`);
  return p;
};
const wKarcie = (n: Wezel): boolean => {
  let p: Wezel | null = n.parent;
  while (p && !czyKarta(p)) p = p.parent;
  return p !== null;
};
const ikona = (k: Wezel, nazwa: string) => k.findAll((n) => n.props?.testID === `ikona-karty-${nazwa}`).length > 0;
/** Teksty w kartach z limitem skali innym niż token AX5 cyfr czasu (README §7a). */
const limityWKartach = (root: Wezel) =>
  root
    .findAll((n) => czyKarta(n))
    .flatMap((k) => k.findAllByType(Text))
    .filter((n) => n.props.maxFontSizeMultiplier !== undefined && n.props.maxFontSizeMultiplier !== LIMIT_CZASU)
    .map(tekst);

async function zamontuj(el: React.ReactElement): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(el);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree;
}

async function plan() {
  jest.spyOn(Date, 'now').mockImplementation(() => new Date(2026, 9, 21, 20, 15).getTime());
  return zamontuj(<HarmonogramScreen />);
}

const teraz = Date.now();
const krok = (id: string, name: string, category: SessionStep['category'], od: number, instructions = ''): SessionStep => ({
  id, name, category, durationMin: 30, isPassive: false, instructions, plannedStart: teraz + od * 1_800_000, plannedEnd: teraz + (od + 1) * 1_800_000,
});
const formula = { flours: [{ name: 'Mąka pszenna 750', percentage: 100 }], waterPercentage: 70, saltPercentage: 2, starterPercentage: 20, targetDoughWeightGrams: 1000 };

async function prowadzenie(steps: SessionStep[]) {
  setActiveBake({ id: `bake_${steps[0].id}`, recipeName: 'Wiejski', startedAt: teraz, currentStageId: steps[0].id, steps, calculatedRecipe: calculateDoughRecipe(formula), recipeFormula: formula });
  return zamontuj(<StolnicaScreen />);
}
/** Kroki z prefiksem id: każdy montaż w jednym teście to inny wypiek (ten sam id byłby już w bazie). */
const kroki = (p = 'k') => [krok(`${p}m`, 'Mieszanie i autoliza', 'mix', 0, 'Wymieszaj mąkę z wodą.'), krok(`${p}s`, 'Fermentacja', 'bulk_ferment', 1), krok(`${p}p`, 'Pieczenie', 'bake', 2)];

describe('M3 p4: Plan i Prowadzenie na kartach', () => {
  beforeEach(async () => {
    useTempDbDir();
    setLang('pl');
    Object.assign(mockOkno, { width: 390, fontScale: 1 });
    zUprawnieniem();
    setActiveBake(null);
    await initDatabase();
    await saveBakeSession(null);
  });
  afterEach(async () => {
    jest.restoreAllMocks();
    await zapiszProfilSnu('standard');
    _resetGodzinySnu();
  });

  it('plan: „Kiedy gotowy”, temperatura, sen i oś czasu w kartach z ikonami', async () => {
    const tree = await plan();
    const kiedy = kartaZ(tree.root, 'Kiedy chleb ma być gotowy?');
    expect(poId(kiedy, 'plan-pole-gotowosci').length).toBeGreaterThan(0);
    expect(ikona(kiedy, 'zegar')).toBe(true);
    const temp = kartaZ(tree.root, 'Temperatura w kuchni:');
    expect(tekst(temp)).toContain('Wpływa na tempo fermentacji burzliwej');
    expect(ikona(temp, 'termometr')).toBe(true);
    const sen = jeden(tree.root, 'sleep-guard-banner');
    expect(wKarcie(sen)).toBe(true);
    const os = kartaZ(tree.root, 'Oś czasu przygotowania');
    expect(poId(os, 'timeline-item-0').length).toBeGreaterThan(0);
    expect(os.findAll((n) => n.props?.testID === 'brand-spiral').length).toBeGreaterThan(0);
    expect(ikona(os, 'lista')).toBe(true);
    const ust = kartaZ(tree.root, 'Ustawienia');
    expect(poId(ust, 'copy-schedule-btn').length).toBeGreaterThan(0);
    expect(ikona(ust, 'zebatka')).toBe(true);
    act(() => tree.unmount());
  });

  it('plan: każdy nagłówek treści to nagłówek karty (na tle żaden goły nagłówek)', async () => {
    const tree = await plan();
    const gole = naglowki(tree.root).filter((n) => !jestNaglowkiemKarty(n) || !wKarcie(n)).map(tekst);
    expect(gole).toEqual([]);
    act(() => tree.unmount());
  });

  it('plan: „Plan nie sprawdza godzin snu” w karcie „Godziny snu”, gdy w Ustawieniach brak godzin snu', async () => {
    await zapiszProfilSnu('brak');
    const tree = await plan();
    const k = kartaZ(tree.root, 'Godziny snu');
    expect(tekst(k)).toContain('Plan nie sprawdza godzin snu');
    act(() => tree.unmount());
  });

  it('prowadzenie: instrukcja kroku w karcie „Krok 1 z 3”, składniki w karcie z ikoną, ostrzeżenie poza kartą', async () => {
    const tree = await prowadzenie(kroki());
    const k = kartaZ(tree.root, 'Krok 1 z 3');
    expect(tekst(k)).toContain('Wymieszaj mąkę z wodą.');
    expect(ikona(k, 'ksiazka')).toBe(true);
    const s = kartaZ(tree.root, 'Składniki do odważenia');
    expect(poId(s, 'skladnik-maka').length).toBeGreaterThan(0);
    expect(ikona(s, 'waga')).toBe(true);
    // Tytuł kroku i czas zostają nad kartami (przyszły pas, D-191)
    expect(wKarcie(jeden(tree.root, 'step-title'))).toBe(false);
    act(() => tree.unmount());
  });

  it('prowadzenie: ostrzeżenie kroku (garnek) bez zmian i poza kartą instrukcji', async () => {
    const tree = await prowadzenie([krok('p', 'Pieczenie', 'bake', 0), krok('k', 'Studzenie', 'cool', 1)]);
    const ostrz = poId(tree.root, 'step-warning');
    expect(ostrz.length).toBeGreaterThan(0);
    for (const o of ostrz) expect(wKarcie(o)).toBe(false);
    expect(naglowkiKart(tree.root)).toContain('Krok 1 z 2');
    act(() => tree.unmount());
  });

  it('duży tekst (AX5 przy 320 pt): flexBasis zależny od fontScale, w kartach bez maxFontSizeMultiplier', async () => {
    const pomiar = async (fs: number) => {
      Object.assign(mockOkno, { width: 320, fontScale: fs });
      const p = await plan();
      const pole = StyleSheet.flatten(jeden(p.root, 'plan-pole-gotowosci').props.style);
      const limitPlanu = limityWKartach(p.root);
      act(() => p.unmount());
      jest.restoreAllMocks();
      const s = await prowadzenie(kroki(`fs${fs}`));
      const nazwa = StyleSheet.flatten(jeden(s.root, 'skladnik-maka-nazwa').props.style);
      const limitProwadzenia = limityWKartach(s.root);
      act(() => s.unmount());
      return { pole, nazwa, limitPlanu, limitProwadzenia };
    };
    const maly = await pomiar(1);
    const duzy = await pomiar(3.1);
    expect(duzy.pole.flexBasis).toBe('100%');
    expect(maly.pole.flexBasis).not.toBe('100%');
    expect(duzy.nazwa.flexBasis).toBe('100%');
    expect(maly.nazwa.flexBasis).not.toBe('100%');
    expect(duzy.limitPlanu).toEqual([]);
    expect(duzy.limitProwadzenia).toEqual([]);
    expect(maly.limitPlanu).toEqual([]);
  });
});
