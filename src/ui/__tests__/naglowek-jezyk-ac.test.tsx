/**
 * `useNaglowek` po zmianie języka (KO-071, recenzja AB-05, D-423): opcje nagłówków natywnych stosów są memoizowane
 * (`useMemo`), a krój tytułu zależy od języka (ru/uk/vi/ja/ko/zh-Hant: krój systemowy). `jezyk` w zależnościach wymusza
 * przeliczenie; bez niego nagłówki zostawały przy starym kroju po zmianie języka w Ustawieniach.
 */
import React from 'react';
import { AccessibilityInfo, StyleSheet, Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { useNaglowek } from '../naglowek';
import { typografia } from '../tokeny';
import { setLang } from '../../lib/i18n';

jest.mock('react-native/Libraries/Utilities/useColorScheme', () => ({ __esModule: true, default: () => 'light' }));

const krojZ = (styl: unknown) => StyleSheet.flatten(styl as Parameters<typeof StyleSheet.flatten>[0]).fontFamily;

const drzewa: renderer.ReactTestRenderer[] = [];

async function sonda() {
  jest.spyOn(AccessibilityInfo, 'isDarkerSystemColorsEnabled').mockResolvedValue(false);
  jest
    .spyOn(AccessibilityInfo, 'addEventListener')
    .mockImplementation((() => ({ remove: jest.fn() })) as unknown as typeof AccessibilityInfo.addEventListener);
  const wyniki: Array<ReturnType<typeof useNaglowek>> = [];
  function Sonda() {
    wyniki.push(useNaglowek());
    return <Text>x</Text>;
  }
  let tree!: renderer.ReactTestRenderer;
  await act(async () => {
    tree = renderer.create(<Sonda />);
  });
  drzewa.push(tree);
  return { tree, ostatni: () => wyniki[wyniki.length - 1]! };
}

afterEach(() => {
  // Drzewo odmontowane także po nieudanej asercji: bez nasłuchu języka z poprzedniego testu
  act(() => drzewa.splice(0).forEach((t) => t.unmount()));
  setLang('pl');
  jest.restoreAllMocks();
});

describe('useNaglowek: zmiana języka przelicza opcje nagłówka (AB-05)', () => {
  it.each(['ru', 'uk', 'vi', 'ja', 'ko', 'zh-Hant'] as const)('pl → %s: tytuł zwykły i duży przechodzą na krój systemowy', async (jezyk) => {
    setLang('pl');
    const { ostatni } = await sonda();
    expect(krojZ(ostatni().zwykly.headerTitleStyle)).toBe(typografia.krojTytulow);
    expect(krojZ(ostatni().duzy.headerLargeTitleStyle)).toBe(typografia.krojTytulow);
    await act(async () => {
      setLang(jezyk);
    });
    expect(krojZ(ostatni().zwykly.headerTitleStyle)).toBeUndefined();
    expect(krojZ(ostatni().duzy.headerTitleStyle)).toBeUndefined();
    expect(krojZ(ostatni().duzy.headerLargeTitleStyle)).toBeUndefined();
  });

  it('ru → pl: wraca Sofia', async () => {
    setLang('ru');
    const { ostatni } = await sonda();
    expect(krojZ(ostatni().zwykly.headerTitleStyle)).toBeUndefined();
    await act(async () => {
      setLang('pl');
    });
    expect(krojZ(ostatni().zwykly.headerTitleStyle)).toBe(typografia.krojTytulow);
  });

  it('ta sama grupa krojów (pl → en): opcje bez zmiany kroju', async () => {
    setLang('pl');
    const { ostatni } = await sonda();
    await act(async () => {
      setLang('en');
    });
    expect(krojZ(ostatni().zwykly.headerTitleStyle)).toBe(typografia.krojTytulow);
  });
});
