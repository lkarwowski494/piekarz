/**
 * Ekran Zakwas: proporcja wybrana przy „Zarejestruj dokarmienie” jest zapisywana, a predykcja szczytu po
 * ponownym otwarciu ekranu liczy się z zapisanej proporcji, nie z domyślnej 1:2:2 [M1-audytor-generalny-023; 05-architekt-009].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import ZakwasScreen from '../../app/(tabs)/zakwas';
import * as predictor from '../core/starter-peak-predictor';
import { initDatabase, getStarters, _resetMemStore } from '../data/sqlite-store';
import { zUprawnieniem } from '../../tests/helpers/platnosci';

jest.setTimeout(20000);

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: any) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

const textOf = (n: any): string =>
  typeof n === 'string' || typeof n === 'number' ? String(n) : Array.isArray(n) ? n.map(textOf).join('') : n?.props?.children ? textOf(n.props.children) : '';

const pressByText = async (tree: renderer.ReactTestRenderer, text: string) => {
  const btn = tree.root.findAll((n) => typeof n.props?.onPress === 'function').find((p) => textOf(p.props.children).includes(text));
  expect(btn).toBeDefined();
  await act(async () => {
    btn!.props.onPress();
  });
};

const render = async () => {
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<ZakwasScreen />);
  });
  await act(async () => {
    await Promise.resolve();
  });
  return tree!;
};

describe('proporcja dokarmiania na ekranie Zakwas', () => {
  beforeEach(async () => {
    zUprawnieniem();
    _resetMemStore();
    await initDatabase();
  });

  it('zapisuje wybraną proporcję przy dokarmieniu i predyktor używa jej po ponownym otwarciu', async () => {
    const spy = jest.spyOn(predictor, 'predictStarterPeak');
    let tree = await render();
    await pressByText(tree, '1:5:5');
    await pressByText(tree, 'Zarejestruj dokarmienie');
    expect((await getStarters())[0].feedingRatio).toBe('1:5:5');
    act(() => tree.unmount());

    spy.mockClear();
    tree = await render();
    expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ ratio: [1, 5, 5] }));
    act(() => tree.unmount());
    spy.mockRestore();
  });

  it('wybór proporcji bez dokarmienia nie zmienia predykcji bieżącego cyklu', async () => {
    const spy = jest.spyOn(predictor, 'predictStarterPeak');
    const tree = await render();
    await pressByText(tree, '1:1:1');
    expect(spy).toHaveBeenLastCalledWith(expect.objectContaining({ ratio: [1, 2, 2] }));
    act(() => tree.unmount());
    spy.mockRestore();
  });
});
