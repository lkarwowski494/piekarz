/**
 * Porada fazy „hungry” licznika szczytu (faza z samego czasu, bez obserwacji) nie mówi nic o płynie na zakwasie:
 * twierdzenie ZAK-HOO-001 należy tylko do karty oceny objawów, gdzie stoi z ostrzeżeniem o nalocie i granicą
 * „w razie wątpliwości wyrzuć”. Rejestr wyklucza związek płynu z „głodem” (docs/tresci/rejestr.json, ZAK-HOO-001).
 * Karta pokazuje poradę przez t(), więc w EN po angielsku [M1-audytor-generalny-013; ZAK-HOO-001; M2-koordynator-napraw-002].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { calculateStarterPhase } from '../../core/sourdough-physics';
import { StarterPeakActivityCard } from '../zakwas/StarterPeakActivityCard';
import { setLang, t } from '../../lib/i18n';

const LIQUID_PL = /płyn|hooch|głodow/i;
const LIQUID_EN = /liquid|hooch|hunger/i;

const hungry = () => calculateStarterPhase(Date.now() - 20 * 3600 * 1000, 'ROOM_TEMP');

describe('porada fazy hungry a ZAK-HOO-001', () => {
  afterEach(() => setLang('pl'));

  it('PL: porada fazy nie mówi o płynie ani o „płynie głodowym”', () => {
    const r = hungry();
    expect(r.phase).toBe('hungry');
    expect(r.advicePl).not.toMatch(LIQUID_PL);
  });

  it('EN: porada ma tłumaczenie i nie mówi o płynie', () => {
    setLang('en');
    const en = t(hungry().advicePl);
    expect(en).not.toBe(hungry().advicePl);
    expect(en).not.toMatch(LIQUID_EN);
  });

  it('karta w EN pokazuje poradę po angielsku', async () => {
    setLang('en');
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <StarterPeakActivityCard
          phaseResult={hungry()}
          peakPrediction={{ formattedWindowPl: '', progressPercent: 0, isCurrentlyInPeak: false, hasPassedPeak: true, statusMessagePl: '' }}
          ambientTempC={22}
          onAmbientTempChange={() => {}}
          unitSystem="metric"
          onLogFeeding={() => {}}
        />,
      );
    });
    expect(JSON.stringify(tree!.toJSON())).toContain(t(hungry().advicePl));
    setLang('pl');
    expect(t(hungry().advicePl)).toBe(hungry().advicePl);
  });
});
