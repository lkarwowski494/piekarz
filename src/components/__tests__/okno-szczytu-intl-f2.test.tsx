/**
 * Okno szczytu zakwasu i czas do niego w języku aplikacji: godzina przez Intl (formatTime, EN-US 12 h),
 * czas trwania wspólnym formatem „{h} h {m} min” z kluczy i18n (czasTrwania), nie „3h 20 min” sklejone w rdzeniu
 * po polsku i z godziną 24 h [audyt-niezalezny F-2].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { calculateStarterPhase } from '../../core/sourdough-physics';
import { predictStarterPeak } from '../../core/starter-peak-predictor';
import { StarterPeakActivityCard } from '../zakwas/StarterPeakActivityCard';
import { setLang, t } from '../../lib/i18n';
import { formatTime } from '../../lib/format';
import { czasTrwania } from '../../lib/czas-trwania';

const NOW = new Date(2026, 9, 25, 9, 0).getTime();

async function teksty(lang: Parameters<typeof setLang>[0], lastFedAt: number) {
  setLang(lang);
  const p = predictStarterPeak({ lastFedAt, now: NOW, currentTempC: 22 });
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(
      <StarterPeakActivityCard
        phaseResult={calculateStarterPhase(lastFedAt, 'ROOM_TEMP')}
        peakPrediction={p}
        ambientTempC={22}
        onAmbientTempChange={() => {}}
        unitSystem="metric"
      />,
    );
  });
  const all = tree!.root.findAllByType('Text' as never).map((n) => [n.props.children].flat().join(''));
  return { p, all };
}

describe('karta szczytu zakwasu: godziny i czas przez Intl i i18n (F-2)', () => {
  afterEach(() => setLang('pl'));

  it('EN: okno szczytu w formacie godziny języka, czas do okna „{h} h {m} min” z kluczy EN', async () => {
    const { p, all } = await teksty('en', NOW - 30 * 60 * 1000);
    const okno = `${formatTime(p.peakWindowStartTimestamp)} – ${formatTime(p.peakWindowEndTimestamp)}`;
    expect(all).toContain(okno);
    const czas = czasTrwania(p.remainingMinutesToPeakWindow).tekst;
    expect(all).toContain(t('Do szacowanego okna szczytu zostało ok. {czas} (okno: {okno}).', { czas, okno }));
    expect(all.join('\n')).not.toMatch(/\dh \d/);
  });

  it('PL: czas po oknie wspólnym formatem („h” ze spacją niełamiącą), nie „3h 20 min”', async () => {
    const { p, all } = await teksty('pl', NOW - 20 * 3600 * 1000);
    expect(p.hasPassedPeak).toBe(true);
    const min = Math.round((NOW - p.peakWindowEndTimestamp) / 60000);
    expect(all).toContain(t('Szacowane okno szczytu minęło ok. {czas} temu.', { czas: czasTrwania(min).tekst }));
    expect(all.join('\n')).not.toMatch(/\dh \d/);
  });
});
