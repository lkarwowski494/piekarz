/**
 * „O recepturze”: czasy pieczenia jednostką z kluczy („{n} min”), nie doklejone „22m” w każdym języku
 * [audyt-niezalezny F-4].
 */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ORecepturze } from '../receptury/ORecepturze';
import { MASTER_RECIPES } from '../../recipes/presets';
import { setLang } from '../../lib/i18n';

async function tekst(lang: Parameters<typeof setLang>[0]) {
  setLang(lang);
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<ORecepturze receptura={MASTER_RECIPES[0]} />);
  });
  const flat = (n: unknown): string =>
    typeof n === 'string' || typeof n === 'number' ? String(n) : Array.isArray(n) ? n.map(flat).join('') : n && typeof n === 'object' && 'props' in (n as object) ? flat((n as { props: { children?: unknown } }).props.children) : '';
  return tree!.root.findAllByType('Text' as never).map((x) => flat(x.props.children)).join('\n');
}

describe('O recepturze: minuty pieczenia (F-4)', () => {
  afterEach(() => setLang('pl'));

  it.each(['pl', 'en', 'de'] as const)('%s: bez „22m” doklejonego do liczby', async (lang) => {
    const r = MASTER_RECIPES[0];
    const t = await tekst(lang);
    expect(t).not.toMatch(/\d+m\b/);
    expect(t).toContain(String(r.bakeTimeSteamMinutes));
    expect(t).toContain(String(r.bakeTimeBrowningMinutes));
  });
});
