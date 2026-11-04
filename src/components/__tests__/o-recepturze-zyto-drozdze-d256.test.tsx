/** D-256: „O recepturze” wersji drożdżowej żyta pokazuje pieczenie ze źródła (ZYT-DRO-002), bez „para” [M3 p9b] */
import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { ORecepturze } from '../receptury/ORecepturze';
import { MASTER_RECIPES } from '../../recipes/presets';
import { setLang } from '../../lib/i18n';

const flat = (n: unknown): string =>
  typeof n === 'string' || typeof n === 'number' ? String(n) : Array.isArray(n) ? n.map(flat).join('') : n && typeof n === 'object' && 'props' in (n as object) ? flat((n as { props: { children?: unknown } }).props.children) : '';
async function tekst(pieczenie?: { temp1C: number; min1: number; temp2C: number; min2: number }) {
  setLang('pl');
  const r = MASTER_RECIPES.find((x) => x.id === 'rye_100_pan')!;
  let tree: renderer.ReactTestRenderer | null = null;
  await act(async () => {
    tree = renderer.create(<ORecepturze receptura={r} {...(pieczenie ? { pieczenie } : {})} />);
  });
  return tree!.root.findAllByType('Text' as never).map((x) => flat(x.props.children)).join('\n');
}

describe('O recepturze: pieczenie wersji drożdżowej żyta', () => {
  it('z danymi wersji: 240 °C, 10 min, 35 min w 220 °C; bez temperatur receptury na zakwasie i bez „para”', async () => {
    const r = MASTER_RECIPES.find((x) => x.id === 'rye_100_pan')!;
    const t = await tekst({ temp1C: 240, min1: 10, temp2C: 220, min2: 35 });
    const wiersz = t.split('\n').find((l) => l.startsWith('Pieczenie'))!;
    expect(wiersz).toContain('240');
    expect(wiersz).toContain('10 min');
    expect(wiersz).toContain('35 min w');
    expect(wiersz).toContain('220');
    expect(wiersz).not.toContain('para');
    expect(wiersz).not.toContain(String(r.bakeTempSteamC));
  });

  it('bez danych wersji: jak dotąd (para + rumienienie z receptury)', async () => {
    const t = await tekst();
    expect(t).toContain('para');
  });
});
