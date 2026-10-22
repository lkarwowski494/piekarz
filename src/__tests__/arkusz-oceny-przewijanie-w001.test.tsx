/**
 * 04-studio-projektowe-001 (P0, weryfikacja W przebiegu M3): arkusz oceny po ostatnim kroku miał ok. 959 pt treści
 * w zwykłym View wycentrowanym w SafeAreaView. Na wąskim ekranie (320×568) i przy AX5 „Zapisz” wypadał poza ekran
 * i wypieku nie dało się zakończyć. Teraz treść jest w ScrollView (keyboardShouldPersistTaps="handled", CLAUDE.md §1.4),
 * a „Anuluj” i „Zapisz” stoją pod nią, poza przewijaną częścią, więc są osiągalne przy każdej wysokości treści.
 * Test renderu nie mierzy pikseli: sprawdza układ, który gwarantuje osiągalność, przy oknie 320×568 i skali AX5.
 */
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  return {
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: unknown }) => React.createElement('View', { style }, children),
    useSafeAreaInsets: () => ({ top: 0, left: 0, right: 0, bottom: 0 }),
  };
});

import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import * as RN from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { FinishBakeModal } from '../components/stolnica/FinishBakeModal';
import { DEFAULT_BREAD_SENSORY_PROFILE } from '../components/SensoryRadarChart';

const textOf = (n: unknown): string => {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(textOf).join('');
  if (n && typeof n === 'object' && 'props' in n) return textOf((n as { props: { children?: unknown } }).props.children);
  return '';
};

function renderArkusz(onSave: jest.Mock, onClose: jest.Mock) {
  let tree: renderer.ReactTestRenderer | null = null;
  act(() => {
    tree = renderer.create(
      <FinishBakeModal
        visible
        onClose={onClose}
        onSave={onSave}
        rating={4}
        onRatingChange={jest.fn()}
        notes=""
        onNotesChange={jest.fn()}
        crumbScore={3}
        onCrumbScoreChange={jest.fn()}
        crustScore={3}
        onCrustScoreChange={jest.fn()}
        tasteProfile="balanced"
        onTasteProfileChange={jest.fn()}
        sensoryProfile={DEFAULT_BREAD_SENSORY_PROFILE}
        onSensoryProfileChange={jest.fn()}
      />,
    );
  });
  return tree!;
}

describe('04-studio-projektowe-001: arkusz oceny przewija się, „Zapisz” zawsze osiągalny', () => {
  beforeEach(() => {
    // iPhone SE 1. gen. (320×568 pt) i AX5 (fontScale ok. 3,57)
    jest.spyOn(RN, 'useWindowDimensions').mockReturnValue({ width: 320, height: 568, scale: 2, fontScale: 3.57 });
  });
  afterEach(() => jest.restoreAllMocks());

  it('treść arkusza jest w ScrollView z keyboardShouldPersistTaps="handled"', () => {
    const tree = renderArkusz(jest.fn(), jest.fn());
    const przewijane = tree.root.findAllByType(ScrollView);
    expect(przewijane).toHaveLength(1);
    expect(przewijane[0].props.keyboardShouldPersistTaps).toBe('handled');
    // Pytanie, notatki i radar są w przewijanej części
    expect(textOf(przewijane[0])).toContain('Jak wyszedł bochenek?');
    expect(przewijane[0].findAllByProps({ testID: 'finish-sensory-radar' }).length).toBeGreaterThan(0);
  });

  it('„Zapisz” i „Anuluj” są poza przewijaną treścią, przewijana część ma flex 1 (nie wypycha przycisków)', () => {
    const tree = renderArkusz(jest.fn(), jest.fn());
    const przewijane = tree.root.findByType(ScrollView);
    expect(textOf(przewijane)).not.toContain('Zapisz');
    expect(textOf(przewijane)).not.toContain('Anuluj');
    expect(StyleSheet.flatten(przewijane.props.style)?.flex).toBe(1);
  });

  it('„Zapisz” jest w drzewie dostępności jako przycisk i stuknięcie zapisuje', () => {
    const onSave = jest.fn();
    const tree = renderArkusz(onSave, jest.fn());
    const zapisz = tree.root.findAll(
      (n) => n.props?.accessibilityRole === 'button' && typeof n.props?.onPress === 'function' && textOf(n.props.children) === 'Zapisz',
    );
    expect(zapisz.length).toBeGreaterThan(0);
    expect(zapisz[0].props.accessible).not.toBe(false);
    act(() => zapisz[0].props.onPress());
    expect(onSave).toHaveBeenCalledTimes(1);
  });
});
