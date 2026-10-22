/**
 * M1-audytor-generalny-199 (03-zakres-603, DEC-25 a): dopóki strata piecowa (F-48) jest PÓŹNIEJ
 * z ukrytym wejściem, „Kopiuj jako tekst” z menu „Więcej” receptury nie podaje straty piecowej,
 * wilgotności miękiszu ani masy po upieczeniu (liczby ze stałej 14% bez źródła). Kod liczący zostaje.
 * Droga użytkownika: Receptury → receptura → „Więcej” → „Kopiuj jako tekst” → schowek.
 */
import fs from 'fs';
import path from 'path';
import React from 'react';
import { ActionSheetIOS, Alert } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import * as Clipboard from 'expo-clipboard';
import CalculatorScreen from '../../app/(tabs)/receptury/receptura';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';
import { pokazMenuReceptury } from '../lib/menu-receptury';
import { setLang } from '../lib/i18n';
import { wejscieWidoczne } from '../lib/wejscia-pozniej';

jest.setTimeout(20000);

jest.mock('expo-router', () => ({
  /* M3 D10: ekran z pasem ustawia pasek stanu przy focusie */ useFocusEffect: (cb: () => void) => jest.requireActual('react').useEffect(cb, []), useRouter: () => ({ push: jest.fn(), navigate: jest.fn() }),
  useLocalSearchParams: () => ({}),
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

async function skopiuj(): Promise<string> {
  const set = Clipboard.setStringAsync as jest.Mock;
  set.mockClear();
  const sheet = jest.spyOn(ActionSheetIOS, 'showActionSheetWithOptions').mockImplementation(() => undefined);
  pokazMenuReceptury();
  const [, wybor] = sheet.mock.calls[0];
  await act(async () => {
    wybor(0);
    await new Promise((r) => setTimeout(r, 0));
  });
  sheet.mockRestore();
  expect(set).toHaveBeenCalledTimes(1);
  return String(set.mock.calls[0][0]);
}

describe('199: kopia receptury bez straty piecowej, gdy F-48 PÓŹNIEJ', () => {
  let tree: renderer.ReactTestRenderer | null = null;

  beforeEach(async () => {
    jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    zUprawnieniem();
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
    await act(async () => {
      tree = renderer.create(<CalculatorScreen />);
    });
    await act(async () => {
      await Promise.resolve();
    });
  });
  afterEach(() => {
    if (tree) act(() => tree?.unmount());
    tree = null;
    setLang('pl');
    jest.restoreAllMocks();
  });

  it('F-48 ma ukryte wejście (warunek testu), a kontrakt opisuje stan kodu', () => {
    expect(wejscieWidoczne('strata-piecowa')).toBe(false);
    const kontrakt = fs.readFileSync(path.join(__dirname, '../../docs/scope-contract.md'), 'utf8');
    const wiersz = kontrakt.split(/\r?\n/).find((l) => l.startsWith('| F-48 strata piecowa |')) ?? '';
    expect(wiersz).toMatch(/kod liczący zostaje/);
    expect(wiersz).toMatch(/sekcji na ekranie nie ma/);
    expect(wiersz).toMatch(/DEC-25 a/);
  });

  it('PL: tekst ma recepturę, ale nie stratę, wilgotność ani masę po upieczeniu', async () => {
    const s = await skopiuj();
    expect(s).toContain('Do miski na wagę');
    expect(s).toContain('Masa ciasta');
    for (const brak of ['Strata piecowa', 'Szacowana wilgotność miękiszu', 'po upieczeniu', 'upieczony bochenek', 'Zalecenie studzenia']) {
      expect({ brak, jest: s.includes(brak) }).toEqual({ brak, jest: false });
    }
  });

  it('EN: to samo po angielsku', async () => {
    setLang('en');
    const s = await skopiuj();
    for (const brak of ['Bake loss', 'crumb moisture', 'after baking', 'Baked loaf', 'Strata', 'po upieczeniu']) {
      expect({ brak, jest: s.toLowerCase().includes(brak.toLowerCase()) }).toEqual({ brak, jest: false });
    }
  });
});
