// a1 (M3 p1): nagłówek natywnego stosu w trybie ciemnym. Na iOS 26 (TestFlight 1.0.0 (1014)) pas nagłówka miał tło
// wariantu jasnego, a tytuł był niewidoczny, bo kolory szły do natywnej strony jako DynamicColorIOS tworzone raz
// przy imporcie. Opcje nagłówka mają więc dawać hex bieżącego wariantu (useMotyw), we wszystkich 4 wariantach.
import React from 'react';
import { AccessibilityInfo, StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { opcjeNaglowka, useNaglowek } from '../naglowek';
import { kolory, type WariantMotywu } from '../tokeny';

const mockSchemat = jest.fn<'light' | 'dark' | null, []>();
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockSchemat(),
}));

const lin = (c: number) => {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const lum = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * lin(n >> 16) + 0.7152 * lin((n >> 8) & 255) + 0.0722 * lin(n & 255);
};
const kontrast = (a: string, b: string) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const WARIANTY: [WariantMotywu, 'light' | 'dark', boolean][] = [
  ['jasny', 'light', false],
  ['ciemny', 'dark', false],
  ['jasnyKontrast', 'light', true],
  ['ciemnyKontrast', 'dark', true],
];

async function renderuj(schemat: 'light' | 'dark', zwiekszonyKontrast: boolean) {
  mockSchemat.mockReturnValue(schemat);
  jest.spyOn(AccessibilityInfo, 'isDarkerSystemColorsEnabled').mockResolvedValue(zwiekszonyKontrast);
  jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockImplementation((() => ({ remove: jest.fn() })) as unknown as typeof AccessibilityInfo.addEventListener);
  let wynik: ReturnType<typeof useNaglowek> | null = null;
  function Sonda() {
    wynik = useNaglowek();
    return <Text>x</Text>;
  }
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<Sonda />);
  });
  act(() => tree!.unmount());
  return wynik!;
}

afterEach(() => jest.restoreAllMocks());

describe.each(WARIANTY)('opcje nagłówka w wariancie %s (a1)', (wariant, schemat, kontrastSystemu) => {
  const k = kolory[wariant];

  it('zwykły: tło, tytuł i akcje to hex tego wariantu, a nie DynamicColorIOS', async () => {
    const { zwykly } = await renderuj(schemat, kontrastSystemu);
    expect(zwykly.headerStyle.backgroundColor).toBe(k.tlo);
    expect(zwykly.contentStyle.backgroundColor).toBe(k.tlo);
    expect(zwykly.headerTintColor).toBe(k.akcentTekst);
    expect(StyleSheet.flatten(zwykly.headerTitleStyle).color).toBe(k.tusz);
  });

  it('duży tytuł: tło paska i dużego tytułu oraz kolor obu tytułów to hex tego wariantu', async () => {
    const { duzy } = await renderuj(schemat, kontrastSystemu);
    expect(duzy.contentStyle.backgroundColor).toBe(k.tlo);
    expect(StyleSheet.flatten(duzy.headerTitleStyle).color).toBe(k.tusz);
    expect(StyleSheet.flatten(duzy.headerLargeTitleStyle).color).toBe(k.tusz);
  });

  it('tytuł i przycisk wstecz mają kontrast co najmniej 4.5:1 z tłem nagłówka', async () => {
    const { duzy } = await renderuj(schemat, kontrastSystemu);
    const tlo = String(duzy.contentStyle.backgroundColor); // pod przezroczystym paskiem widać tło ekranu
    expect(kontrast(String(StyleSheet.flatten(duzy.headerTitleStyle).color), tlo)).toBeGreaterThanOrEqual(4.5);
    expect(kontrast(String(duzy.headerTintColor), tlo)).toBeGreaterThanOrEqual(4.5);
  });

  it('opcjeNaglowka(paleta) zależy tylko od palety', () => {
    expect(opcjeNaglowka(k, true, 'android').headerLargeStyle.backgroundColor).toBe(k.tlo);
    expect(opcjeNaglowka(k, false).headerLargeTitleEnabled).toBe(false);
    expect(opcjeNaglowka(k, true).headerLargeTitleEnabled).toBe(true);
  });

  // Biblioteka przy dużym tytule na iOS nie ustawia tła paska: na iOS 26 tytuł znika, gdy tło jest ustawione
  // (expo-router useHeaderConfigProps.js:157-163). Tło ekranu zostaje w contentStyle.
  it('iOS, duży tytuł: bez tła w headerStyle i headerLargeStyle, contentStyle ma tło wariantu', () => {
    const o = opcjeNaglowka(k, true, 'ios');
    expect(o.headerStyle).not.toHaveProperty('backgroundColor');
    expect(o.headerLargeStyle).not.toHaveProperty('backgroundColor');
    expect(o.contentStyle.backgroundColor).toBe(k.tlo);
    expect(StyleSheet.flatten(o.headerLargeTitleStyle).color).toBe(k.tusz);
  });

  it('iOS, nagłówek zwykły: tło paska zostaje', () => {
    expect(opcjeNaglowka(k, false, 'ios').headerStyle.backgroundColor).toBe(k.tlo);
  });
});
