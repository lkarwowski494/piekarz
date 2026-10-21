/**
 * Ustawienia planu: czas w lodówce wspólnym formatem czasu trwania (klucz „{h} h”, design-spec §11c), nie „14h”
 * doklejone do liczby w każdym języku [audyt-niezalezny F-4].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { UstawieniaPlanu } from '../harmonogram/UstawieniaPlanu';
import { setLang } from '../../lib/i18n';
import { czasTrwania } from '../../lib/czas-trwania';

describe('czas w lodówce (F-4)', () => {
  afterEach(() => setLang('pl'));

  it.each(['pl', 'en', 'ja'] as const)('%s: „14 h” z klucza, bez „14h”', async (lang) => {
    setLang(lang);
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(<UstawieniaPlanu okno={null} coldRetardHours={14} onColdRetardHoursChange={() => {}} onCopySchedule={() => {}} />);
    });
    const teksty = tree!.root.findAllByType('Text' as never).map((n) => [n.props.children].flat().join(''));
    expect(teksty.join('\n')).not.toMatch(/\d+h\b/);
    expect(teksty).toContain(czasTrwania(14 * 60).tekst);
  });
});
