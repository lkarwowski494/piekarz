/**
 * M2-013 (D-308 pkt 2, D-310; DDT-WOD-001): rada przy zbyt gorącej wodzie zgodna z rachunkiem wzoru King Arthur
 * (Tw = n × DDT − suma znanych temperatur). Ogrzanie mąki obniża wynik `calculateDDTWaterTemp`, więc komunikat
 * too_hot_danger nie radzi „Schłodź mąkę” ani „obniż temperaturę otoczenia”; martwy klucz ze starą radą nie zostaje
 * w słowniku EN ani w 33 słownikach (komunikat liczony na bieżąco, nie zapisywany).
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { calculateDDTWaterTemp } from '../src/core/domain-rules';
import { EN } from '../src/lib/i18n.en';

const root = path.join(__dirname, '..');
const STARA_RADA = 'Schłodź mąkę lub obniż temperaturę otoczenia.';
// Wektor z dowodu D-310: DDT 25, mąka 15, kuchnia 18, zakwas z lodówki 5, tarcie 10 °C → 52 °C
const WEKTOR = { targetDDT: 25, flourTemp: 15, roomTemp: 18, starterTemp: 5, frictionFactor: 10 };

describe('M2-013 (D-310): rada przy zbyt gorącej wodzie', () => {
  it('wektor D-310: 52 °C, za gorąca', () => {
    expect(calculateDDTWaterTemp(WEKTOR)).toMatchObject({ waterTempTarget: 52, status: 'too_hot_danger' });
  });

  it('ogrzanie mąki obniża wynik stopień w stopień; schłodzenie go podnosi', () => {
    const w = (flourTemp: number) => calculateDDTWaterTemp({ ...WEKTOR, flourTemp }).waterTempTarget;
    expect(w(20)).toBe(47);
    expect(w(20)).toBeLessThan(w(15));
    expect(w(10)).toBeGreaterThan(w(15));
    // mąka i zakwas w 18 °C → 36 °C (D-310)
    expect(calculateDDTWaterTemp({ ...WEKTOR, flourTemp: 18, starterTemp: 18 })).toMatchObject({ waterTempTarget: 36, status: 'normal' });
  });

  it('komunikat too_hot_danger nie zawiera „Schłodź” ani „obniż temperaturę otoczenia”', () => {
    const r = calculateDDTWaterTemp(WEKTOR);
    expect(r.warningMessagePl).toBeDefined();
    expect(r.warningMessagePl).not.toMatch(/Schłodź/);
    expect(r.warningMessagePl).not.toMatch(/obniż temperaturę otoczenia/);
  });

  it('martwy klucz ze starą radą usunięty ze słownika EN', () => {
    expect(Object.keys(EN).filter((k) => k.includes(STARA_RADA))).toEqual([]);
  });

  it('martwy klucz ze starą radą usunięty z 33 słowników', () => {
    const kat = path.join(root, 'src', 'lib', 'i18n-slowniki');
    const jezyki = fs.readdirSync(kat, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name);
    expect(jezyki).toHaveLength(33);
    const zKluczem = jezyki.filter((j) =>
      fs.readdirSync(path.join(kat, j)).some((f) => fs.readFileSync(path.join(kat, j, f), 'utf8').includes(STARA_RADA)),
    );
    expect(zKluczem).toEqual([]);
  });
});
