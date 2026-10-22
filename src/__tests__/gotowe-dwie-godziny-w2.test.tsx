/**
 * W-fix2, 04-studio-projektowe-008 opcja (b) wg rekomendacji (M1): godzina „gotowe” w planie zmienia się nie tylko
 * o ±30 min, ale też o ±2 h, więc 10:00 → 18:00 to 4 stuknięcia zamiast 16. Napisy z istniejącego klucza „{n} godziny”
 * (bez nowych tekstów). Na wąskim ekranie (320 pt) ±2 h w rzędzie pod polem razem z ±30 min.
 */
const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { TargetReadyCard } from '../components/harmonogram/TargetReadyCard';

const przycisk = (root: renderer.ReactTestInstance, tekst: string) =>
  root.findAll((n) => typeof n.type !== 'string' && n.props.accessibilityRole === 'button' && typeof n.props.onPress === 'function'
    && n.findAllByType(Text).some((x) => [x.props.children].flat().join('') === tekst));

describe('008: ±2 h przy godzinie „gotowe”', () => {
  it.each([390, 320])('szerokość %i pt: „+2 godziny” i „-2 godziny” zmieniają godzinę o 120 min; 8 h w 4 stuknięciach', (szer) => {
    Object.assign(mockOkno, { width: szer });
    const zmiana = jest.fn();
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <TargetReadyCard targetDayOffset={1} onTargetDayOffsetChange={jest.fn()} targetHour={10} targetMinute={0} onAdjustTargetTime={zmiana}
          formattedDayBadge="jutro" ambientTemp={23} onAmbientTempChange={jest.fn()} unitSystem="metric" />,
      );
    });
    const plus = przycisk(tree.root, '+2 godziny');
    const minus = przycisk(tree.root, '-2 godziny');
    expect(plus.length).toBeGreaterThan(0);
    expect(minus.length).toBeGreaterThan(0);
    for (let i = 0; i < 4; i++) act(() => plus[0].props.onPress());
    act(() => minus[0].props.onPress());
    expect(zmiana.mock.calls.map((c) => c[0])).toEqual([120, 120, 120, 120, -120]);
    expect(przycisk(tree.root, '+30 min').length).toBeGreaterThan(0);
    act(() => tree.unmount());
  });
});
