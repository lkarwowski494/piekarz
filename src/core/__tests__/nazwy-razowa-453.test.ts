/**
 * „razowa” w nazwie PL tylko tam, gdzie rejestr ma twierdzenie: MAK-OGL-007 nazywa razową mąkę pszenną typ 2000;
 * stopień przemiału żytniej i orkiszowej 2000 jest otwarty (MAK-OGL-901). Atlas, receptury bazowe, gotowe
 * mieszanki i dane startowe bez „razowa” przy żytniej i orkiszowej; dawne nazwy zapisanych receptur poza PL
 * prowadzą do profilu [M2-koordynator-napraw-453 (p12b2); M1-audytor-generalny-091].
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { FLOUR_PROFILES, matchFlourProfile } from '../flour-atlas';
import { POPULAR_FLOUR_BLENDS } from '../domain-rules';
import { MASTER_RECIPES } from '../../recipes/presets';
import { nazwaMakiMieszanki } from '../../lib/nazwa-maki-mieszanki';
import { EN } from '../../lib/i18n.en';
import { setLang } from '../../lib/i18n';

const ROOT = join(__dirname, '..', '..', '..');
const rejestr: { id: string; status: string }[] = JSON.parse(readFileSync(join(ROOT, 'docs/tresci/rejestr.json'), 'utf8'));
const potwierdzone = (id: string) => rejestr.find((r) => r.id === id)?.status === 'potwierdzone';
const schemat = readFileSync(join(ROOT, 'src/data/sqlite-schema.ts'), 'utf8');

describe('453: „razowa” tylko z twierdzeniem', () => {
  afterEach(() => setLang('pl'));

  it('atlas: „razowa” tylko przy pszennej (MAK-OGL-007), żytnia i orkiszowa 2000 bez niej, dopóki MAK-OGL-901 otwarte', () => {
    for (const p of FLOUR_PROFILES) {
      if (!/razow/.test(p.namePl)) continue;
      expect([p.id, potwierdzone('MAK-OGL-007')]).toEqual(['wheat_2000', true]);
    }
    if (!potwierdzone('MAK-OGL-901')) {
      expect(FLOUR_PROFILES.find((p) => p.id === 'rye_2000')!.namePl).toBe('Mąka żytnia typ 2000');
      expect(FLOUR_PROFILES.find((p) => p.id === 'spelt_2000')!.namePl).toBe('Mąka orkiszowa typ 2000');
    }
  });

  it('receptury bazowe, gotowe mieszanki i dane startowe: bez „razowa” przy żytniej i orkiszowej', () => {
    const nazwy = [
      ...MASTER_RECIPES.flatMap((r) => r.formula.flours.map((f) => f.name)),
      ...POPULAR_FLOUR_BLENDS.flatMap((b) => b.flours.map((f) => f.name)),
      ...[...schemat.matchAll(/(?:name|flourType): '([^']+)'/g)].map((m) => m[1]),
    ];
    expect(nazwy.filter((n) => /(żytnia|orkiszowa) razowa/i.test(n))).toEqual([]);
  });

  it('nowe nazwy mają wpis EN i dopasowanie do profilu 2000', () => {
    for (const [n, id] of [['Mąka żytnia typ 2000', 'rye_2000'], ['Mąka orkiszowa typ 2000', 'spelt_2000']] as const) {
      expect(typeof EN[n]).toBe('string');
      expect(matchFlourProfile(n).id).toBe(id);
    }
  });

  it.each(['Mąka żytnia razowa typ 2000', 'Mąka orkiszowa razowa typ 2000'])('dawna nazwa „%s”: PL bez zmian, poza PL nazwa ogólna', (dawna) => {
    expect(nazwaMakiMieszanki({ name: dawna }, 'pl')).toBe(dawna);
    setLang('en');
    expect(nazwaMakiMieszanki({ name: dawna }, 'en')).not.toMatch(/[ąćęłńóśźż]|Mąka/);
  });
});
