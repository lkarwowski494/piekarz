// 054: pasek zakładek używa bezpiecznego marginesu systemu (wskaźnik Home), etykiety bez ucięcia
// (docs/design/design-spec.md §4 i §11: „systemowy, z marginesem wskaźnika Home (makieta: 34 pt)”)
// [M1-audytor-generalny-054; 04-studio-projektowe-009]
//
// Reguła: ekran zakładek nie nadpisuje wysokości ani dolnego/górnego odstępu paska (`height`, `paddingBottom`,
// `paddingTop` w tabBarStyle). Wtedy biblioteka (expo-router 57, react-navigation bottom-tabs w
// node_modules/expo-router/build/react-navigation/bottom-tabs/views/BottomTabBar.js, odczyt 2026-10-20) liczy
// wysokość 49 pt + insets.bottom i daje paddingBottom = insets.bottom; własne `height` w stylu wygrywa
// z tym wyliczeniem, dlatego jest zakazane.
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { StyleSheet } from 'react-native';

type Opcje = { tabBarStyle?: object; tabBarLabel?: (p: { color: string; position: string; children: string }) => React.ReactElement };
const przechwycone: { screenOptions?: Opcje } = {};

jest.mock('expo-router', () => {
  const ReactMod = jest.requireActual('react');
  const Tabs = ({ screenOptions, children }: { screenOptions: Opcje; children: React.ReactNode }) => {
    przechwycone.screenOptions = screenOptions;
    return ReactMod.createElement(ReactMod.Fragment, null, children);
  };
  Tabs.Screen = () => null;
  return { Tabs };
});

// eslint-disable-next-line @typescript-eslint/no-require-imports
const TabsLayout = require('../app/(tabs)/_layout').default;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getTabBarHeight } = require('expo-router/build/react-navigation/bottom-tabs/views/BottomTabBar');

describe('054: pasek zakładek i wskaźnik Home', () => {
  beforeAll(() => {
    act(() => {
      renderer.create(<TabsLayout />);
    });
  });

  it('tabBarStyle nie nadpisuje wysokości ani odstępów paska', () => {
    const styl = StyleSheet.flatten(przechwycone.screenOptions?.tabBarStyle) ?? {};
    expect(styl).not.toHaveProperty('height');
    expect(styl).not.toHaveProperty('paddingBottom');
    expect(styl).not.toHaveProperty('paddingTop');
  });

  it('przy wskaźniku Home (inset 34 pt) pasek ma wysokość z marginesem systemu', () => {
    const insets = { top: 47, bottom: 34, left: 0, right: 0 };
    const state = { index: 0, routes: [{ key: 'index', name: 'index' }] };
    const descriptors = { index: { options: { tabBarStyle: przechwycone.screenOptions?.tabBarStyle } } };
    const h = getTabBarHeight({ state, descriptors, dimensions: { width: 390, height: 844 }, insets, style: przechwycone.screenOptions?.tabBarStyle });
    expect(h).toBeGreaterThanOrEqual(49 + insets.bottom);
  });

  it('etykieta zakładki nie ma limitu linii ani zmniejszania kroju', () => {
    const Etykieta = przechwycone.screenOptions?.tabBarLabel;
    expect(Etykieta).toBeDefined();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(Etykieta!({ color: '#000000', position: 'below-icon', children: 'Receptury' }));
    });
    const tekst = tree.root.findByType(require('react-native').Text);
    expect(tekst.props.numberOfLines).toBeUndefined();
    expect(tekst.props.adjustsFontSizeToFit).toBeFalsy();
  });
});
