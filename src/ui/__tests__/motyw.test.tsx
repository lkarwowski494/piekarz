// 050: wariant motywu według ustawienia iOS (D-045) i „Zwiększ kontrast” (mapa-rol.md §3, test akceptacyjny 050 pkt 3)
// [M1-audytor-generalny-050; 04-studio-projektowe-002, 04-studio-projektowe-003, 04-studio-projektowe-016, 08-programista-019]
import React from 'react';
import { AccessibilityInfo, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { kolorDynamiczny, useMotyw, wybierzWariant } from '../motyw';
import { kolory } from '../tokeny';

const mockSchemat = jest.fn<'light' | 'dark' | null, []>();
jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({
  __esModule: true,
  default: () => mockSchemat(),
}));

type Sluchacz = (wlaczone: boolean) => void;

async function renderujMotyw(schemat: 'light' | 'dark' | null, kontrast: boolean) {
  mockSchemat.mockReturnValue(schemat);
  const sluchacze: Sluchacz[] = [];
  jest.spyOn(AccessibilityInfo, 'isDarkerSystemColorsEnabled').mockResolvedValue(kontrast);
  const atrapa = (zdarzenie: string, handler: Sluchacz) => {
    if (zdarzenie === 'darkerSystemColorsChanged') sluchacze.push(handler);
    return { remove: jest.fn() };
  };
  jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockImplementation(atrapa as unknown as typeof AccessibilityInfo.addEventListener);
  let wynik: ReturnType<typeof useMotyw> | null = null;
  function Sonda() {
    wynik = useMotyw();
    return <Text>{wynik.wariant}</Text>;
  }
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<Sonda />);
  });
  return { odczyt: () => wynik!, sluchacze, tree: tree! };
}

afterEach(() => jest.restoreAllMocks());

describe('useMotyw', () => {
  it('ciemny + Zwiększ kontrast → ciemnyKontrast z paletą hex tego wariantu', async () => {
    const { odczyt, tree } = await renderujMotyw('dark', true);
    expect(odczyt().wariant).toBe('ciemnyKontrast');
    expect(odczyt().kolory).toEqual(kolory.ciemnyKontrast);
    act(() => tree.unmount());
  });

  it('jasny bez zwiększonego kontrastu → jasny', async () => {
    const { odczyt, tree } = await renderujMotyw('light', false);
    expect(odczyt().wariant).toBe('jasny');
    expect(odczyt().kolory.tlo).toBe(kolory.jasny.tlo);
    act(() => tree.unmount());
  });

  it('zdarzenie darkerSystemColorsChanged przełącza wariant bez ponownego uruchomienia', async () => {
    const { odczyt, sluchacze, tree } = await renderujMotyw('light', false);
    expect(sluchacze.length).toBe(1);
    await act(async () => sluchacze[0](true));
    expect(odczyt().wariant).toBe('jasnyKontrast');
    act(() => tree.unmount());
  });
});

describe('kolorDynamiczny', () => {
  it('na iOS niesie wszystkie 4 warianty tokenu (DynamicColorIOS)', () => {
    expect(kolorDynamiczny('akcent', 'ios')).toEqual({
      dynamic: {
        light: kolory.jasny.akcent,
        dark: kolory.ciemny.akcent,
        highContrastLight: kolory.jasnyKontrast.akcent,
        highContrastDark: kolory.ciemnyKontrast.akcent,
      },
    });
  });

  it('poza iOS (podgląd web) daje hex wariantu jasnego', () => {
    expect(kolorDynamiczny('tlo', 'web')).toBe(kolory.jasny.tlo);
  });
});

describe('wybierzWariant', () => {
  it.each([
    ['dark', false, 'ciemny'],
    ['dark', true, 'ciemnyKontrast'],
    ['light', false, 'jasny'],
    ['light', true, 'jasnyKontrast'],
    [null, false, 'jasny'],
  ] as const)('%s, kontrast %s → %s', (schemat, kontrast, wariant) => {
    expect(wybierzWariant(schemat, kontrast)).toBe(wariant);
  });
});
