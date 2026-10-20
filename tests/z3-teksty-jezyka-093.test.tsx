// Z-3 z zadania 080 (M2, eksport web en-US): teksty zostające po polsku mimo innego języka aplikacji — etykiety
// radaru sensorycznego, szablony Doktora Chleba, nazwa mąki w wierszu mieszanki receptury, godziny profilu snu
// w formacie 24 h w en-US [M1-audytor-generalny-093].
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { setLang, t, type Lang } from '../src/lib/i18n';
import { SensoryRadarChart } from '../src/components/SensoryRadarChart';
import { SymptomSelectorSection, DIAGNOSTIC_PRESETS } from '../src/components/doktor/SymptomSelectorSection';
import { SLEEP_PROFILES, etykietaProfiluSnu } from '../src/components/harmonogram/TargetReadyCard';

const tekst = (tree: renderer.ReactTestRenderer) => JSON.stringify(tree.toJSON());

describe('Z-3: teksty w języku aplikacji (093)', () => {
  afterEach(() => act(() => setLang('pl')));

  it.each<Lang>(['en', 'de'])('radar sensoryczny: etykiety osi i kroków w języku %s', (l) => {
    act(() => setLang(l));
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <SensoryRadarChart profile={{ crustCrispness: 3, crumbElasticity: 3, acidity: 3, openCrumb: 3, caramelization: 3 }} interactive onChangeProfile={() => undefined} />
      );
    });
    expect(tekst(tree)).toContain(t('Chrupkość'));
    expect(tekst(tree)).toContain(t('Sprężystość'));
    expect(tekst(tree)).not.toContain('Chrupkość');
    act(() => tree.unmount());
  });

  it('szablony Doktora Chleba: nazwy w języku aplikacji (en)', () => {
    act(() => setLang('en'));
    let tree!: renderer.ReactTestRenderer;
    act(() => {
      tree = renderer.create(
        <SymptomSelectorSection symptoms={{}} onToggleSymptom={() => undefined} onApplyPreset={() => undefined} hasAnySymptom={false} onClear={() => undefined} />
      );
    });
    for (const p of DIAGNOSTIC_PRESETS) expect(tekst(tree)).not.toContain(p.name);
    expect(tekst(tree)).toContain('Caverns (Underproofed)');
    act(() => tree.unmount());
  });

  it('profil snu: godziny w formacie regionu (pl 24 h, en 12 h), nie stały napis „23:00 – 06:30”', () => {
    expect(etykietaProfiluSnu(SLEEP_PROFILES[0])).toBe('23:00 – 06:30');
    act(() => setLang('en'));
    const en = etykietaProfiluSnu(SLEEP_PROFILES[0]);
    expect(en).toMatch(/11:00\s?PM – 0?6:30\s?AM/);
  });
});