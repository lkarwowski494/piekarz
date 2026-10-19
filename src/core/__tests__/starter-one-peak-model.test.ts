/**
 * Jeden model szczytu zakwasu: odznaka fazy i komunikat predyktora pochodzą z jednego okna
 * (predictStarterPeak) [M1-audytor-generalny-044; 06-tresci-007]. Fazy liczone z samego czasu
 * (2/5/9/14 h, ZAK-SZC-901) wycofane. Wektory i teksty z wyniku roli 06 (docs/tresci/pl/zakwas-szczyt.md).
 */
import * as fs from 'fs';
import * as path from 'path';
import { calculateStarterPhase } from '../sourdough-physics';
import { predictStarterPeak } from '../starter-peak-predictor';

const H = 3600 * 1000;
const T0 = Date.UTC(2026, 9, 19, 6, 0, 0);
type Ratio = [number, number, number];

const state = (ratio: Ratio, temp: number, hours: number) => {
  const now = T0 + hours * H;
  const p = predictStarterPeak({ lastFedAt: T0, now, ratio, currentTempC: temp, flourGrain: 'wheat' });
  const phase = calculateStarterPhase(T0, 'ROOM_TEMP', now, { start: p.peakWindowStartTimestamp, end: p.peakWindowEndTimestamp });
  return { p, phase };
};

const content = (lang: 'pl' | 'en') =>
  fs
    .readFileSync(path.join(__dirname, '../../..', 'docs/tresci', lang, 'zakwas-szczyt.md'), 'utf8')
    .split('\n')
    .filter((l) => /\[T:[^\]]*\]\s*$/.test(l) && !l.startsWith('<!--'))
    .map((l) => l.replace(/\s*\[T:[^\]]*\]\s*$/, ''));

describe('jeden model szczytu zakwasu', () => {
  it('niezmiennik: peak ⇔ isCurrentlyInPeak, after ⇔ hasPassedPeak (proporcje × 20–26 °C × 0–24 h)', () => {
    const ratios: Ratio[] = [[1, 1, 1], [1, 2, 2], [1, 5, 5], [1, 10, 10]];
    for (const r of ratios)
      for (let temp = 20; temp <= 26; temp++)
        for (let h = 0; h <= 24; h += 0.5) {
          const { p, phase } = state(r, temp, h);
          expect(phase.phase === 'peak').toBe(p.isCurrentlyInPeak);
          expect(phase.phase === 'after').toBe(p.hasPassedPeak);
          expect(['before', 'peak', 'after']).toContain(phase.phase);
        }
  });

  it('wektory roli 06', () => {
    const a = state([1, 5, 5], 20, 6);
    expect([a.p.estimatedPeakHoursMin, a.p.estimatedPeakHoursMax, a.phase.phase]).toEqual([10.8, 15.4, 'before']);
    const b = state([1, 1, 1], 26, 8);
    expect([b.p.estimatedPeakHoursMin, b.p.estimatedPeakHoursMax, b.phase.phase]).toEqual([2.8, 3.9, 'after']);
    expect(state([1, 2, 2], 22, 4).phase.phase).toBe('before');
    expect(state([1, 2, 2], 22, 7).phase.phase).toBe('peak');
    expect(state([1, 5, 5], 22, 8).phase.phase).toBe('before');
  });

  it('teksty odznaki, porady i statusu z pliku treści (bez „idealny moment”)', () => {
    const pl = content('pl');
    const [labBefore, labPeak, labAfter, advBefore, advPeak, advAfter, , stPeak] = pl;
    const b = state([1, 2, 2], 22, 4);
    const k = state([1, 2, 2], 22, 7);
    const a = state([1, 2, 2], 22, 12);
    expect([b.phase.labelPl, k.phase.labelPl, a.phase.labelPl]).toEqual([labBefore, labPeak, labAfter]);
    expect([b.phase.advicePl, k.phase.advicePl, a.phase.advicePl]).toEqual([advBefore, advPeak, advAfter]);
    expect(k.p.statusMessagePl).toBe(stPeak);
    expect(b.p.statusMessagePl).toMatch(/^Do szacowanego okna szczytu zostało ok\. .+ \(okno: .+\)\.$/);
    expect(a.p.statusMessagePl).toMatch(/^Szacowane okno szczytu minęło ok\. .+ temu\.$/);
    for (const s of [k.p.statusMessagePl, k.phase.labelPl, k.phase.advicePl]) expect(s).not.toMatch(/idealny moment/i);
  });

  it('bez okna z zewnątrz faza liczy się z domyślnego okna predyktora (ta sama definicja)', () => {
    const now = T0 + 7 * H;
    const p = predictStarterPeak({ lastFedAt: T0, now });
    expect(calculateStarterPhase(T0, 'ROOM_TEMP', now).phase === 'peak').toBe(p.isCurrentlyInPeak);
  });
});
