/**
 * Nazwy mąk w recepturach bazowych i w danych startowych spiżarni mówią tylko to, co atlas po 091 i 209:
 * bez siły mąki „W > …” (MAK-OGL-900), bez „chlebowa” przy żytniej 720 (MAK-TYP-903) i bez typu 630
 * orkiszowej (MAK-TYP-902). Zapisane receptury użytkownika zachowują nazwy; poza PL dawne nazwy dalej
 * prowadzą do profilu atlasu [M2-koordynator-napraw-451 (p12b2); M1-audytor-generalny-209, M1-audytor-generalny-091].
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { MASTER_RECIPES } from '../../recipes/presets';
import { FLOUR_PROFILES } from '../flour-atlas';
import { POPULAR_FLOUR_BLENDS } from '../domain-rules';
import { nazwaMakiMieszanki } from '../../lib/nazwa-maki-mieszanki';
import { setLang } from '../../lib/i18n';
import { BREAD_SCHOOL_LESSONS } from '../bread-school-lessons';

const ZAKAZANE = [/W\s*>\s*\d/, /chlebowa typ 720/, /typ 630/, /jasna typ 630/, /chlebowa jasna/, /żytnia razowa/, /chlebowa typ 650/, /wysokobiałkowa/];
const nazwyPresetow = [
  ...MASTER_RECIPES.flatMap((r) => r.formula.flours.map((f) => f.name)),
  // gotowe mieszanki („Wstaw gotową mieszankę”) to te same dane aplikacji
  ...POPULAR_FLOUR_BLENDS.flatMap((b) => b.flours.map((f) => f.name)),
];
const schemat = readFileSync(join(__dirname, '../../data/sqlite-schema.ts'), 'utf8');
const nazwySpizarni = [...schemat.matchAll(/id: 'flour_inv_[^']+',\s*name: '([^']+)'/g)].map((m) => m[1]);

describe('451: nazwy mąk receptur bazowych i spiżarni', () => {
  afterEach(() => setLang('pl'));

  it('dane startowe spiżarni są w teście', () => {
    expect(nazwySpizarni.length).toBeGreaterThanOrEqual(3);
  });

  it.each([...new Set([...nazwyPresetow, ...nazwySpizarni])])('„%s” bez twierdzeń spoza rejestru', (n) => {
    for (const z of ZAKAZANE) expect(n).not.toMatch(z);
  });

  // Lekcje Szkoły chleba i wszystkie typy presetów z profilem atlasu [M2-koordynator-napraw-p13a-001]
  it.each(BREAD_SCHOOL_LESSONS.map((l) => [l.id, l.flourBlendPl, l.flourBlendEn]))('lekcja %s: skład mąk bez twierdzeń spoza rejestru', (_id, pl, en) => {
    for (const z of ZAKAZANE) expect(pl).not.toMatch(z);
    expect(en).not.toMatch(/W\s*>\s*\d/);
  });

  it('każda mąka presetu z typem z profilem atlasu ma nazwę profilu (650 Bułkowa, 1850 Graham, 550 Luksusowa, razowa 2000)', () => {
    const PROFIL: Record<string, string> = { pszenna_550: 'wheat_550', pszenna_650: 'wheat_650', pszenna_750: 'wheat_750', pszenna_graham: 'wheat_1850', pszenna_razowa: 'wheat_2000', zytnia_2000: 'rye_2000', orkisz_2000: 'spelt_2000' };
    const atlas = (id: string) => FLOUR_PROFILES.find((p) => p.id === id)!.namePl;
    for (const r of MASTER_RECIPES) for (const f of r.formula.flours) if (f.type && PROFIL[f.type]) expect(`${r.id}: ${f.name}`).toBe(`${r.id}: ${atlas(PROFIL[f.type])}`);
  });

  it('Manitoba, żytnia 720 i orkiszowa w presetach mają nazwę profilu atlasu', () => {
    const atlas = (id: string) => FLOUR_PROFILES.find((p) => p.id === id)!.namePl;
    const typy = new Map(MASTER_RECIPES.flatMap((r) => r.formula.flours.map((f) => [f.name, f.type] as const)));
    for (const [n, typ] of typy) {
      if (typ === 'pszenna_manitoba') expect(n).toBe(atlas('wheat_manitoba'));
      if (typ === 'zytnia_720') expect(n).toBe(atlas('rye_720'));
      if (typ === 'orkisz_630') expect(n).toBe(atlas('spelt_630'));
    }
  });

  it.each([
    'Mąka pszenna Manitoba / Forte (W > 350)',
    'Mąka pszenna Manitoba / Forte (W > 300)',
    'Mąka pszenna wysokobiałkowa (W>280 / Manitoba)',
    'Mąka żytnia chlebowa typ 720',
    'Mąka orkiszowa jasna typ 630',
    'Mąka pszenna typ 650 (chlebowa jasna)',
    'Mąka pszenna graham typ 1850',
    'Mąka pszenna luksusowa typ 550',
    'Mąka pszenna pełnoziarnista typ 2000',
  ])('zapisana dawna nazwa „%s” poza PL pokazuje nazwę ogólną profilu, nie tekst polski', (dawna) => {
    setLang('en');
    expect(nazwaMakiMieszanki({ name: dawna }, 'en')).not.toMatch(/[ąćęłńóśźż]|Mąka|typ/);
    setLang('pl');
    expect(nazwaMakiMieszanki({ name: dawna }, 'pl')).toBe(dawna);
  });
});
