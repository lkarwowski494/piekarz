/**
 * Porada fazy „hungry” mówi o płynie na zakwasie tylko tyle, ile źródło (ZAK-HOO-001, CSU Extension):
 * zdania dosłownie z docs/tresci/{pl,en}/zakwas-bezpieczenstwo.md, z atrybucją, bez przyczyny „głód”.
 * Karta pokazuje poradę przez t(), więc w EN po angielsku [M1-audytor-generalny-013; ZAK-HOO-001; M2-koordynator-napraw-002].
 */
import * as fs from 'fs';
import * as path from 'path';
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { calculateStarterPhase } from '../../core/sourdough-physics';
import { StarterPeakActivityCard } from '../zakwas/StarterPeakActivityCard';
import { setLang, t } from '../../lib/i18n';

const registerLines = (lang: 'pl' | 'en') => {
  const md = fs.readFileSync(path.join(__dirname, '../../../docs/tresci', lang, 'zakwas-bezpieczenstwo.md'), 'utf8');
  return md
    .split('\n')
    .filter((l) => l.includes('[T:ZAK-HOO-001]'))
    .map((l) => l.replace('[T:ZAK-HOO-001]', '').trim());
};

const hungry = () => calculateStarterPhase(Date.now() - 20 * 3600 * 1000, 'ROOM_TEMP');

describe('porada fazy hungry a ZAK-HOO-001', () => {
  afterEach(() => setLang('pl'));

  it('PL: zawiera zdania rejestru z atrybucją i nie mówi o głodzie płynu', () => {
    const r = hungry();
    expect(r.phase).toBe('hungry');
    for (const s of registerLines('pl')) expect(r.advicePl).toContain(s);
    expect(r.advicePl).not.toMatch(/głodow/i);
  });

  it('EN: tłumaczenie zawiera zdania rejestru EN i nie mówi o głodzie płynu', () => {
    setLang('en');
    const en = t(hungry().advicePl);
    for (const s of registerLines('en')) expect(en).toContain(s);
    expect(en).not.toMatch(/hunger|hungry/i);
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
    const text = JSON.stringify(tree!.toJSON());
    expect(text).toContain(registerLines('en')[0]);
  });
});
