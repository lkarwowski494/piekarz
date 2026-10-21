/**
 * BRD nadąża za D-068 (DEC-22 a): zakwas w lodówce ma jedno powiadomienie na cykl karmienia (7 dni), bez
 * przypomnienia po 6 dniach, a przełącznik „Przypomnienia o karmieniu” w Ustawieniach wyłącza tylko karmienie
 * [M2-koordynator-napraw-401 (p12d); M1-audytor-generalny-179].
 */
import { readFileSync } from 'fs';
import { join } from 'path';

const brd = readFileSync(join(__dirname, '../docs/brd/wymagania-zakwas.md'), 'utf8');
const sekcja = brd.slice(brd.indexOf('### BR-ZAKW-004'), brd.indexOf('### BR-ZAKW-005'));
const scenariusz = (nazwa: string) => {
  const od = sekcja.indexOf(`Scenariusz: ${nazwa}`);
  if (od < 0) return '';
  const dalej = sekcja.indexOf('Scenariusz:', od + 12);
  return sekcja.slice(od, dalej < 0 ? undefined : dalej);
};

describe('BR-ZAKW-004 według D-068 (p12d 401)', () => {
  it('Zakwas w lodówce: jedno powiadomienie po 7 dniach, bez przypomnienia po 6 dniach', () => {
    const s = scenariusz('Zakwas w lodówce');
    expect(s).toMatch(/jedno powiadomienie/);
    expect(s).toMatch(/D-068/);
    expect(s).not.toMatch(/6 dni/);
  });

  it('scenariusz przełącznika „Przypomnienia o karmieniu” w Ustawieniach: karmienie wyłączone, kroki wypieku zostają', () => {
    const s = scenariusz('Przypomnienia o karmieniu wyłączone');
    expect(s).toMatch(/Ustawieniach/);
    expect(s).toMatch(/powiadomienia o krokach wypieku przychodzą dalej/);
  });
});
