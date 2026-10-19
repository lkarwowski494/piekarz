/**
 * Rytuał z pierwszego uruchomienia: opis nie obiecuje ukrywania receptur, wybór zapisuje profil
 * (F-26, ZM-14, D-034 wybór 8a) [M1-audytor-generalny-032; 03-zakres-010].
 */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) =>
      React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { OnboardingModal } from '../OnboardingModal';
import { _resetMemStore, getBakerRitualProfile } from '../../data/sqlite-store';

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};

describe('OnboardingModal ritual', () => {
  beforeEach(() => {
    _resetMemStore();
  });

  it('says the ritual only sets the starting recipe filter and saves the chosen profile', async () => {
    const onComplete = jest.fn();
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<OnboardingModal visible onComplete={onComplete} />);
    });
    const root = tree!.root;
    const texts = root.findAll((n) => (n.type as unknown) === 'Text').map((n) => textOf(n.props.children));
    expect(texts).toContain(
      'Wybierz swój styl wypieku. Ustawi on startowy filtr receptur w Kalkulatorze; wszystkie receptury zostają dostępne.'
    );
    const pressables = root.findAll((n) => typeof n.props?.onPress === 'function');
    const purist = pressables.find((p) => textOf(p.props.children).includes('Klasyczny Zakwasowiec'));
    const start = pressables.find((p) => textOf(p.props.children).includes('Rozpocznij rytuał wypieku'));
    await act(async () => {
      purist!.props.onPress();
    });
    await act(async () => {
      await start!.props.onPress();
    });
    expect(onComplete).toHaveBeenCalledWith('sourdough_purist');
    expect(await getBakerRitualProfile()).toBe('sourdough_purist');
    act(() => tree!.unmount());
  });
});
