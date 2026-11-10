/**
 * BR-RECP-001 mówi tyle receptur, ile ma katalog w kodzie, i wskazuje D-236 (trzy warunkowe w rezerwie)
 * [M1-audytor-generalny-037; 01-odkrywanie-008]. OP-39 opisuje aktualny kod (ER-79).
 */
import fs from 'fs';
import path from 'path';
import { CATALOG_RECIPES } from '../src/recipes/katalog';

const BRD = path.join(__dirname, '..', 'docs', 'brd');

describe('037: BRD po 2026-11-03 nadąża za D-236 i kodem', () => {
  it('BR-RECP-001 „Katalog w 1.0”: liczba z kodu i D-236, bez „około 30”', () => {
    const t = fs.readFileSync(path.join(BRD, 'wymagania-dziennik.md'), 'utf8');
    const sekcja = t.split(/^### /m).find((s) => s.startsWith('BR-RECP-001'))!;
    expect(sekcja).not.toContain('około 30');
    expect(sekcja).toContain(`${CATALOG_RECIPES.length} receptur`);
    expect(sekcja).toContain('D-236');
  });
  it('OP-39 opisuje model okna z kodu (predictStarterPeak), nie progi faz', () => {
    const r = fs.readFileSync(path.join(BRD, 'README.md'), 'utf8');
    const op39 = r.split('\n').find((l) => l.startsWith('| OP-39 '))!;
    expect(op39).toContain('predictStarterPeak');
    expect(op39).not.toMatch(/2\/5\/9\/14/);
  });
});
