/**
 * M3 p5 (D-160, D-183, D-197): Dziennik na systemie kart (docs/design/karty/README.md §1, §4, §7a; makieta
 * docs/design/karty/inne.html #dziennik-pusty, #dziennik). Struktura, nie wygląd: pusty stan w karcie z ikoną,
 * każdy wpis jako karta z ikoną i nazwą receptury w nagłówku (data, ocena, chipy, notatka, „Piecz ponownie”,
 * „Usuń wpis” w karcie), statystyki w karcie, Doktor Chleba jako wiersz-karta; żaden nagłówek poza pasem nie leży na
 * tle bez karty (wyjątek O2b: nagłówek grupy „Historia wypieków” z ikoną nad kartami, D-184/D-198). Przy dużym
 * tekście rząd przycisków wpisu zawija się (flexBasis od fontScale), bez maxFontSizeMultiplier.
 * Zachowanie (zapis, usuwanie, wyróżnienie z kalendarza) pilnują istniejące testy 146, d7, w2, prz42.
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 0 }),
  };
});
const mockOkno = { width: 320, height: 568, scale: 2, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));
const mockPush = jest.fn();
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    useRouter: () => ({ push: mockPush, navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => void) => React.useEffect(cb, []),
  };
});

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import DziennikScreen from '../../app/(tabs)/dziennik/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore, saveBakeLog, getBakeLogs, deleteBakeLog } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { theme } from '../ui/theme';
import { promienie, typografia } from '../ui/tokeny';
import { setLang } from '../lib/i18n';

jest.setTimeout(30000);

type Wezel = renderer.ReactTestInstance;
const ROZMIAR_TYTULU_KARTY = typografia.style.tytul2.pt - 2;

async function dziennik(): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<AppAccessProvider><DziennikScreen /></AppAccessProvider>);
  });
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
  return tree;
}

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
const maIkone = (k: Wezel, nazwa?: string) =>
  k.findAll((n) => typeof n.props?.testID === 'string' && (nazwa ? n.props.testID === `ikona-karty-${nazwa}` : /^ikona-karty-/.test(n.props.testID))).length > 0;
/** Czy węzeł leży w karcie: przodek z wyglądem karty (promień `karta`, obwódka `kartaLinia` albo akcent wyróżnienia). */
const wKarcie = (n: Wezel): boolean => {
  for (let p: Wezel | null = n.parent; p; p = p.parent) {
    if (typeof p.type !== 'string') continue;
    const s = StyleSheet.flatten(p.props.style) ?? {};
    if (s.borderRadius === promienie.karta && s.backgroundColor === theme.colors.powierzchnia) return true;
  }
  return false;
};
const naPasie = (n: Wezel): boolean => {
  for (let p: Wezel | null = n.parent; p; p = p.parent) if (p.props?.testID === 'pas-zakladki') return true;
  return false;
};
/** Nagłówki (rola header) poza pasem, które nie są w karcie ani nie są nagłówkiem grupy z ikoną (O2b). */
const goleNaglowki = (root: Wezel): string[] =>
  root
    .findAllByType(Text)
    .filter((n) => n.props.accessibilityRole === 'header' && !naPasie(n) && !wKarcie(n))
    .filter((n) => !(jestNaglowkiemKarty(n) && n.parent && maIkone(n.parent)))
    .map(tekst);

describe('M3 p5: Dziennik na kartach', () => {
  beforeEach(async () => {
    setLang('pl');
    Object.assign(mockOkno, { fontScale: 1 });
    zUprawnieniem();
    _resetMemStore();
    await initDatabase();
    for (const b of await getBakeLogs()) await deleteBakeLog(b.id);
    mockPush.mockClear();
  });

  it('pusty Dziennik: zaproszenie w karcie z ikoną (nagłówek karty, tekst i „Wybierz recepturę” w karcie)', async () => {
    const tree = await dziennik();
    const n = tree.root.findAllByType(Text).filter(jestNaglowkiemKarty).find((x) => tekst(x) === 'Tu zapiszą się twoje wypieki');
    expect(n).toBeDefined();
    const btn = jeden(tree.root, 'journal-empty-choose-recipe-btn');
    expect(wKarcie(btn)).toBe(true);
    expect(maIkone(jeden(tree.root, 'karta-dziennik-pusty'), 'kalendarz')).toBe(true);
    expect(goleNaglowki(tree.root)).toEqual([]);
    act(() => tree.unmount());
  });

  it('wpis jako karta: ikona i nazwa receptury w nagłówku karty; ocena, chipy, notatka i oba przyciski w karcie', async () => {
    await saveBakeLog({ id: 'b1', recipeName: 'Mój chleb', startedAt: 1_800_000_000_000, ratingStars: 4, crumbScore: 4, crustScore: 5, ambientTemp: 22, notes: 'Dłużej w lodówce' });
    const tree = await dziennik();
    const karta = jeden(tree.root, 'bake-log-card-b1');
    const s = StyleSheet.flatten(karta.props.style);
    expect(s.borderRadius).toBe(promienie.karta);
    expect(s.borderColor).toBe(theme.colors.kartaLinia);
    const tytul = karta.findAllByType(Text).filter(jestNaglowkiemKarty).map(tekst);
    expect(tytul).toEqual(['Mój chleb']);
    expect(maIkone(karta, 'bochenek')).toBe(true);
    for (const id of ['bake-again-btn-b1', 'delete-bake-log-b1']) expect(poId(karta, id).length).toBeGreaterThan(0);
    expect(tekst(karta)).toContain(', ocena 4/5');
    expect(tekst(karta)).toContain('Dłużej w lodówce');
    expect(goleNaglowki(tree.root)).toEqual([]);
    act(() => tree.unmount());
  });

  it('statystyki w karcie z ikoną; Doktor Chleba jako wiersz-karta z ikoną (cel ≥ 52 pt) prowadzący do /doktor', async () => {
    await saveBakeLog({ id: 'b1', recipeName: 'Mój chleb', startedAt: 1_800_000_000_000, ratingStars: 4 });
    const tree = await dziennik();
    const stat = jeden(tree.root, 'bake-stats-card');
    expect(StyleSheet.flatten(stat.props.style).borderRadius).toBe(promienie.karta);
    expect(stat.findAllByType(Text).filter(jestNaglowkiemKarty).map(tekst)).toEqual(['Statystyki piekarni domowej']);
    expect(maIkone(stat, 'proporcje')).toBe(true);
    const dr = tree.root.findAll((n) => n.props.testID === 'dziennik-doktor-btn' && typeof n.props.onPress === 'function')[0];
    const sd = StyleSheet.flatten(typeof dr.props.style === 'function' ? dr.props.style({ pressed: false }) : dr.props.style);
    expect(sd.borderRadius).toBe(promienie.karta);
    expect(sd.minHeight).toBeGreaterThanOrEqual(52);
    expect(maIkone(dr, 'bochenek')).toBe(true);
    expect(dr.props.accessibilityLabel).toBe('Doktor Chleba');
    await act(async () => dr.props.onPress());
    expect(mockPush).toHaveBeenCalledWith('/doktor');
    act(() => tree.unmount());
  });

  it('duży tekst (AX5 przy 320 pt): przyciski wpisu w kolumnie (flexBasis 100%), bez maxFontSizeMultiplier w kartach', async () => {
    await saveBakeLog({ id: 'b1', recipeName: 'Mój chleb', startedAt: 1_800_000_000_000, ratingStars: 4 });
    const pomiar = async (fs: number) => {
      Object.assign(mockOkno, { fontScale: fs });
      const tree = await dziennik();
      const btn = StyleSheet.flatten(jeden(tree.root, 'bake-again-btn-b1').props.style);
      const limit = jeden(tree.root, 'bake-log-card-b1').findAllByType(Text).filter((n) => n.props.maxFontSizeMultiplier !== undefined);
      act(() => tree.unmount());
      return { btn, limit };
    };
    const maly = await pomiar(1);
    const duzy = await pomiar(3.1);
    expect(duzy.btn.flexBasis).toBe('100%');
    expect(maly.btn.flexBasis).not.toBe('100%');
    expect(duzy.limit).toHaveLength(0);
    expect(maly.limit).toHaveLength(0);
  });
});
