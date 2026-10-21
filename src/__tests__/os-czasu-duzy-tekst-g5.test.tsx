/**
 * Oś czasu planu przy dużym tekście: kolumna godzin miała stałe 65 pt, więc przy Dynamic Type „09:45 – 13:45”
 * i plakietka dnia łamały się na litery. Szerokość rośnie z fontScale, a przy fontScale ≥ 2 (AX1–AX5, jak ekran
 * zakupu 200) godziny idą nad treścią kroku w pełnej szerokości, bez kolumny kropek [audyt-niezalezny G-5].
 */
import React from 'react';
import { StyleSheet } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { TimelineStagesList } from '../components/harmonogram/TimelineStagesList';
import type { ScheduledStage } from '../scheduler/reverse-scheduler';

let mockFontScale = 1;
jest.mock('react-native/Libraries/Utilities/useWindowDimensions', () => ({
  __esModule: true,
  default: () => ({ width: 320, height: 568, scale: 2, fontScale: mockFontScale }),
}));

const etap = {
  id: 'bulk', namePl: 'Fermentacja', instructionsPl: 'Odstaw.', durationMinutes: 240, isPassive: true, isSleepCollision: false,
  startTime: new Date(2026, 9, 22, 9, 45), endTime: new Date(2026, 9, 22, 13, 45),
} as unknown as ScheduledStage;

function zamontuj(): renderer.ReactTestRenderer {
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(<TimelineStagesList stages={[etap]} formatTime={() => '09:45'} formatDayBadge={() => 'Dziś'} />);
  });
  return tree;
}
const kolumnaGodzin = (tree: renderer.ReactTestRenderer) =>
  StyleSheet.flatten(tree.root.findByProps({ testID: 'timeline-time-0' }).props.style);

describe('G-5: kolumna godzin osi czasu przy dużym tekście', () => {
  it('zwykły tekst: 65 pt jak w makiecie', () => {
    mockFontScale = 1;
    expect(kolumnaGodzin(zamontuj()).width).toBe(65);
  });

  it('fontScale 1,5: kolumna rośnie z tekstem (≈ 98 pt), nie zostaje 65 pt', () => {
    mockFontScale = 1.5;
    expect(kolumnaGodzin(zamontuj()).width).toBe(98);
  });

  it('fontScale 3,1 (AX5): godziny nad treścią, bez stałej szerokości i bez kolumny kropek', () => {
    mockFontScale = 3.1;
    const tree = zamontuj();
    const styl = kolumnaGodzin(tree);
    expect(styl.width).toBeUndefined();
    expect(StyleSheet.flatten(tree.root.findByProps({ testID: 'timeline-item-0' }).props.style).flexDirection).toBe('column');
    expect(tree.root.findAllByProps({ testID: 'timeline-bullet-0' })).toHaveLength(0);
  });
});
