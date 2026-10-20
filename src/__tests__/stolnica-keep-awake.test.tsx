/**
 * Blokada wygaszania ekranu tylko podczas aktywnego wypieku na widocznej Stolnicy; wyjście z zakładki
 * albo koniec wypieku ją zwalnia [M1-audytor-generalny-060; 08-programista-009].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';

const mockActivate = jest.fn();
const mockDeactivate = jest.fn();
jest.mock('expo-keep-awake', () => {
  const React = require('react');
  return {
    useKeepAwake: (tag?: string) =>
      React.useEffect(() => {
        mockActivate(tag);
        return () => mockDeactivate(tag);
      }, [tag]),
  };
});

// Fokus ekranu sterowany z testu: wejście na zakładkę i wyjście z niej
let mockBlur: (() => void) | null = null;
let mockFocus: (() => void) | null = null;
jest.mock('expo-router', () => {
  const React = require('react');
  return {
    // Prowadzenie ustawia przycisk „Plan wypieku” w pasku nawigacji (Stack.Screen, 056): przycisk w drzewie ekranu
    Stack: { Screen: ({ options }: { options?: { headerRight?: () => unknown } }) => (options?.headerRight ? options.headerRight() : null) },
    useRouter: () => ({ push: jest.fn(), navigate: jest.fn(), replace: jest.fn(), back: jest.fn() }),
    useLocalSearchParams: () => ({}),
    useFocusEffect: (cb: () => (() => void) | void) => {
      const [focused, setFocused] = React.useState(true);
      mockBlur = () => setFocused(false);
      mockFocus = () => setFocused(true);
      React.useEffect(() => (focused ? cb() : undefined), [focused, cb]);
    },
  };
});
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: any) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import StolnicaScreen from '../../app/stolnica';
import { StolnicaKeepAwake } from '../components/stolnica/StolnicaKeepAwake';
import { initDatabase, setActiveBake, _resetMemStore } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

jest.setTimeout(20000);

describe('blokada wygaszania ekranu na Stolnicy', () => {
  beforeEach(async () => {
    zUprawnieniem();
    jest.clearAllMocks();
    _resetMemStore();
    setActiveBake(null);
    await initDatabase();
  });

  it('Stolnica bez aktywnego wypieku nie blokuje wygaszania', async () => {
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<StolnicaScreen />);
    });
    expect(mockActivate).not.toHaveBeenCalled();
    act(() => tree!.unmount());
  });

  it('aktywny wypiek na widocznej Stolnicy blokuje; wyjście z zakładki i koniec wypieku zwalniają (BR-REKA-001 Krok czynny)', async () => {
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<StolnicaKeepAwake active />);
    });
    expect(mockActivate).toHaveBeenCalledTimes(1);
    const tag = mockActivate.mock.calls[0][0];

    await act(async () => mockBlur!());
    expect(mockDeactivate).toHaveBeenCalledWith(tag);

    await act(async () => mockFocus!());
    expect(mockActivate).toHaveBeenCalledTimes(2);

    await act(async () => tree!.update(<StolnicaKeepAwake active={false} />));
    expect(mockDeactivate).toHaveBeenCalledTimes(2);
    act(() => tree!.unmount());
  });
});
