/**
 * M3 p5 (D-197, O3a D-141): Doktor Chleba z pasem marki zamiast nagłówka systemowego (nagłówek stosu ukryty:
 * tests/nawigacja-d051.test.tsx). Zastępstwo asercji nagłówka systemowego: pas w kolorze `pas` na górze ekranu,
 * tytuł „Doktor Chleba” na pasie jako nagłówek VoiceOver, powrót samą ikoną z etykietą (poprzedni ekran bywa różny:
 * Dziennik, prowadzenie, koniec wypieku; jak D-195) → router.back(). Treść pod pasem w kartach z ikoną (README §1):
 * wynik (pusty i z diagnozą), protokoły ratunkowe, objawy, testy w kuchni; żaden nagłówek poza pasem bez karty.
 */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 47, left: 0, right: 0, bottom: 0 }),
  };
});
const mockOkno = { width: 320, height: 568, scale: 2, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));
const mockBack = jest.fn();
const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useFocusEffect: (cb: () => void) => jest.requireActual('react').useEffect(cb, []),
  useRouter: () => ({ push: mockPush, back: mockBack }),
}));

import React from 'react';
import { StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import DoctorScreen from '../../app/doktor';
import { theme } from '../ui/theme';
import { promienie, typografia } from '../ui/tokeny';
import { setLang } from '../lib/i18n';

jest.setTimeout(20000);

type Wezel = renderer.ReactTestInstance;
const ROZMIAR_TYTULU_KARTY = typografia.style.tytul2.pt - 2;

async function zamontuj(): Promise<renderer.ReactTestRenderer> {
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<DoctorScreen />);
  });
  await act(async () => {
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return tree;
}
const tekst = (n: Wezel): string => n.children.map((c) => (typeof c === 'string' ? c : tekst(c))).join('');
const poId = (root: Wezel, id: string): Wezel[] => root.findAll((n) => n.props?.testID === id && typeof n.type === 'string');
const styl = (n: Wezel) => StyleSheet.flatten(n.props.style) ?? {};
const naPasie = (n: Wezel): boolean => {
  for (let p: Wezel | null = n.parent; p; p = p.parent) if (p.props?.testID === 'pas-zakladki') return true;
  return false;
};
const karta = (n: Wezel): Wezel | null => {
  for (let p: Wezel | null = n.parent; p; p = p.parent) {
    const s = typeof p.type === 'string' ? styl(p) : {};
    if (s.borderRadius === promienie.karta && s.backgroundColor === theme.colors.powierzchnia) return p;
  }
  return null;
};
const jestNaglowkiemKarty = (n: Wezel) => {
  const s = styl(n);
  return n.props.accessibilityRole === 'header' && s.fontSize === ROZMIAR_TYTULU_KARTY && s.fontFamily === theme.typography.krojTytulow;
};
const maIkone = (k: Wezel) => k.findAll((n) => typeof n.props?.testID === 'string' && /^ikona-karty-/.test(n.props.testID)).length > 0;
const kartaZ = (root: Wezel, tytul: string): Wezel => {
  const n = root.findAllByType(Text).filter(jestNaglowkiemKarty).find((x) => tekst(x) === tytul);
  if (!n) throw new Error(`brak nagłówka karty „${tytul}”`);
  const k = karta(n);
  if (!k) throw new Error(`nagłówek „${tytul}” poza kartą`);
  return k;
};

describe('M3 p5: Doktor Chleba z pasem O3a i treścią w kartach', () => {
  beforeEach(() => {
    setLang('pl');
    mockBack.mockClear();
  });

  it('pas w kolorze `pas`: tytuł „Doktor Chleba” jako nagłówek VoiceOver, powrót z etykietą → router.back()', async () => {
    const tree = await zamontuj();
    const [pas] = poId(tree.root, 'pas-zakladki');
    expect(pas).toBeDefined();
    expect(styl(pas).backgroundColor).toBe(theme.colors.pas);
    const tytul = pas.findAllByType(Text).filter((n) => n.props.accessibilityRole === 'header').map(tekst);
    expect(tytul).toEqual(['Doktor Chleba']);
    const wstecz = pas.findAll((n) => n.props.accessibilityRole === 'button' && n.props.accessibilityLabel === 'Wstecz' && typeof n.props.onPress === 'function');
    expect(wstecz.length).toBeGreaterThan(0);
    await act(async () => wstecz[0].props.onPress());
    expect(mockBack).toHaveBeenCalledTimes(1);
    act(() => tree.unmount());
  });

  it('treść w kartach z ikoną: wynik, objawy, testy w kuchni; brak gołych nagłówków poza pasem', async () => {
    const tree = await zamontuj();
    for (const n of ['Wybierz objawy bochenka', 'Test palca', 'Test okna glutenowego']) expect(maIkone(kartaZ(tree.root, n))).toBe(true);
    const gole = tree.root.findAllByType(Text).filter((n) => n.props.accessibilityRole === 'header' && !naPasie(n) && !karta(n)).map(tekst);
    expect(gole).toEqual([]);
    act(() => tree.unmount());
  });
});
