/**
 * Build bez modułu aparatu (expo-camera wykluczony z autolinkingu, F-08 PÓŹNIEJ): otwarcie skanera daje
 * czytelny komunikat zamiast awarii, a okno skanera się zamyka [M1-audytor-generalny-049].
 */
jest.mock('expo-keep-awake', () => ({ useKeepAwake: jest.fn() }));
jest.mock('react-native-safe-area-context', () => {
  const R = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: unknown; style?: unknown }) => R.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});
jest.mock('../lib/wejscia-pozniej', () => {
  const actual = jest.requireActual('../lib/wejscia-pozniej');
  return { ...actual, wejscieWidoczne: (w: string) => w === 'qr' || actual.wejscieWidoczne(w) };
});
jest.mock('../lib/qr-skaner', () => ({ ladujSkanerQr: () => null }));

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { Alert } from 'react-native';
import CalculatorScreen from '../../app/(tabs)/index';
import { AppAccessProvider } from '../components/AppAccessProvider';
import { initDatabase, _resetMemStore } from '../data/sqlite-store';
import { setLang } from '../lib/i18n';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

const flush = async () => {
  await act(async () => {
    for (let i = 0; i < 30; i++) await Promise.resolve();
  });
};

describe('skaner QR bez modułu natywnego (049)', () => {
  afterEach(() => setLang('pl'));

  it.each([
    ['pl', 'Skaner QR', 'Skaner QR jest niedostępny w tej wersji aplikacji.'],
    ['en', 'QR scanner', 'The QR scanner is not available in this version of the app.'],
  ] as const)('%s: komunikat zamiast awarii', async (lang, tytul, tresc) => {
    _resetMemStore();
    zUprawnieniem();
    await initDatabase();
    setLang(lang);
    const alert = jest.spyOn(Alert, 'alert').mockImplementation(() => undefined);
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <AppAccessProvider>
          <CalculatorScreen />
        </AppAccessProvider>
      );
    });
    await flush();
    const btn = tree!.root.findAll((n) => n.props?.testID === 'open-scan-qr-btn' && typeof n.props.onPress === 'function');
    await act(async () => {
      btn[btn.length - 1].props.onPress();
    });
    await flush();
    expect(alert).toHaveBeenCalledWith(tytul, tresc);
    act(() => tree!.unmount());
    alert.mockRestore();
  });
});
