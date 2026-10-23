// ============================================================================
// PRZ-10 (przegląd roli 04, D-108): rząd dni „gotowe” w planie. (1) Wybrany dzień spoza ekranu (skrót, rytm Dziennika,
// np. +9) jest przewijany do widoku po pierwszym układzie chipa; (2) przy dużym tekście (fontScale ≥ 2) chipy się
// zawijają zamiast przewijać w poziomie; (3) chip ma promień z tokenu `promienie.chip`.
// ============================================================================
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { TargetReadyCard } from '../harmonogram/TargetReadyCard';
import { odstepy, promienie } from '../../ui/tokeny';

const mockOkno = { width: 390, height: 844, scale: 3, fontScale: 1 };
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({ __esModule: true, default: () => mockOkno }));

function render(offset: number) {
  let t!: renderer.ReactTestRenderer;
  act(() => {
    t = renderer.create(
      <TargetReadyCard targetDayOffset={offset} onTargetDayOffsetChange={() => undefined} targetHour={8} targetMinute={0}
        onAdjustTargetTime={() => undefined} formattedDayBadge="Dziś" ambientTemp={23} onAmbientTempChange={() => undefined} unitSystem="metric" />
    );
  });
  return t;
}
const chip = (t: renderer.ReactTestRenderer, offset: number) => t.root.findAll((n) => n.props?.testID === `plan-dzien-${offset}` && typeof n.props.onPress === 'function' && n.props.accessibilityRole === 'button')[0];

describe('PRZ-10: rząd dni „gotowe”', () => {
  beforeEach(() => {
    mockOkno.fontScale = 1;
  });

  it('wybrany dzień leży poza ekranem: po układzie chipa rząd przewija się do niego', () => {
    const t = render(9);
    expect(t.root.findAllByType(ScrollView).some((s) => s.props.horizontal === true)).toBe(true);
    const przewijany = (t.root.findAllByType(ScrollView).find((s) => s.props.horizontal === true)!.instance as unknown as { scrollTo: jest.Mock });
    przewijany.scrollTo.mockClear();
    act(() => chip(t, 9).props.onLayout({ nativeEvent: { layout: { x: 700, y: 0, width: 80, height: 44 } } }));
    expect(przewijany.scrollTo).toHaveBeenCalledWith({ x: 700 - odstepy.l, animated: false });
    act(() => t.unmount());
  });

  it('niewybrany chip nie przewija rzędu', () => {
    const t = render(0);
    expect(chip(t, 9).props.onLayout).toBeUndefined();
    act(() => t.unmount());
  });

  it('fontScale ≥ 2: chipy zawijane, bez przewijania w poziomie', () => {
    mockOkno.fontScale = 2.5;
    const t = render(3);
    expect(t.root.findAllByType(ScrollView).filter((s) => s.props.horizontal === true)).toHaveLength(0);
    const rzad = t.root.findAll((n) => n.props?.testID === 'plan-dni')[0];
    expect(StyleSheet.flatten(rzad.props.style).flexWrap).toBe('wrap');
    expect(chip(t, 9)).toBeDefined();
    act(() => t.unmount());
  });

  it('promień chipa z tokenu promienie.chip', () => {
    const t = render(0);
    expect(promienie.chip).toBe(22);
    const wyg = chip(t, 0);
    const styl = StyleSheet.flatten(wyg.props.style as never) as { borderRadius?: number };
    expect(styl.borderRadius).toBe(promienie.chip);
    act(() => t.unmount());
  });
});



