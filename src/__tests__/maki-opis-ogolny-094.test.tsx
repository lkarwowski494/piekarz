/**
 * Atlas mąk poza językiem z mapą typów [M1-audytor-generalny-094]: nazwa ogólna bez numeru typu
 * (OPIS_OGOLNY_MAK, rola 06), opis pod nazwą, notka o szacunku bez numeru typu, bez zdania o Polskich Normach.
 * Po polsku bez zmian: nazwa z typem i zdanie o normach. Dane receptury (name, type) bez zmian.
 */
import React from 'react';
import { Text } from 'react-native';
import renderer, { act } from 'react-test-renderer';
import { FlourBlendModal } from '../components/FlourBlendModal';
import { FLOUR_PROFILES } from '../core/flour-atlas';
import { OPIS_OGOLNY_MAK } from '../core/flour-atlas-ogolne';
import { setLang, t } from '../lib/i18n';
import { nazwaMaki, notaSzacunku, opisMaki, pokazZdanieONormach } from '../lib/nazwa-maki';

const tekst = (n: renderer.ReactTestInstance): string =>
  n.findAllByType(Text).map((x) => [].concat(x.props.children).filter((c) => typeof c === 'string').join('')).join(' | ');

const NUMER_TYPU = /\b(typ|type)\s?\d|\b(405|450|500|550|650|720|750|850|1050|1400|1850|2000)\b/i;

describe('Atlas mąk: opis ogólny poza pl (094)', () => {
  afterEach(() => setLang('pl'));

  it('helper: pl = nazwa z typem, en = nazwa ogólna ze słownika', () => {
    const p = FLOUR_PROFILES.find((f) => f.id === 'wheat_650')!;
    expect(nazwaMaki(p, 'pl')).toBe(t(p.namePl));
    expect(opisMaki(p, 'pl')).toBe('');
    expect(pokazZdanieONormach('pl')).toBe(true);
    setLang('en');
    expect(nazwaMaki(p, 'en')).toBe(t(OPIS_OGOLNY_MAK.wheat_650.nazwaPl));
    expect(nazwaMaki(p, 'en')).not.toMatch(NUMER_TYPU);
    expect(opisMaki(p, 'en')).toBe(t(OPIS_OGOLNY_MAK.wheat_650.opisPl));
    expect(pokazZdanieONormach('en')).toBe(false);
  });

  it('helper: nazwy wszystkich profili po angielsku bez numeru typu; notka o szacunku bez numeru', () => {
    setLang('en');
    for (const p of FLOUR_PROFILES) {
      expect(nazwaMaki(p, 'en')).not.toMatch(NUMER_TYPU);
      const nota = notaSzacunku(p, 'en');
      if (p.estimatedFromTyp === undefined) expect(nota).toBeNull();
      else expect(nota).not.toMatch(NUMER_TYPU);
    }
  });

  it('FlourBlendModal po angielsku: chipy z nazwą ogólną, bez zdania o Polskich Normach', async () => {
    setLang('en');
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <FlourBlendModal visible initialBlend={[{ name: 'Mąka pszenna typ 750 (Chlebowa)', percentage: 100, type: 'wheat_750' }]} onApply={jest.fn()} onClose={jest.fn()} />
      );
    });
    const root = tree!.root;
    const chip = tekst(root.findByProps({ testID: 'add-flour-wheat_650' }));
    expect(chip).toContain(t(OPIS_OGOLNY_MAK.wheat_650.nazwaPl));
    expect(chip).not.toMatch(NUMER_TYPU);
    expect(tekst(root)).not.toContain(t('Typy mąki pszennej i żytniej określają Polskie Normy PN-A-74022:2003 i PN-A-74032:2002 według zawartości popiołu.'));
    act(() => tree!.unmount());
  });

  it('FlourBlendModal po polsku bez zmian: nazwa z typem i zdanie o normach', async () => {
    let tree: renderer.ReactTestRenderer | null = null;
    await act(async () => {
      tree = renderer.create(
        <FlourBlendModal visible initialBlend={[{ name: 'Mąka pszenna typ 750 (Chlebowa)', percentage: 100, type: 'wheat_750' }]} onApply={jest.fn()} onClose={jest.fn()} />
      );
    });
    const root = tree!.root;
    const p = FLOUR_PROFILES.find((f) => f.id === 'wheat_650')!;
    expect(tekst(root.findByProps({ testID: 'add-flour-wheat_650' }))).toContain(p.namePl);
    expect(tekst(root)).toContain('Polskie Normy PN-A-74022:2003');
    act(() => tree!.unmount());
  });
});
