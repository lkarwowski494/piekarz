/**
 * Korpus Pythona to korpus regresji (odtwarza zachowanie kodu, ten sam próg 45 °C), nie niezależna wyrocznia:
 * README i nazwa testu tak go nazywają [M1-audytor-generalny-073; 07-jakosc-009].
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(__dirname, '..');
const czytaj = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

describe('073: korpus Pythona nazwany korpusem regresji', () => {
  it('README nie nazywa korpusu niezależnym', () => {
    const linia = czytaj('README.md').split('\n').find((l) => /korpus/i.test(l) && /Python/.test(l)) ?? '';
    expect(linia).toMatch(/korpus regresji/i);
    expect(linia).not.toMatch(/Niezależny/);
  });
  it('nazwa testu korpusu bez „Independent”', () => {
    const t = czytaj('src/core/__tests__/baking-physics-corpus.test.ts');
    expect(t).not.toMatch(/describe\('[^']*Independent/);
    expect(t).toMatch(/Regression Corpus/);
  });
});
