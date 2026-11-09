/**
 * BR-ZAKW-003 „Przewidywanie z godzin” (ER-79) [M1-audytor-generalny-004; 01-odkrywanie-003]: bez reguły ze źródłem
 * dla okna szczytu (OP-39 [DO USTALENIA]) karta „Szczyt aktywności” z showPeakWindow={false} nie pokazuje fazy z okna
 * („Przed szacowanym szczytem”, „W szacowanym oknie szczytu”, „Po szacowanym szczycie”) ani rady wybranej według
 * fazy; znacznik pokazuje czas od dokarmienia. Faza w lodówce (ze źródłem) zostaje.
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { StarterPeakActivityCard } from '../components/zakwas/StarterPeakActivityCard';
import { calculateStarterPhase } from '../core/sourdough-physics';
import { predictStarterPeak } from '../core/starter-peak-predictor';

function tekst(n: unknown): string {
  if (typeof n === 'string' || typeof n === 'number') return String(n);
  if (Array.isArray(n)) return n.map(tekst).join(' ');
  const o = n as { children?: unknown } | null;
  return o?.children ? tekst(o.children) : '';
}
const T0 = 1_800_000_000_000;
const H = 3_600_000;

function karta(godziny: number, temp: number, miejsce: 'ROOM_TEMP' | 'FRIDGE' = 'ROOM_TEMP') {
  const now = T0 + godziny * H;
  let tree!: renderer.ReactTestRenderer;
  act(() => {
    tree = renderer.create(
      <StarterPeakActivityCard
        phaseResult={calculateStarterPhase(T0, miejsce, now)}
        peakPrediction={predictStarterPeak({ lastFedAt: T0, now, ambientTempC: temp } as Parameters<typeof predictStarterPeak>[0])}
        showPeakWindow={false}
        pokazTemperature={miejsce !== 'FRIDGE'}
        ambientTempC={temp}
        onAmbientTempChange={() => undefined}
        unitSystem="metric"
      />
    );
  });
  const t = tekst(tree.toJSON());
  act(() => tree.unmount());
  return t;
}

describe('M1-audytor-generalny-004: karta szczytu bez fazy z okna bez źródła', () => {
  it.each([0, 3, 6, 7, 9, 12, 24])('na blacie %i h po dokarmieniu: bez fazy z okna i bez rady według fazy; czas od dokarmienia', (h) => {
    for (const temp of [19, 22, 25, 28]) {
      const t = karta(h, temp);
      expect(t).not.toMatch(/szacowan\w* szczyt|okn\w* szczytu/i);
      expect(t).toContain('od dokarmienia');
    }
  });

  it('w lodówce faza ze źródłem zostaje („Uśpiony w lodówce”)', () => {
    expect(karta(48, 22, 'FRIDGE')).toContain('Uśpiony w lodówce');
  });
});
