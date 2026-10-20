/**
 * F-46…F-49 PÓŹNIEJ (ZM-08, D-034 „5 zgodnie z rekomendacją”): wejścia z interfejsu ukryte,
 * kod i dane zostają [M1-audytor-generalny-032; 03-zakres-008; 03-zakres-006].
 * Działanie samych funkcji sprawdzają dalej testy modali, modułów src/core oraz testy ekranów
 * z włączonymi wejściami (calculator-screen, zakwas-screen).
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import CalculatorScreen from '../../app/(tabs)/receptury/index';
import ZakwasScreen from '../../app/(tabs)/zakwasy/index';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { WEJSCIA_WIDOCZNE, wejscieWidoczne, WejsciePozniej } from '../lib/wejscia-pozniej';

jest.setTimeout(20000);

jest.mock('expo-router', () => ({
  useRouter: () => ({ push: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const testIds = (root: renderer.ReactTestInstance): string[] =>
  root.findAll((n) => typeof n.props?.testID === 'string').map((n) => String(n.props.testID));

describe('Hidden entries of LATER features F-46…F-49', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
  });

  it('every LATER entry is switched off in one place', () => {
    // F-50 druk PÓŹNIEJ (D-043) [M1-audytor-generalny-072]
    // F-08 skan i udostępnianie QR PÓŹNIEJ (D-043) [M1-audytor-generalny-049]
    // F-30 spiżarnia mąk PÓŹNIEJ (D-043) [M1-audytor-generalny-097]
    // F-45 przelicznik objętości PÓŹNIEJ [M1-audytor-generalny-098]
    const all: WejsciePozniej[] = ['slownik-mak', 'odrzut-zakwasu', 'strata-piecowa', 'konwerter-zakwasu', 'druk', 'qr', 'rodzina-apps4craft', 'spizarnia', 'przelicznik-objetosci'];
    expect(Object.keys(WEJSCIA_WIDOCZNE).sort()).toEqual([...all].sort());
    expect(all.map(wejscieWidoczne)).toEqual([false, false, false, false, false, false, false, false, false]);
  });

  it('Calculator has no volume converter entry; cups are not an input in 1.0 (F-45)', async () => {
    await act(async () => {
      tree = renderer.create(<CalculatorScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(testIds(tree!.root)).not.toContain('open-volume-converter-btn');
  });

  it('Calculator has no flour pantry entry anywhere, accordion closed or open (F-30, D-043)', async () => {
    await act(async () => {
      tree = renderer.create(<CalculatorScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(testIds(tree!.root)).not.toContain('open-flour-inventory-btn');
    await act(async () => {
      tree!.root.findByProps({ testID: 'artisan-accordion-toggle-btn' }).props.onPress();
    });
    expect(testIds(tree!.root)).not.toContain('open-flour-inventory-btn');
  });

  it('Calculator has no QR scan and no QR sharing entry (F-08, D-043); JSON import stays', async () => {
    await act(async () => {
      tree = renderer.create(<CalculatorScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });
    const ids = testIds(tree!.root);
    expect(ids).toContain('open-import-recipe-btn');
    expect(ids).toContain('import-recipe-json-btn');
    expect(ids.filter((id) => /qr|scan/i.test(id) && id.endsWith('-btn'))).toEqual([]);
  });

  it('Calculator has no print entry: recipe card PDF and jar label are outside 1.0 (F-50, D-043)', async () => {
    await act(async () => {
      tree = renderer.create(<CalculatorScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });
    const ids = testIds(tree!.root);
    expect(ids).toContain('copy-recipe-btn');
    expect(ids).not.toContain('print-menu-btn');
    expect(ids.filter((id) => /print|pdf|druk/i.test(id))).toEqual([]);
  });

  it('Calculator with the PRO accordion open has no flour dictionary entry (F-46) and no bake loss section (F-48)', async () => {
    await act(async () => {
      tree = renderer.create(<CalculatorScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      tree!.root.findByProps({ testID: 'artisan-accordion-toggle-btn' }).props.onPress();
    });
    const ids = testIds(tree!.root);
    // Akordeon jest otwarty: sekcja mieszanki mąk (ta sama co słownik) jest widoczna
    expect(ids).toContain('artisan-accordion-body');
    expect(ids).not.toContain('open-flour-inventory-btn');
    expect(ids).not.toContain('open-flour-equivalents-btn');
    expect(ids.filter((id) => id.startsWith('bake-loss-'))).toEqual([]);
    // Podtytuł akordeonu nie obiecuje ukrytej sekcji
    const texts = tree!.root
      .findAll((n) => (n.type as unknown) === 'Text')
      .map((n) => (Array.isArray(n.props.children) ? n.props.children.join('') : String(n.props.children)));
    expect(texts).toContain('Temperatura wody i zaczyny');
    expect(texts).not.toContain('Temperatura wody, zaczyny, strata piecowa');
  });

  it('Starter screen has no discard recipes entry (F-47) and no starter converter entry (F-49)', async () => {
    await act(async () => {
      tree = renderer.create(<ZakwasScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });
    const ids = testIds(tree!.root);
    expect(ids).toContain('copy-feeding-btn');
    expect(ids).not.toContain('open-discard-recipes-btn');
    expect(ids).not.toContain('open-converter-btn');
  });
});
