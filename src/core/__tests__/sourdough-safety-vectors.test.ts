/**
 * Karta bezpieczeństwa zakwasu według zasady ostrożności DEC-10 (a): wektory i niezmienniki roli 06
 * (docs/tresci/wektory/zakwas-bezpieczenstwo.json) [M1-audytor-generalny-013; 06-tresci-002, 06-tresci-003, 01-odkrywanie-003].
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { evaluateSourdoughSafety } from '../sourdough-physics';
import { t, setLang } from '../../lib/i18n';

interface Vector {
  wejscie: Record<string, boolean>;
  oczekiwany_status: string;
  k: string;
}
const file = path.join(__dirname, '../../../docs/tresci/wektory/zakwas-bezpieczenstwo.json');
const vectors: Vector[] = JSON.parse(fs.readFileSync(file, 'utf8')).wektory;

describe('Starter safety vectors K1–K6 (013, DEC-10 a)', () => {
  it('the vector file holds all 32 combinations', () => {
    expect(vectors).toHaveLength(32);
  });

  it.each(vectors.map((v) => [v.k, JSON.stringify(v.wejscie), v] as const))('%s %s', (_k, _in, v) => {
    const r = evaluateSourdoughSafety(v.wejscie);
    expect(r.status).toBe(v.oczekiwany_status);
    expect(Object.prototype.hasOwnProperty.call(r, 'isEdible') ? Reflect.get(r, 'isEdible') : false).toBe(false);
  });

  it('no result text says healthy, safe, harmless or edible (PL and EN) (BR-ZAKW-004 Brak zaznaczeń)', () => {
    for (const v of vectors) {
      const r = evaluateSourdoughSafety(v.wejscie);
      setLang('pl');
      expect(`${t(r.titlePl)} ${t(r.actionPl)}`).not.toMatch(/zdrow|bezpieczn|jadaln|nieszkodliw/i);
      setLang('en');
      expect(`${t(r.titlePl)} ${t(r.actionPl)}`).not.toMatch(/healthy|harmless|\bsafe\b|edible/i);
    }
    setLang('pl');
  });
});
